import { IHookEvent } from "@logseq/libs/dist/LSPlugin.user";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import ollama, { GenerateResponse, Ollama } from "ollama/browser";
import { getTreeContent } from "../lib/logseq-helpers";

export type OllamaGenerateParameters = {
  model?: string;
  [key: string]: any;
};

export async function ollamaGenerate(
  prompt: string,
  parameters?: OllamaGenerateParameters
) {
  if (!logseq.settings) {
    throw new Error("Couldn't find ollama-logseq settings");
  }

  let params = parameters || {};
  if (params.model === undefined) {
    params.model = logseq.settings.model as string;
  }
  params.prompt = prompt;
  params.stream = false;

  try {
    let generateResponse: GenerateResponse;
    if (
      logseq.settings.host &&
      logseq.settings.host !== "localhost:11434" &&
      logseq.settings.host !== ""
    ) {
      const ollamaClient = new Ollama({
        host: `http://${logseq.settings.host}`,
      });
      generateResponse = await ollamaClient.generate({
        model: logseq.settings.model as string,
        prompt: prompt,
        stream: false,
      });
    } else {
      generateResponse = await ollama.generate({
        model: logseq.settings.model as string,
        prompt: prompt,
        stream: false,
      });
    }

    if (!generateResponse) {
      logseq.UI.showMsg(
        "Coudln't fulfill request make sure that ollama service is running and make sure there is no typo in host or model name"
      );
      throw new Error("Error in Ollama request: " + generateResponse);
    }

    const data = generateResponse.response;
    return data;
  } catch (e: any) {
    console.error("ERROR: ", e);
    logseq.UI.showMsg(
      "Coudln't fulfill request make sure that ollama service is running and make sure there is no typo in host or model name"
    );
  }
}

async function getOllamaParametersFromBlockProperties(b: BlockEntity) {
  const properties = await logseq.Editor.getBlockProperties(b.uuid);
  const ollamaParameters: OllamaGenerateParameters = {};
  const prefix = "ollamaGenerate";
  for (const property in properties) {
    if (property.startsWith(prefix)) {
      const key = property.replace(prefix, "").toLowerCase();
      ollamaParameters[key] = properties[property];
    }
  }
  return ollamaParameters;
}

async function getOllamaParametersFromBlockAndParentProperties(b: BlockEntity) {
  let ollamaParentProperties: OllamaGenerateParameters = {};
  if (b.parent) {
    let parentBlock = await logseq.Editor.getBlock(b.parent.id);
    if (parentBlock)
      ollamaParentProperties = await getOllamaParametersFromBlockProperties(
        parentBlock
      );
  }
  const ollamaBlockProperties = await getOllamaParametersFromBlockProperties(b);
  return { ...ollamaParentProperties, ...ollamaBlockProperties };
}

async function promptFromBlock(block: BlockEntity, prefix?: string) {
  const answerBlock = await logseq.Editor.insertBlock(
    block!.uuid,
    "🦙Generating ...",
    { before: false }
  );
  const params = await getOllamaParametersFromBlockAndParentProperties(block!);
  const blockContent = await getTreeContent(block);

  // let prompt = block!.content.replace(/^.*::.*$/gm, '') // hack to remove properties from block content

  let prompt = blockContent;
  if (prefix) {
    prompt = prefix + "\n" + prompt;
  }

  const result = await ollamaGenerate(prompt, params);

  //FIXME: work out the best way to story context
  if (params.usecontext) {
    await logseq.Editor.upsertBlockProperty(
      block!.uuid,
      "ollama-generate-context",
      result
    );
  }

  await logseq.Editor.updateBlock(answerBlock!.uuid, `${result}`);
}

export function promptFromBlockEventClosure(prefix?: string) {
  return async (event: IHookEvent) => {
    try {
      const currentBlock = await logseq.Editor.getBlock(event.uuid);
      await promptFromBlock(currentBlock!, prefix);
    } catch (e: any) {
      logseq.UI.showMsg(e.toString(), "warning");
      console.error(e);
    }
  };
}
