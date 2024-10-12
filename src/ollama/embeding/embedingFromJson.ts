import ollama from "ollama/browser";
import { model } from "./constants";
import { OllamaService } from "@/core/service/OllamaService";
import { Vector } from "rxdb/plugins/vector";

export default async function embeddingFromJson(
  json: Record<string, any>
): Promise<Vector> {
  const ollamaClient = OllamaService.Instance;
  const modelInstalled = await ollamaClient.isModelAvailable(model);
  if (!modelInstalled) {
    await ollamaClient.installModel(model);
  }
  const response = await ollama.embed({
    model,
    input: JSON.stringify(json),
    keep_alive: 10, // Keep the model alive for 10 seconds
  });
  return response.embeddings[0] as Vector;
}
