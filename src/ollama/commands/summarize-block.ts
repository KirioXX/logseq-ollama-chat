import { LangGraphService } from "@/core/service/LangchainService";
import { getAllPrompts } from "@/prompts/getAllPrompts";
import { HumanMessage } from "@langchain/core/messages";
import { BlockUUID, IHookEvent } from "@logseq/libs/dist/LSPlugin";

export async function summarizeBlock(prop?: IHookEvent & { uuid: BlockUUID }) {
  try {
    let currentBlock;
    if (prop) {
      currentBlock = await logseq.Editor.getBlock(prop.uuid);
    } else {
      currentBlock = await logseq.Editor.getCurrentBlock();
    }
    if (!currentBlock) {
      logseq.UI.showMsg("No block found", "error");
      return;
    }
    if (currentBlock.content.trim() === "") {
      logseq.UI.showMsg("Block is empty", "error");
      return;
    }

    // Get the prompt with the id "summarize"
    const prompt = (await getAllPrompts()).find((p) => p.id === "summarize");
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
      messsage: new HumanMessage(`Summarize: ${currentBlock.content}`),
      prompt,
    });

    await logseq.Editor.updateBlock(
      summaryBlock!.uuid,
      `Summary:
${summary?.content}`
    );
  } catch (e: any) {
    logseq.UI.showMsg(e.toString(), "warning");
    console.error(e);
  }
}
