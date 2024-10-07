import { BlockEntity } from "@logseq/libs/dist/LSPlugin";
import { Message } from "ollama/browser";

type PromptGroup = "auto-complete" | "basic";

/**
 * Prompts work in two phases:
 * - Phase 1: Prompt is displayed to used in command prompt and upon selection,
 *   Chatgpt page representing the prompt is created.
 * - Phase 2: Prompt is run. While running, getPromptPrefixMessages is appended at the
 *   start of message history.
 */
export type Prompt = {
  // -- Fields for Phase 1 --
  id: string; // Unique identifier for the prompt
  name: string; // The name of the prompt (displayed in command prompt)
  isVisibleInCommandPrompt?: (
    invokeState?: LogseqPromptInvocationState
  ) => boolean;
  // TODO: Setup tooling for ollama
  // tools? : Tool[]; // An option array of Tools that can be used by the prompt. Please avoid unless needed as it changes executor from simple call to agent call.
  getPromptMessage?: (
    input?: string,
    invokeState?: LogseqPromptInvocationState
  ) => string; // The return value of the function is appended when chatgpt page is created.
  group: PromptGroup; // A misc string that represents the group to which the prompt belongs

  // -- Fields for Phase 2 --
  getPromptPrefixMessages?: () => Message[]; // Hidden messages that are prepended to the message history when the prompt is run
  getPromptSuffixMessages?: () => Message[]; // Hidden message that is appended to the prompt message
};

export type LogseqPromptInvocationState = {
  selectedBlocks?: BlockEntity[];
};

export class PromptVisibility {
  static Blocks = (invokeState: any) => {
    return invokeState.selectedBlocks && invokeState.selectedBlocks.length > 0;
  };
  static SingleBlock = (invokeState: any) => {
    return invokeState.selectedBlocks && invokeState.selectedBlocks.length == 1;
  };

  static NoInput = (invokeState: any) => {
    return (
      !invokeState.selectedBlocks || invokeState.selectedBlocks.length == 0
    );
  };

  static Never = () => {
    return false;
  };
}
