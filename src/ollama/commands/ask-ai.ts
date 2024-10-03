import { BlockIdentity } from "@logseq/libs/dist/LSPlugin";
import { ContextType, getTreeContent } from "../../lib/logseq-helpers";
import { delay } from "../../lib/utils";
import { ollamaGenerate } from "../ollama";

export async function askAI(
  prompt: string,
  context?: string,
  blockId?: BlockIdentity
) {
  await delay(300);
  try {
    let currentBlock;
    if (blockId) {
      await logseq.Editor.insertBlock(blockId, "⌛Generating....", {
        before: false,
      });
    } else {
      // Get a new block on the current page or journal if no blockId is provided
      const currentPage = await logseq.Editor.getCurrentPage();
      const currentJournal = await logseq.Editor.getCurrentJournal();
      console.log({ currentPage });
      if (!currentPage && !currentJournal) {
        return;
      }
      currentBlock = await logseq.Editor.appendBlockInPage(
        currentPage ?? currentJournal,
        "⌛Generating...."
      );
    }

    let response: string | undefined;
    if (!context) {
      response = await ollamaGenerate(prompt);
    } else {
      response = await ollamaGenerate(
        `With the context of: ${context}, ${prompt}`
      );
    }
    if (blockId) {
      await logseq.Editor.updateBlock(
        blockId,
        `**USER**: ${prompt}
**AI**: ${response}`
      );
    } else if (currentBlock) {
      await logseq.Editor.updateBlock(
        currentBlock.uuid,
        `**USER**: ${prompt}
**AI**: ${response}`
      );
    }
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
