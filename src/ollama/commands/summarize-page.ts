import { getAllPrompts } from "@/prompts/getAllPrompts";
import { OllamaService } from "@/core/service/OllamaService";

export async function summarizePage() {
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

      const prompt = (await getAllPrompts()).find((p) => p.id === "summarize");
      if (!prompt) {
        logseq.UI.showMsg("No prompt found", "error");
        return;
      }

      const summary = await OllamaService.Instance?.chat({
        prompt,
        invokeState: { selectedBlocks: [lastBlock] },
      });
      await logseq.Editor.updateBlock(lastBlock.uuid, `Summary: ${summary}`);
    }
  } catch (e: any) {
    logseq.UI.showMsg(e.toString(), "warning");
    console.error(e);
  }
}
