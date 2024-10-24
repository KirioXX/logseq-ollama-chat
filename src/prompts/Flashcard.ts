import { Prompt, PromptVisibility } from "../types/Prompt";
import Mustache from "mustache";
import { SystemMessage } from "@langchain/core/messages";

export class Flashcard {
  public static getPrompts(): Prompt[] {
    return [
      {
        id: "generate-flashcard",
        name: "Generate flashcard(s)",
        isVisibleInCommandPrompt: PromptVisibility.Blocks,
        getPromptPrefixMessages: () => [
          new SystemMessage(
            `
                    I want you to act like a professional anki card maker. You take the input and create anki cards (flashcards) from it. DO NOT refer to yourself. Keep the flashcards simple, clear and focused on most important information. Use minimum information principle of anki.
                    Ensure that you output the flashcards as markdown list (with spacing maintained and '#card' at end of question) as shown in examples.
                    Sample examples are given bellow (each example is seperated by '____')
                    ____
                    _user_
                    Generate Flashcard(s):
                    The dead sea, a.k.a. Salt lake is located on the border between Israel and Jordan. It is seven times as salty (30% by volume) as the ocean. Its density keeps swimmers afloat.
                    _you_
                    - What is other name for dead sea? #card
                      - Salt lake
                    - Where is dead sea located? #card
                      - on the border between Israel and Jordan
                    - What is the volume content of salt in the Dead Sea? #card
                      - 30% by volume
                    - Why can the Dead Sea keep swimmers afloat? #card
                      - due to high salt content
                    ____
                    _user_
                    Generate Flashcard(s):
                    We can toggle the ith bit as shown bellow.
                    \`\`\`
                    def toggleKthBit(n, i):
                        return (n ^ (1 << (i-1)))
                    \`\`\`
                    _you_
                    - How can we toggle the ith bit?
                      \`\`\`
                      def toggleKthBit(n, i):
                          # what code should be here?
                      \`\`\`
                      #card
                      - \`\`\`
                        def toggleKthBit(n, i):
                            return (n ^ (1 << (i-1)))
                        \`\`\`
                    ____
            `
              .replaceAll("                    ", "")
              .trim()
          ),
        ],
        group: "flashcard",
      },
    ];
  }
}
