import { assert } from "@itwin/core-bentley";
import { QueryRowFormat } from "@itwin/core-common";
import { IModelApp, Tool } from "@itwin/core-frontend";

const bar  = "--------------------------------------------------------------";

export class QueryTool extends Tool {
  public static override toolId = "Query";
  public static override get minArgs() { return 1; }
  public static override get maxArgs() { return undefined; }

  public override async run(query: string): Promise<boolean> {
    const iModel = IModelApp.viewManager.selectedView?.iModel;
    assert(iModel !== undefined);

    const reader = iModel.createQueryReader(query, undefined, { rowFormat: QueryRowFormat.UseJsPropertyNames });
    const array = await reader.toArray();

    console.log(bar);
    console.log(query);
    console.log(array);
    console.log(bar);

    return true;
  }

  public override async parseAndRun(...args: string[]): Promise<boolean> {
    let query: string;
    if (args.length === 1) {
      query=args[0];
    } else {
      query = args.join(" ");
    }
    return this.run(query);
  }
}
