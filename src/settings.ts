import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";

export const addSettingsToLogseq = async () => {
  const settingsTemplate: SettingSchemaDesc[] = [
    {
      key: "host",
      type: "string",
      title: "Host",
      description: "Overwrite the host of your ollama model",
      default: null,
    },
    {
      key: "model",
      type: "enum",
      title: "LLM Model",
      description:
        "Set your desired model to use ollama (has to be able to call tools)",
      default: "mistral-nemo",
      enumChoices: [
        "command-r-plus",
        "command-r",
        "firefunction-v2",
        "hermes3",
        "llama3-groq-tool-use",
        "llama3.1",
        "llama3.2",
        "mistral-large",
        "mistral-nemo",
        "mistral-small",
        "mistral",
        "mixtral",
        "nemotron-mini",
        "qwen2.5-coder",
        "qwen2.5",
        "qwen2",
      ],
      enumPicker: "select",
    },
    {
      key: "shortcut",
      type: "string",
      title: "Shortcut",
      description: "Shortcut to open plugin command pallete",
      default: "mod+shift+o",
    },
    {
      key: "tavily_api_key",
      type: "string",
      title: "Tavily API Key",
      description: "API Key for https://tavily.com to enable web search",
      default: null,
    },
  ];
  logseq.useSettingsSchema(settingsTemplate);
};
