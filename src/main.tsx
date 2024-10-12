import "@logseq/libs";

import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { logseq as PL } from "../package.json";
import { addSettingsToLogseq } from "./settings";
import { ContextMenu } from "./ContextMenu";
import { DBService } from "./core/service/DBService";
import { LogseqProxy } from "./logseq/LogseqProxy";
import { OllamaService } from "./core/service/OllamaService";
import embedingFromJson from "./ollama/embeding/embedingFromJson";
import { DocumentService } from "./core/service/DocumentService";

const pluginId = PL.id;

export async function toggleOllamaUI() {
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
    const database = DBService.Instance;
    await database.init().then(() => {
      console.log(`${PL.id}: Database initialized`);
    })
    const ollamaService = OllamaService.Instance;
    await ollamaService.init().then(() => {
      console.log(`${PL.id}: OllamaService initialized`);
    });
    const documentService = DocumentService.Instance;
    await documentService.init().then(() => {
      console.log(`${PL.id}: DocumentService initialized`);
    });

    // Add menu item with action
    logseq.provideModel({
      showOllama: async () => embedingFromJson({}),
    });
    logseq.App.registerUIItem("toolbar", {
      key: `${pluginId}-ui-open`,
      template: `
        <a data-on-click="showOllama"
           class="button">
          <i class="ti ti-message-chatbot"></i>
        </a>
      `,
    });


    // Register shortcut
    logseq.App.registerCommandShortcut(
      logseq?.settings?.shortcut as string ?? 'mod+shift+o',
      () => toggleOllamaUI()
    );
    // logseq.App.registerCommandShortcut(
    //   'mod+shift+i',
    //   async () => {
    //     console.table(await documentService.search("Tom Darlow"));
    //   }
    // );

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


