import { LangGraphService } from "@/core/service/LangchainService";
import { getAllPrompts } from "@/prompts/getAllPrompts";
import { HumanMessage } from "@langchain/core/messages";
import { IHookEvent, BlockUUID } from "@logseq/libs/dist/LSPlugin";

export async function elaborateBlock(prop?: IHookEvent & { uuid: BlockUUID }) {
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

    // Get the prompt with the id "elaborate"
    const prompt = (await getAllPrompts()).find((p) => p.id === "elaborate");
    if (!prompt) {
      logseq.UI.showMsg("No prompt found", "error");
      return;
    }

    const expandBlock = await logseq.Editor.insertBlock(
      currentBlock!.uuid,
      `⌛Expanding Block...`,
      { before: false }
    );
    if (!expandBlock) {
      logseq.UI.showMsg("Couldn't insert block", "error");
      return;
    }

    const expand = await LangGraphService.Instance.chat({
      messsage: new HumanMessage(`Elaborate: ${currentBlock.content}`),
      prompt,
    });

    await logseq.Editor.updateBlock(
      expandBlock!.uuid,
      `Elaborate:
${expand?.content}`
    );
  } catch (e: any) {
    logseq.UI.showMsg(e.toString(), "warning");
    console.error(e);
  }
}
