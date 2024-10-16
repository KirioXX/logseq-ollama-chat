import { elaborateBlock } from "./ollama/commands/elaborate-block";
import { summarizeBlock } from "./ollama/commands/summarize-block";

export namespace ContextMenu {
  export function init() {
    logseq.Editor.registerBlockContextMenuItem(
      "Ollama: Summarize Block",
      summarizeBlock
    );
    logseq.Editor.registerBlockContextMenuItem(
      "Ollama: Elaborate Block",
      elaborateBlock
    );
  }
}
