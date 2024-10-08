import { Tool } from "ollama";
import moment from "moment";

/**
  public static tool = {ting the current date.
 *
 * This class implements the `OllamaTool` interface and provides a static method
 * to get the current date without needing to instantiate the class.
 *
 * @implements {OllamaTool}
 */
export class DateGetterTool {
  public static tool: Tool = {
    type: "function",
    function: {
      name: "get_current_date",
      description: "Get the current date",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  };

  public static call(...args: any[]): string {
    return JSON.stringify({ date: moment().format("YYYY-MM-DD") });
  }
}
