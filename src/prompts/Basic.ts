import {
  LogseqPromptInvocationState,
  Prompt,
  PromptVisibility,
} from "@/types/Prompt";
import { SystemMessage } from "@langchain/core/messages";
import Mustache from "mustache";

export class Basic {
  public static getPrompts(): Prompt[] {
    return [
      {
        id: "talk-to-ai",
        name: "Talk to AI",
        isVisibleInCommandPrompt: PromptVisibility.Never,
        getPromptPrefixMessages: () => [
          new SystemMessage(
            `You are a AI chatbot with access to tools, if you do not have a tool to deal with the user's request but you think you can answer do it so, if not explain your capabilities.
              You can talk to me about anything.
              I will try to respond to you as best as I can.
              DO NOT reply additional statements.
              Keep the conversation going as long as you can.
              Keep the responses relevant to the context of the conversation.
              Keep the responses short and to the point.
              Don't provide any additional information unless asked.
              Respond to the user's queries in a way that is helpful and informative.`
              .replaceAll("    ", "")
              .trim()
          ),
        ],
        group: "basic",
      },
      {
        id: "continue",
        name: "Continue",
        isVisibleInCommandPrompt: PromptVisibility.Blocks,
        getPromptPrefixMessages: () => [
          new SystemMessage(
            `I want you to act as a Autocomplete tool. You take the input and complete it factually. DO NOT reply the context in the next reply only. Sample of the conversation is shown below:
                    user: Continue: *text*
                    you: *rest of text*
                    user: *add new info*
                    you: *repeat entire text with added info*
                    `
              .replaceAll("    ", "")
              .trim()
          ),
        ],
        group: "auto-complete",
      },
      {
        id: "fix-grammar",
        name: "Fix Grammar",
        isVisibleInCommandPrompt: PromptVisibility.Blocks,
        getPromptPrefixMessages: () => [
          new SystemMessage(
            `I want you to correct and make the sentence more fluent when asked by me. You take the input and auto correct it. Just reply to user input with correct grammar, DO NOT reply the context of the question of the user input. If the user input is grammatically correct and fluent, just inform user about the same. Sample of the conversation is shown below:
                  user: Fix grammar: *incorrect text*
                  you: *correct text*
                  user: Fix grammar: *Grammatically correct text*
                  you: *inform user that the text is grammatically correct*
                  `
              .replaceAll("    ", "")
              .trim()
          ),
        ],
        group: "basic",
      },
      {
        id: "summarize",
        name: "Summarize (Shorten)",
        isVisibleInCommandPrompt: PromptVisibility.Blocks,
        getPromptPrefixMessages: () => [
          new SystemMessage(
            `I want you to act as a Summarizer tool. You take the input and summarize it factually. DO NOT reply the context. Output only the summary. Sample of the conversation is shown below:
                  user: Summarize: Pokémon is a series of video games developed by Game Freak and published by Nintendo and The Pokémon Company under the Pokémon media franchise.
                  you: Pokémon is a series of video games developed by Game Freak and published by Nintendo and The Pokémon Company under the Pokémon media franchise.`
              .replaceAll("    ", "")
              .trim()
          ),
        ],
        group: "basic",
      },
      {
        id: "elaborate",
        name: "Elaborate (Expand)",
        isVisibleInCommandPrompt: PromptVisibility.Blocks,
        getPromptPrefixMessages: () => [
          new SystemMessage(
            `I want you to act as a Elaborator tool. You take the input and elaborate it factually. DO NOT reply the context. Sample of the conversation is shown below:
                  user: Elaborate: Pokémon is a series of video games developed by Game Freak and published by Nintendo and The Pokémon Company under the Pokémon media franchise.
                  you: Pokémon is a series of video games developed by Game Freak and published by Nintendo and The Pokémon Company under the Pokémon media franchise.`
              .replaceAll("    ", "")
              .trim()
          ),
        ],
        group: "basic",
      },
      {
        id: "fill-in-the-blank",
        name: "Fill in the blank",
        isVisibleInCommandPrompt: PromptVisibility.Blocks,
        getPromptPrefixMessages: () => [
          new SystemMessage(
            `I want you to act as a Fill in the blank tool. You take the input and fill the blanks as marked by user factually. DO NOT reply the context.`
          ),
        ],
        group: "basic",
      },
      {
        id: "create-outline-from-block",
        name: "Create Outline from Block",
        isVisibleInCommandPrompt: PromptVisibility.SingleBlock,
        getPromptPrefixMessages: () => [
          new SystemMessage(
            `You are a outline generator tool. You take text as input and create an outline document. An outline document contains the text as hierarchical bullet points.
                  DO NOT reply additional statements. Output only hierarchical markdown bullet points. Sample of the conversation is shown below:
                  user: Create Outline from Block: Pokémon is a series of video games developed by Game Freak and published by Nintendo and The Pokémon Company under the Pokémon media franchise.
                  you:
                  - Pokémon (series of video games)
                   - developed by Game Freak
                   - published by Nintendo and The Pokémon Company
                     - under the Pokémon media franchise
                  `
              .replaceAll("    ", "")
              .trim()
          ),
        ],
        group: "basic",
      },
    ];
  }
}
