import embeddingFromJson from "@/ollama/embeding/embedingFromJson";
import { logseq as PL } from "../../../package.json";
import { OllamaService } from "./OllamaService";
import { DBService } from "./DBService";

const vactorizeBatchSize = 100;

export class DocumentService {
  private static _instance: DocumentService;
  private _initialized = false;
  private _storeUpdated = false;

  db?: DBService;

  private constructor() {}

  public static get Instance() {
    // Do you need arguments? Make it a regular static method instead.
    return this._instance || (this._instance = new this());
  }

  async init() {
    if (this._initialized) {
      return;
    }

    try {
      this.db = DBService.Instance;
      this._updateStore();
      this._initialized = true;
    } catch (e) {
      console.error(`${PL.id} [DocumentService]`, e);
    }
  }

  public async search(query: string, limit?: number) {
    const queryVector = await embeddingFromJson({ text: query });
    const docs = await this.db?.vectorSearchIndexSimilarity(queryVector, limit);
    const documentIds = docs?.result.map(({ doc }) => doc.get("id"));
    const allDocs = await logseq.Editor.getAllPages();
    return allDocs?.filter((doc) => documentIds?.includes(doc.id));
  }

  // TODO: Improve the update store logic to improve performance
  private async _updateStore() {
    console.log("Updating store");
    if (this._storeUpdated) {
      return;
    }

    // Get all documents
    const allDocs = await logseq.Editor.getAllPages();
    if (!allDocs) {
      console.error("No documents found");
      this._storeUpdated = true;
      return;
    }
    console.time("Vectorizing documents");
    await Promise.all(
      this._splitArray(allDocs, vactorizeBatchSize).map((batch) =>
        this._vectorizeDocuments(batch)
      )
    );
    console.timeEnd("Vectorizing documents");
  }

  private _splitArray(arr: any[], size: number) {
    const batches = [];
    for (let i = 0; i < arr.length; i += size) {
      batches.push(arr.slice(i, i + size));
    }
    return batches;
  }

  private async _vectorizeDocuments(docs: any[]) {
    const databaseService = DBService.Instance;
    for (const doc of docs) {
      const embed = await embeddingFromJson(doc);
      await databaseService.upsertDocumentVector(doc.id, embed);
    }
  }
}
