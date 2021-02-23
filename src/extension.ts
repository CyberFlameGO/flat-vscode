import * as vscode from "vscode";

import { FlatProvider } from "./providers/flat";
import { createAction, saveAndCommit, saveAndCommitSql } from "./commands";

export async function activate(context: vscode.ExtensionContext) {
  const scheme = "flat";

  context.subscriptions.push(
    vscode.commands.registerCommand("flat.saveAndCommitSql", () =>
      saveAndCommitSql(context)
    )
  );

  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      scheme,
      new FlatProvider()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("flat.createAction", createAction)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("flat.saveAndCommit", saveAndCommit)
  );
}

export function deactivate() {}
