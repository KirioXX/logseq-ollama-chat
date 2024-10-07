import { LogseqProxy } from "@/logseq/LogseqProxy";
// import { DBService } from "./DBService";
import { Message, Ollama } from "ollama/browser";
import { LogseqPromptInvocationState, Prompt } from "@/types/Prompt";

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
      if (!newSettings.host) {
        const url = new URL(newSettings.host);
        this.ollamaClient = new Ollama({
          host: `${url.protocol}://${url.host}:${url.port}`,
        });
      } else {
        this.ollamaClient = new Ollama();
      }
    }

    if (newSettings.model !== oldSettings.model) {
      const isModelAvailable = await OllamaService._instance._isModelAvailable(
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

  private async _isModelAvailable(model: string) {
    if (!this.ollamaClient) {
      throw new Error("Ollama service not initialized");
    }

    const response = await this.ollamaClient.list();
    const [modelNames, modelVersions] = response.models.map((m) =>
      m.name.split(":")
    );
    const isModelAvailable = modelNames.includes(model);
    return isModelAvailable;
  }

  async chat({
    messsages,
    prompt,
    invokeState,
  }: {
    messsages?: Message[];
    prompt?: Prompt;
    invokeState?: LogseqPromptInvocationState;
  }): Promise<Message | undefined> {
    if (!this.ollamaClient || !this.model) {
      throw new Error("Ollama service not initialized");
    }
    if (!prompt && !messsages) {
      throw new Error("Prompt or User Input is required");
    }

    const chatMessage: Message[] = [];

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
    const chatResponse = await this.ollamaClient?.chat({
      model: this.model,
      messages: chatMessage,
      stream: false,
      format: "markdown",
    });

    if (!chatResponse) {
      logseq.UI.showMsg(
        "Error in Ollama request. Make sure that Ollama service is running and there is no typo in host or model name",
        "error"
      );
      return;
    }
    return { role: "bot", content: chatResponse.message.content };
  }
}
