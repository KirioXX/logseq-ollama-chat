import { ContextType, getTreeContent } from "../../lib/logseq-helpers";
import { delay } from "../../lib/utils";
import { ollamaGenerate } from "../ollama";

export async function askAI(prompt: string, context: string) {
  await delay(300);
  try {
    const currentBlock = await logseq.Editor.getCurrentBlock();
    let block = null;
    if (currentBlock?.content.trim() === "") {
      block = await logseq.Editor.insertBlock(
        currentBlock!.uuid,
        "⌛Generating....",
        { before: true }
      );
    } else {
      block = await logseq.Editor.insertBlock(
        currentBlock!.uuid,
        "⌛Generating....",
        { before: false }
      );
    }
    let response: string | undefined;
    if (context == "") {
      response = await ollamaGenerate(prompt);
    } else {
      response = await ollamaGenerate(
        `With the context of: ${context}, ${prompt}`
      );
    }
    await logseq.Editor.updateBlock(
      block!.uuid,
      `**USER**: ${prompt}
**AI**: ${response}`
    );
  } catch (e: any) {
    logseq.UI.showMsg(e.toString(), "warning");
    console.error(e);
  }
}

export async function askWithContext(prompt: string, contextType: ContextType) {
  try {
    let blocksContent = "";
    if (contextType === "page") {
      const currentBlocksTree = await logseq.Editor.getCurrentPageBlocksTree();
      for (const block of currentBlocksTree) {
        blocksContent += await getTreeContent(block);
      }
    } else {
      const currentBlock = await logseq.Editor.getCurrentBlock();
      blocksContent += await getTreeContent(currentBlock!);
    }
    askAI(prompt, `Context: ${blocksContent}`);
  } catch (e: any) {
    logseq.UI.showMsg(e.toString(), "warning");
    console.error(e);
  }
}

export async function defineWord(word: string) {
  askAI(`What's the defintion of ${word}?`, "");
}
