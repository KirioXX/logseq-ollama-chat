import { LangGraphService } from "@/core/service/LangchainService";
import { getAllPrompts } from "@/prompts/getAllPrompts";
import { IHookEvent, BlockUUID } from "@logseq/libs/dist/LSPlugin";

export async function expandBlock(prop: IHookEvent & { uuid: BlockUUID }) {
  try {
    const currentBlock = await logseq.Editor.getBlock(prop.uuid);
    if (!currentBlock) {
      logseq.UI.showMsg("No block found", "error");
      return;
    }

    // Get the prompt with the id "elaborate"
    const prompt = (await getAllPrompts()).find((p) => p.id === "elaborate");
    if (!prompt) {
      logseq.UI.showMsg("No prompt found", "error");
      return;
    }

    const summaryBlock = await logseq.Editor.insertBlock(
      currentBlock!.uuid,
      `⌛Summarizing Block...`,
      { before: false }
    );
    if (!summaryBlock) {
      logseq.UI.showMsg("Couldn't insert block", "error");
      return;
    }
    const summary = await LangGraphService.Instance.chat({
      prompt,
      // invokeState: { selectedBlocks: [summaryBlock] },
    });

    await logseq.Editor.updateBlock(summaryBlock!.uuid, `Summary: ${summary}`);
  } catch (e: any) {
    logseq.UI.showMsg(e.toString(), "warning");
    console.error(e);
  }
}
