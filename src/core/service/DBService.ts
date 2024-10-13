import {
  createRxDatabase,
  RxDatabase,
  RxDocument,
  sortByObjectNumberProperty,
} from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { logseq as PL } from "../../../package.json";
import { euclideanDistance, Vector } from "rxdb/plugins/vector";
import { INDEX_VECTORS } from "./constants";

const indexSchema = {
  type: "string",
  maxLength: 10,
};

const documentsVector = {
  schema: {
    version: 0,
    primaryKey: "id",
    type: "object",
    properties: {
      id: {
        type: "string",
        maxLength: 20,
      },
      embedding: {
        type: "array",
        items: {
          type: "string",
        },
      },
      // index fields
      idx0: indexSchema,
      idx1: indexSchema,
      idx2: indexSchema,
      idx3: indexSchema,
      idx4: indexSchema,
    },
    required: ["id", "embedding", "idx0", "idx1", "idx2", "idx3", "idx4"],
    indexes: ["idx0", "idx1", "idx2", "idx3", "idx4"],
  },
};

export class DBService {
  private static _instance: DBService;
  private _initialized = false;

  db?: RxDatabase;

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
      this.db = await createRxDatabase({
        name: "ollama-db",
        storage: getRxStorageDexie({}),
      });
      await this.db.addCollections({
        documentsVector,
      });
    } catch (e) {
      console.error(`${PL.id} [DBService]`, e);
    }
  }

  public async upsertDocumentVector(id: string, embedding: Vector) {
    if (!this.db) {
      throw new Error("DB service not initialized");
    }
    const docData: Record<string, any> = {
      id,
      embedding,
      idx0: null,
      idx1: null,
      idx2: null,
      idx3: null,
      idx4: null,
    };
    // calculate the distance to all samples and store them in the index fields
    new Array(5).fill(0).map((_, idx) => {
      const indexValue = euclideanDistance(INDEX_VECTORS[idx], embedding);
      docData["idx" + idx] = this._indexNrToString(indexValue);
    });
    await this.db.documentsVector.upsert(docData);
  }

  private _indexNrToString(nr: number): string {
    return (nr * 10 + "").slice(0, 10).padEnd(10, "0");
  }

  public async vectorSearchIndexSimilarity(
    searchEmbedding: number[],
    limit = 5
  ) {
    if (!this.db) {
      throw new Error("DB service not initialized");
    }

    const docsPerIndexSide = 100;
    const candidates = new Set<RxDocument>();
    let docReads = 0;
    await Promise.all(
      new Array(limit).fill(0).map(async (_, i) => {
        const distanceToIndex = euclideanDistance(
          INDEX_VECTORS[i],
          searchEmbedding
        );
        const [docsBefore, docsAfter] = await Promise.all([
          this.db!.documentsVector.find({
            selector: {
              ["idx" + i]: {
                $lt: this._indexNrToString(distanceToIndex),
              },
            },
            sort: [{ ["idx" + i]: "desc" }],
            limit: docsPerIndexSide,
          }).exec(),
          this.db!.documentsVector.find({
            selector: {
              ["idx" + i]: {
                $gt: this._indexNrToString(distanceToIndex),
              },
            },
            sort: [{ ["idx" + i]: "asc" }],
            limit: docsPerIndexSide,
          }).exec(),
        ]);
        docsBefore.map((d) => candidates.add(d));
        docsAfter.map((d) => candidates.add(d));

        docReads = docReads + docsBefore.length;
        docReads = docReads + docsAfter.length;
      })
    );
    const docsWithDistance = Array.from(candidates).map((doc) => {
      const distance = euclideanDistance(
        (doc as any).embedding,
        searchEmbedding
      );
      return {
        distance,
        doc,
      };
    });
    const sorted = docsWithDistance
      .sort(sortByObjectNumberProperty("distance"))
      .reverse();
    return {
      result: sorted.slice(0, 10),
      docReads,
    };
  }
}
