import { IHookEvent } from "@logseq/libs/dist/LSPlugin";
import { delay } from "../../lib/utils";
import { ollamaGenerate } from "../ollama";

export async function convertToFlashCard(uuid: string, blockContent: string) {
  try {
    const questionBlock = await logseq.Editor.insertBlock(
      uuid,
      "⌛Genearting question....",
      { before: false }
    );
    const answerBlock = await logseq.Editor.insertBlock(
      questionBlock!.uuid,
      "⌛Genearting answer....",
      { before: false }
    );
    const question = await ollamaGenerate(
      `Create a question for a flashcard. Provide the question only. Here is the knowledge to check:\n ${blockContent}`
    );
    const answer = await ollamaGenerate(
      `Given the question ${question} and the context of ${blockContent} What is the answer? be as brief as possible and provide the answer only.`
    );
    if (!question || !answer) {
      return;
    }

    await logseq.Editor.updateBlock(questionBlock!.uuid, `${question} #card`);
    await delay(300);
    await logseq.Editor.updateBlock(answerBlock!.uuid, answer);
  } catch (e: any) {
    logseq.UI.showMsg(e.toString(), "warning");
    console.error(e);
  }
}

export async function convertToFlashCardFromEvent(b: IHookEvent) {
  const currentBlock = await logseq.Editor.getBlock(b.uuid);
  await convertToFlashCard(currentBlock!.uuid, currentBlock!.content);
}

export async function convertToFlashCardCurrentBlock() {
  const currentBlock = await logseq.Editor.getCurrentBlock();
  await convertToFlashCard(currentBlock!.uuid, currentBlock!.content);
}
