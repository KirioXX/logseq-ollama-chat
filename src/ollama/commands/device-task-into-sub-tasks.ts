import { BlockUUID, IHookEvent } from "@logseq/libs/dist/LSPlugin";
import { Prompt } from "@/types/Prompt";
import { OllamaService } from "@/core/service/OllamaService";
import { getAllPrompts } from "@/prompts/getAllPrompts";

export async function DivideTaskIntoSubTasks(uuid: string, prompt: Prompt) {
  try {
    const block = await logseq.Editor.insertBlock(
      uuid,
      "✅ Genearting todos ...",
      { before: false }
    );
    let i = 0;
    const response = await OllamaService.Instance?.chat({
      prompt,
    });

    if (!response) {
      return;
    }

    for (const todo of response.content.split("\n")) {
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

export async function DivideTaskIntoSubTasksHandler(
  prop: IHookEvent & {
    uuid: BlockUUID;
  }
) {
  const prompt = (await getAllPrompts()).find((p) => p.id === "generate-tasks");
  if (!prompt) {
    logseq.UI.showMsg("No prompt found", "error");
    return;
  }
  DivideTaskIntoSubTasks(prop.uuid, prompt);
}
