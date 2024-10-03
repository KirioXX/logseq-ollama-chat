import "@logseq/libs";

import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { logseq as PL } from "../package.json";
import { ollamaUI } from "./ollama/ollama-ui";
import { addSettingsToLogseq } from "./settings";
import { ContextMenu } from "./ContextMenu";

const pluginId = PL.id;

function main() {
  console.info(`${pluginId}: MAIN`);
  try {
    addSettingsToLogseq();
    ContextMenu.init();

    // Add menu item with action
    logseq.provideModel({
      showOllama: () => ollamaUI(),
    });
    logseq.App.registerUIItem("toolbar", {
      key: "ollama-ui-open",
      template: `
        <a data-on-click="showOllama"
           class="button">
          <i class="ti ti-wand"></i>
        </a>
      `,
    });


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


