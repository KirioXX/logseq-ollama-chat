import { BlockUUID, IHookEvent } from "@logseq/libs/dist/LSPlugin";
import { Prompt } from "@/types/Prompt";
import { getAllPrompts } from "@/prompts/getAllPrompts";
import { LangGraphService } from "@/core/service/LangchainService";

export async function convertToFlashCard(uuid: string, prompt: Prompt) {
  try {
    const answerBlock = await logseq.Editor.insertBlock(
      uuid,
      "⌛Genearting question....",
      { before: false }
    );
    const respond = await LangGraphService.Instance?.chat({
      prompt,
    });
    if (!respond) {
      return;
    }
    await logseq.Editor.updateBlock(
      answerBlock!.uuid,
      respond.content.toString()
    );
  } catch (e: any) {
    logseq.UI.showMsg(e.toString(), "warning");
    console.error(e);
  }
}

export async function convertToFlashCardHandler(
  prop: IHookEvent & {
    uuid: BlockUUID;
  }
) {
  const prompt = (await getAllPrompts()).find((p) => p.group === "flashcard");
  if (!prompt) {
    logseq.UI.showMsg("No prompt found", "error");
    return;
  }
  await convertToFlashCard(prop.uuid, prompt);
}
