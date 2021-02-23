import * as vscode from "vscode";

import { FlatProvider } from "./providers/flat";
import {
  authWithGitHub,
  createAction,
  saveAndCommit,
  saveAndCommitSql,
} from "./commands";
import { Credentials } from "./credentials";

export async function activate(context: vscode.ExtensionContext) {
  const scheme = "flat";

  const credentials = new Credentials();
  await credentials.initialize(context);

  const octokit = await credentials.getOctokit();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "flat.saveAndCommitSql",
      async () => await saveAndCommitSql(octokit)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "flat.authWithGithub",
      async () => await authWithGitHub(octokit)
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
