import { IHookEvent } from "@logseq/libs/dist/LSPlugin";
import { ollamaGenerate } from "../ollama";

export async function DivideTaskIntoSubTasks(uuid: string, content: string) {
  try {
    const block = await logseq.Editor.insertBlock(
      uuid,
      "✅ Genearting todos ...",
      { before: false }
    );
    let i = 0;
    const response = await ollamaGenerate(
      `Divide this task into subtasks with numbers: ${content} `
    );

    if (!response) {
      return;
    }

    for (const todo of response.split("\n")) {
      if (i == 0) {
        await logseq.Editor.updateBlock(block!.uuid, `TODO ${todo.slice(3)} `);
      } else {
        await logseq.Editor.insertBlock(uuid, `TODO ${todo.slice(3)} `, {
          before: false,
        });
      }
      i++;
    }
  } catch (e: any) {
    logseq.UI.showMsg(e.toString(), "warning");
    console.error(e);
  }
}

export async function DivideTaskIntoSubTasksFromEvent(b: IHookEvent) {
  const currentBlock = await logseq.Editor.getBlock(b.uuid);
  DivideTaskIntoSubTasks(currentBlock!.uuid, currentBlock!.content);
}

export async function DivideTaskIntoSubTasksCurrentBlock() {
  const currentBlock = await logseq.Editor.getCurrentBlock();
  DivideTaskIntoSubTasks(currentBlock!.uuid, currentBlock!.content);
}
