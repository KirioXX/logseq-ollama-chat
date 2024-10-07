import { convertToFlashCardHandler } from "./ollama/commands/convert-to-flash-card";
import { DivideTaskIntoSubTasksHandler } from "./ollama/commands/device-task-into-sub-tasks";
import { expandBlock } from "./ollama/commands/expand-block";
import { summarizeBlock } from "./ollama/commands/summarize-block";

export namespace ContextMenu {
  export function init() {
    logseq.Editor.registerBlockContextMenuItem(
      "Ollama: Create a flash card",
      convertToFlashCardHandler
    );
    logseq.Editor.registerBlockContextMenuItem(
      "Ollama: Divide into subtasks",
      DivideTaskIntoSubTasksHandler
    );
    logseq.Editor.registerBlockContextMenuItem(
      "Ollama: Summarize Block",
      summarizeBlock
    );
    logseq.Editor.registerBlockContextMenuItem(
      "Ollama: Expand Block",
      expandBlock
    );
  }
}
