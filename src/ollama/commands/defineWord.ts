import { askAI } from "./ask-ai";

export async function defineWord(word: string) {
  askAI({ role: "user", content: `What's the defintion of ${word}?` });
}
