import { convertToFlashCardFromEvent } from "./ollama/commands/convert-to-flash-card";
import { DivideTaskIntoSubTasksFromEvent } from "./ollama/commands/device-task-into-sub-tasks";
import { promptFromBlockEventClosure } from "./ollama/ollama";

export namespace ContextMenu {
  export function init() {
    logseq.Editor.registerBlockContextMenuItem(
      "Ollama: Create a flash card",
      convertToFlashCardFromEvent
    );
    logseq.Editor.registerBlockContextMenuItem(
      "Ollama: Divide into subtasks",
      DivideTaskIntoSubTasksFromEvent
    );
    logseq.Editor.registerBlockContextMenuItem(
      "Ollama: Prompt from Block",
      promptFromBlockEventClosure()
    );
    logseq.Editor.registerBlockContextMenuItem(
      "Ollama: Custom prompt on Block",
      promptFromBlockEventClosure(
        logseq?.settings?.custom_prompt_block as string | undefined
      )
    );
    logseq.Editor.registerBlockContextMenuItem(
      "Ollama: Summarize block",
      promptFromBlockEventClosure("Summarize: ")
    );
    logseq.Editor.registerBlockContextMenuItem(
      "Ollama: Expand Block",
      promptFromBlockEventClosure("Expand: ")
    );
  }
}
