import { LogseqProxy } from "@/logseq/LogseqProxy";
import { Ollama } from "ollama/browser";

export class OllamaService {
  private static _instance: OllamaService;
  private _initialized = false;

  private ollamaClient?: Ollama;

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

  public async installModel(model: string) {
    if (!this.ollamaClient) {
      throw new Error("Ollama service not initialized");
    }

    console.log("Installing model", model);
    const stream = await this.ollamaClient.pull({ model, stream: true });
    let currentDigestDone = false;
    let messageKey;
    let lastPercent = 0;
    for await (const part of stream) {
      if (part.digest) {
        let percent = 0;
        if (part.completed && part.total) {
          percent = Math.round((part.completed / part.total) * 100);
        }
        if (percent !== lastPercent) {
          lastPercent = percent;
          if (messageKey) {
            await logseq.UI.closeMsg(messageKey);
          }
          messageKey = await logseq.UI.showMsg(
            `Download ${model}: ${part.status} ${percent}%...`,
            "info",
            {
              timeout: 0,
            }
          );
        }
        if (percent === 100 && !currentDigestDone) {
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
