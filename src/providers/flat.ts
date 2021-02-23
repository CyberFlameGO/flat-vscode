import * as vscode from "vscode";
import { parse } from "query-string";

import { makeActionYaml } from "../lib";

export const FlatProvider = class
  implements vscode.TextDocumentContentProvider {
  provideTextDocumentContent(uri: vscode.Uri): string {
    const parsed = parse(uri.query);

    return makeActionYaml({
      type: parsed.type as string,
      name: parsed.name as string,
      cron: parsed.cron as string,
      source: parsed.source as string,
    });
  }
};
