import { askAI } from "./ask-ai";

export async function defineWord(word: string) {
  askAI(`What's the defintion of ${word}?`);
}
