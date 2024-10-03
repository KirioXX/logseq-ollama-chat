import { ContextType, getTreeContent } from "@/lib/logseq-helpers";
import { askAI } from "./ask-ai";

export async function askAIWithContext(
  prompt: string,
  contextType: ContextType
) {
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
