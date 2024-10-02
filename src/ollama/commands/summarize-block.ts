import { prompts } from "../../lib/prompts";
import { ollamaGenerate } from "../ollama";

export async function summarizeBlock() {
  try {
    // TODO: Get contnet of current block and subblocks
    const currentBlock = await logseq.Editor.getCurrentBlock();
    let summaryBlock = await logseq.Editor.insertBlock(
      currentBlock!.uuid,
      `⌛Summarizing Block...`,
      { before: false }
    );
    const summary = await ollamaGenerate(
      prompts.summarise(currentBlock!.content)
    );

    await logseq.Editor.updateBlock(summaryBlock!.uuid, `Summary: ${summary}`);
  } catch (e: any) {
    logseq.UI.showMsg(e.toString(), "warning");
    console.error(e);
  }
}
