import { createRxDatabase, RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { logseq as PL } from "../../../package.json";

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
    },
    required: ["id", "embedding"],
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
        storage: getRxStorageDexie(),
      });
      await this.db.addCollections({
        documentsVector,
      });
    } catch (e) {
      console.error(`${PL.id} [DBService]`, e);
    }
  }
}
