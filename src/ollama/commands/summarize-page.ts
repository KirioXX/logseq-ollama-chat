import { delay } from "@/lib/utils";
import { ollamaGenerate } from "../ollama";
import { prompts } from "../../lib/prompts";

export async function summarizePage() {
  await delay(300);
  try {
    const currentSelectedBlocks =
      await logseq.Editor.getCurrentPageBlocksTree();
    let blocksContent = "";
    if (currentSelectedBlocks) {
      let lastBlock: any =
        currentSelectedBlocks[currentSelectedBlocks.length - 1];
      for (const block of currentSelectedBlocks) {
        blocksContent += block.content + "/n";
      }
      lastBlock = await logseq.Editor.insertBlock(
        lastBlock.uuid,
        "⌛ Summarizing Page....",
        { before: true }
      );
      const summary = await ollamaGenerate(prompts.summarise(blocksContent));
      await logseq.Editor.updateBlock(lastBlock.uuid, `Summary: ${summary}`);
    }
  } catch (e: any) {
    logseq.UI.showMsg(e.toString(), "warning");
    console.error(e);
  }
}
