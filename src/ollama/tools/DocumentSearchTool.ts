import { Tool } from "ollama";
import moment from "moment";
import { DocumentService } from "@/core/service/DocumentService";

export class DocumentSearchTool {
  public static tool: Tool = {
    type: "function",
    function: {
      name: "document_search",
      description: "Search for documents in the vector database",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query",
          },
        },
        required: ["query"],
      },
    },
  };

  // TODO: Sanitize the data before returning it
  public static async call(...args: any[]): Promise<string> {
    const { query } = args[0];
    console.log("DocumentSearchTool", query);
    const results = await DocumentService.Instance.search(query);
    return JSON.stringify(results);
  }
}
