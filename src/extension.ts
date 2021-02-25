import * as vscode from "vscode";

import { FlatProvider, SidebarProvider } from "./providers";
import {
  createAction,
  saveAndCommit,
  saveAndCommitSql,
  authWithGithub,
} from "./commands";

const scheme = "flat";

export async function activate(context: vscode.ExtensionContext) {
  await authWithGithub();

  const sidebarProvider = new SidebarProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("flat-sidebar", sidebarProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("flat.saveAndCommitSql", saveAndCommitSql)
  );

  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      scheme,
      new FlatProvider()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("flat.authWithGithub", authWithGithub)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("flat.createAction", createAction)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("flat.saveAndCommit", saveAndCommit)
  );
}

export function deactivate() {}
