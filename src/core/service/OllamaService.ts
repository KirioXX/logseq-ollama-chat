import { LogseqProxy } from "@/logseq/LogseqProxy";
// import { DBService } from "./DBService";
import { Message, Ollama } from "ollama/browser";
import { LogseqPromptInvocationState, Prompt } from "@/types/Prompt";
import { getTools } from "@/ollama/tools/getTools";

export class OllamaService {
  private static _instance: OllamaService;
  private _initialized = false;

  private ollamaClient?: Ollama;
  private model?: string;

  private constructor() {}

  public static get Instance() {
    // Do you need arguments? Make it a regular static method instead.
    return this._instance || (this._instance = new this());
  }

  async init() {
    if (this._initialized) {
      return;
    }
    LogseqProxy.Settings.registerSettingsChangeListener(this._onSettingsChange);
    const settings = logseq.settings;
    this._onSettingsChange(settings, {});
    this._initialized = true;
  }

  private async _onSettingsChange(newSettings: any, oldSettings: any) {
    if (newSettings.host !== oldSettings.host) {
      if (newSettings.host && newSettings.host !== "") {
        const url = new URL(newSettings.host);
        this.ollamaClient = new Ollama({
          host: `${url.protocol}://${url.host}:${url.port}`,
        });
      } else {
        this.ollamaClient = new Ollama();
      }
    }

    if (newSettings.model !== oldSettings.model) {
      const isModelAvailable = await OllamaService._instance.isModelAvailable(
        newSettings.model
      );
      if (isModelAvailable) {
        OllamaService._instance.model = newSettings.model;
      } else {
        logseq.UI.showMsg(
          `Ollama Model ${newSettings.model} is not available`,
          "error"
        );
      }
    }
  }

  public async isModelAvailable(model: string) {
    if (!this.ollamaClient) {
      throw new Error("Ollama service not initialized");
    }

    const response = await this.ollamaClient.list();
    const modelNames = response.models.map((m) => m.name.split(":")[0]);
    const isModelAvailable = modelNames.includes(model);
    return isModelAvailable;
  }

  public async chat({
    messsages,
    prompt,
    invokeState,
  }: {
    messsages?: Message[];
    prompt?: Prompt;
    invokeState?: LogseqPromptInvocationState;
  }): Promise<Message[] | undefined> {
    if (!this.ollamaClient || !this.model) {
      throw new Error("Ollama service not initialized");
    }
    if (!prompt && !messsages) {
      throw new Error("Prompt or User Input is required");
    }

    const chatMessage: Message[] = [];
    const responseMessages: Message[] = [];

    if (prompt) {
      prompt?.getPromptPrefixMessages?.().forEach((m) => chatMessage.push(m));
      if (messsages) {
        chatMessage.push(...messsages);
      }
      prompt?.getPromptSuffixMessages?.().forEach((m) => chatMessage.push(m));
    } else {
      chatMessage.push(...messsages!);
    }

    console.log("Chat Message", chatMessage);
    const tools = getTools();
    const response = await this.ollamaClient?.chat({
      model: this.model,
      messages: chatMessage,
      format: "markdown",
      tools: tools.map((t) => t.tool),
    });

    if (!response) {
      logseq.UI.showMsg(
        "Error in Ollama request. Make sure that Ollama service is running and there is no typo in host or model name",
        "error"
      );
      return;
    }

    // Check if the model decided to use the provided function
    if (
      !response.message.tool_calls ||
      response.message.tool_calls.length === 0
    ) {
      console.log("The model didn't use the function. Its response was:");
      console.log(response.message.content);
      return [response.message];
    }

    // Process function calls made by the model
    if (response.message.tool_calls) {
      console.log("Function Calls", response.message.tool_calls);
      for (const tool of response.message.tool_calls) {
        const functionToCall = tools.find(
          (t) => t.tool.function.name === tool.function.name
        )?.call;
        const functionResponse = await functionToCall?.(
          tool.function.arguments
        );
        console.log("Function Response", functionResponse);
        if (!functionResponse) {
          continue;
        }
        // Add function response to the conversation
        const toolMessage = {
          role: "tool",
          content: functionResponse,
        };
        chatMessage.push(toolMessage);
        responseMessages.push(toolMessage);
      }
    }
    // Second API call: Get final response from the model
    const finalResponse = await this.ollamaClient.chat({
      model: this.model,
      messages: chatMessage,
      format: "markdown",
      tools: tools.map((t) => t.tool),
    });
    return [...responseMessages, finalResponse.message];
  }

  public async installModel(model: string) {
    if (!this.ollamaClient) {
      throw new Error("Ollama service not initialized");
    }

    console.log("Installing model", model);
    const stream = await this.ollamaClient.pull({ model, stream: true });
    let currentDigestDone = false;
    for await (const part of stream) {
      if (part.digest) {
        let percent = 0;
        if (part.completed && part.total) {
          percent = Math.round((part.completed / part.total) * 100);
        }
        process.stdout.clearLine(0); // Clear the current line
        process.stdout.cursorTo(0); // Move cursor to the beginning of the line
        process.stdout.write(`${part.status} ${percent}%...`); // Write the new text
        if (percent === 100 && !currentDigestDone) {
          console.log(); // Output to a new line
          currentDigestDone = true;
        } else {
          currentDigestDone = false;
        }
      } else {
        console.log(part.status);
      }
    }
  }
}
