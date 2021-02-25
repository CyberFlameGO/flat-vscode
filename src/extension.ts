import * as vscode from "vscode";

import { SidebarProvider } from "./providers";
import {
  createAction,
  saveAndCommit,
  saveAndCommitSql,
  authWithGithub,
} from "./commands";
import store from "./store";

export async function activate(context: vscode.ExtensionContext) {
  const { reset } = store.getState();
  await authWithGithub();

  const sidebarProvider = new SidebarProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("flat-sidebar", sidebarProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("flat.saveAndCommitSql", saveAndCommitSql)
  );

  context.subscriptions.push(
    vscode.authentication.onDidChangeSessions(async (e) => {
      // We can probably assume that if you removed an identity and it was GitHub, it was you signing out
      // @ts-ignore
      if (e.removed.length > 0 && e.provider.id === "github") {
        reset();
        await sidebarProvider.refresh();
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("flat.authWithGithub", () =>
      authWithGithub(true)
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
