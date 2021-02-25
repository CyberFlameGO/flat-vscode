import * as vscode from "vscode";

import {
  WorkflowRunsProvider,
  FlatProvider,
  SidebarProvider,
} from "./providers";
import {
  createAction,
  saveAndCommit,
  saveAndCommitSql,
  authWithGithub,
} from "./commands";
import store from "./store";

export async function activate(context: vscode.ExtensionContext) {
  const scheme = "flat";

  await authWithGithub();

  const { octokit } = store.getState();

  const sidebarProvider = new SidebarProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("flat-sidebar", sidebarProvider)
  );

  // if (octokit) {
  //   vscode.window.registerTreeDataProvider(
  //     "workflowRuns",
  //     new WorkflowRunsProvider(octokit)
  //   );
  // }

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
    vscode.commands.registerCommand("flat.createAction", createAction)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("flat.saveAndCommit", saveAndCommit)
  );
}

export function deactivate() {}
