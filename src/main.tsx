import "@logseq/libs";
import "./index.css";

import React from "react";
import * as ReactDOM from "react-dom/client";

import App from "./App";
import { logseq as PL } from "../package.json";
import { addSettingsToLogseq } from "./settings";
import { ContextMenu } from "./ContextMenu";
import { LogseqProxy } from "./logseq/LogseqProxy";
import { OllamaService } from "./core/service/OllamaService";
import { LangGraphService } from "./core/service/LangchainService";

const pluginId = PL.id;
export function toggleOllamaUI() {
  if (logseq.isMainUIVisible) {
    logseq.hideMainUI();
    return;
  }
  logseq.showMainUI({
    autoFocus: true,
  });
  setTimeout(() => {
    const element = document.querySelector(
      "#chat-input"
    ) as HTMLInputElement | null;
    if (element) {
      element.focus();
    }
  }, 300);
}

async function main() {
  console.info(`${pluginId}: MAIN`);
  try {
    logseq.setMainUIInlineStyle({
      position: "fixed",
      width: "30%",
      height: "95%",
      left: "70%",
      top: '50px'
    });
    addSettingsToLogseq();
    ContextMenu.init();
    LogseqProxy.init();
    // TODO: revisit indexing with memory store
    // const database = DBService.Instance;
    // await database.init().then(() => {
    //   console.log(`${pluginId}: Database initialized`);
    // })
    const ollamaService = OllamaService.Instance;
    await ollamaService.init().then(() => {
      console.log(`${pluginId}: OllamaService initialized`);
    });
    const langGraphService = LangGraphService.Instance;
    await langGraphService.init().then(() => {
      console.log(`${pluginId}: LangGraphService initialized`);
    });
    // TODO: revisit indexing with memory store
    // const documentService = DocumentService.Instance;
    // await documentService.init().then(() => {
    //   console.log(`${pluginId}: DocumentService initialized`);
    // });


    // Register shortcut
    logseq.App.registerCommandShortcut(
      logseq?.settings?.shortcut as string ?? 'mod+shift+o',
      toggleOllamaUI
    );

    // Add menu item with action
    logseq.provideModel({
      showOllama: toggleOllamaUI
    });
    logseq.App.registerUIItem("toolbar", {
      key: `OllamaChat`,
      template: `
        <a data-on-click="showOllama"
          class="button">
          <i class="ti ti-message-chatbot"></i>
        </a>
      `,
    });

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


