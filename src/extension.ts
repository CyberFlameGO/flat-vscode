import * as vscode from "vscode";

import { Credentials } from "./credentials";
import { RepositoriesProvider } from "./providers";

export async function activate(context: vscode.ExtensionContext) {
  // Authentication
  const credentials = new Credentials();
  await credentials.initialize(context);

  const octokit = await credentials.getOctokit();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "data-experiment.getGitHubUser",
      async () => {
        const octokit = await credentials.getOctokit();
        const userInfo = await octokit.users.getAuthenticated();

        vscode.window.showInformationMessage(
          `Logged into GitHub as ${userInfo.data.login}`
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "data-experiment.openIssueOnGitHub",
      (issueUrl: string) =>
        vscode.commands.executeCommand(
          "vscode.open",
          vscode.Uri.parse(issueUrl)
        )
    )
  );

  const reposProvider = new RepositoriesProvider(octokit);
  vscode.window.registerTreeDataProvider("repositories", reposProvider);
}

export function deactivate() {}
