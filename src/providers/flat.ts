import * as vscode from "vscode";
import { parse } from "query-string";

import { makeActionYaml } from "../lib";

export const FlatProvider = class
  implements vscode.TextDocumentContentProvider {
  provideTextDocumentContent(uri: vscode.Uri): string {
    const parsed = parse(uri.query);

    return makeActionYaml({
      name: (parsed.name as string) || "Please provide a name",
      cron: (parsed.cron as string) || "Please provide a cron schedule",
      source: (parsed.source as string) || "Please provide a cron source",
    });
  }
};
