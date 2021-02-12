import * as vscode from "vscode";

import { Credentials } from "./credentials";

export async function activate(context: vscode.ExtensionContext) {
  const credentials = new Credentials();
  await credentials.initialize(context);

  const disposable = vscode.commands.registerCommand(
    "data-experiment.getGitHubUser",
    async () => {
      const octokit = await credentials.getOctokit();
      const userInfo = await octokit.users.getAuthenticated();

      vscode.window.showInformationMessage(
        `Logged into GitHub as ${userInfo.data.login}`
      );
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
