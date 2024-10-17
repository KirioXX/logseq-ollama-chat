import { LogseqProxy } from "@/logseq/LogseqProxy";
import { Prompt } from "@/types/Prompt";
import { OllamaService } from "./OllamaService";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import {
  MemorySaver,
  CompiledStateGraph,
  StateDefinition,
  MessagesAnnotation,
} from "@langchain/langgraph/web";
import {
  AgentState,
  createReactAgent,
  ToolNode,
} from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { RunnableToolLike } from "@langchain/core/runnables";
import { StructuredToolInterface } from "@langchain/core/tools";

export class LangGraphService {
  private static _instance: LangGraphService;
  private _initialized = false;

  private _agentTools:
    | ToolNode<typeof MessagesAnnotation.State>
    | (StructuredToolInterface | RunnableToolLike)[] = [];
  private _agentModel?: ChatOllama;
  private _agentCheckpointer = new MemorySaver();
  private _agent?: CompiledStateGraph<
    AgentState,
    Partial<AgentState>,
    "__start__" | "agent" | "tools",
    StateDefinition,
    StateDefinition,
    StateDefinition
  >;

  private constructor() {}

  public static get Instance() {
    // Do you need arguments? Make it a regular static method instead.
    return this._instance || (this._instance = new this());
  }

  async init() {
    if (this._initialized) {
      return;
    }
    LogseqProxy.Settings.registerSettingsChangeListener(
      this._onSettingsChange.bind(this)
    );
    const settings = logseq.settings;
    this._onSettingsChange(settings, {});
    this._initialized = true;
  }

  private async _onSettingsChange(newSettings: any, oldSettings: any) {
    if (
      newSettings.host !== oldSettings.host ||
      newSettings.model !== oldSettings.model ||
      newSettings.tavily_api_key !== oldSettings.tavily_api_key
    ) {
      const isModelAvailable = await OllamaService.Instance.isModelAvailable(
        newSettings.model
      );
      if (!isModelAvailable) {
        logseq.UI.showMsg(
          `Ollama Model ${newSettings.model} is not available start downloading it`,
          "error",
          {}
        );
        await OllamaService.Instance.installModel(newSettings.model);
      }
      // Create tools
      if (newSettings.tavily_api_key && newSettings.tavily_api_key !== "") {
        this._agentTools = [
          new TavilySearchResults({
            maxResults: 3,
            apiKey: newSettings.tavily_api_key,
          }),
        ];
      }

      // Create model
      if (newSettings.host && newSettings.host !== "") {
        const url = new URL(newSettings.host);
        this._agentModel = new ChatOllama({
          baseUrl: url.toString(),
          model: newSettings.model,
          temperature: 0,
        });
      } else {
        this._agentModel = new ChatOllama({
          model: newSettings.model,
          temperature: 0,
        });
      }
      // Set agent
      this._agent = createReactAgent({
        llm: this._agentModel,
        tools: this._agentTools,
        checkpointSaver: this._agentCheckpointer,
      });
    }
  }

  public async chat({
    messsage,
    prompt,
  }: {
    messsage: HumanMessage;
    prompt?: Prompt;
  }): Promise<AIMessage | undefined> {
    if (!this._agent) {
      throw new Error("Langchain service not initialized");
    }
    if (!prompt && !messsage) {
      throw new Error("Prompt or User Input is required");
    }

    const chatMessage: Array<SystemMessage | HumanMessage> = [];

    if (prompt) {
      prompt?.getPromptPrefixMessages?.().forEach((m) => chatMessage.push(m));
      if (messsage) {
        chatMessage.push(messsage);
      }
      prompt?.getPromptSuffixMessages?.().forEach((m) => chatMessage.push(m));
    } else {
      chatMessage.push(messsage!);
    }

    console.log("Chat Message", chatMessage);
    const response = await this._agent?.invoke(
      { messages: chatMessage },
      { configurable: { thread_id: "42" }, debug: true }
    );
    console.log(response);
    return response.messages[response.messages.length - 1];
  }
}
