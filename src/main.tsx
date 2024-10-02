import "@logseq/libs";

import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { logseq as PL } from "../package.json";
import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";
import { convertToFlashCardFromEvent } from "./ollama/commands/convert-to-flash-card";
import { DivideTaskIntoSubTasksFromEvent } from "./ollama/commands/device-task-into-sub-tasks";
import { promptFromBlockEventClosure } from "./ollama/ollama";
import { ollamaUI } from "./ollama/ollama-ui";

const pluginId = PL.id;
const openIconName = "ollama-ui-open";
let settings: SettingSchemaDesc[] = [
  {
    key: "host",
    type: "string",
    title: "Host",
    description: "Overwrite the host of your ollama model",
    default: null
  },
  {
    key: "model",
    type: "string",
    title: "LLM Model",
    description: "Set your desired model to use ollama",
    default: "llama3.2"
  },
  {
    key: "shortcut",
    type: "string",
    title: "Shortcut",
    description: "Shortcut to open plugin command pallete",
    default: "mod+shift+o"
  },
  {
    key: "custom_prompt_block",
    type: "string",
    title: "Custom prompt block",
    description: "Define your custom prompt and use a block as context",
    default: null
  },
]


function main() {
  console.info(`${pluginId}: MAIN`);
  try {
    logseq.useSettingsSchema(settings)

    // Add menu item with action
    logseq.provideModel({
      showOllama: () => ollamaUI(),
    });
    logseq.App.registerUIItem("toolbar", {
      key: openIconName,
      template: `
        <a data-on-click="showOllama"
           class="button">
          <i class="ti ti-wand"></i>
        </a>
      `,
    });


    // Register context menu items
    logseq.Editor.getPageBlocksTree("ollama-logseq-config").then((blocks) => {
        blocks!.forEach((block) => {
          logseq.Editor.getBlockProperty(block.uuid, "ollama-context-menu-title").then((title) => {
            logseq.Editor.getBlockProperty(block.uuid, "ollama-prompt-prefix").then((prompt_prefix) => {
              logseq.Editor.registerBlockContextMenuItem(title, promptFromBlockEventClosure(prompt_prefix))
            })
          }).catch((reason) => {
          })
        })
      }).catch((reason) => {
        console.error("Can not find the configuration page named 'ollama-logseq-config'", reason)
      })

    // Register slash commands
    logseq.Editor.registerSlashCommand("ollama", () => ollamaUI())
    logseq.Editor.registerBlockContextMenuItem("Ollama: Create a flash card", convertToFlashCardFromEvent)
    logseq.Editor.registerBlockContextMenuItem("Ollama: Divide into subtasks", DivideTaskIntoSubTasksFromEvent)
    logseq.Editor.registerBlockContextMenuItem("Ollama: Prompt from Block", promptFromBlockEventClosure())
    logseq.Editor.registerBlockContextMenuItem("Ollama: Custom prompt on Block", promptFromBlockEventClosure(logseq?.settings?.custom_prompt_block as string | undefined))
    logseq.Editor.registerBlockContextMenuItem("Ollama: Summarize block", promptFromBlockEventClosure("Summarize: "))
    logseq.Editor.registerBlockContextMenuItem("Ollama: Expand Block", promptFromBlockEventClosure("Expand: "))

    // Register shortcut
    logseq.App.registerCommandShortcut(
      logseq?.settings?.shortcut as string ?? 'mod+shift+o',
      () => ollamaUI()
    );

    // Register App UI
    const root = ReactDOM.createRoot(document.getElementById("app")!);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (e) {
    console.error(pluginId, e);
  }
  console.info(`${pluginId}: loaded`);
}
logseq.ready(main).catch(console.error);


