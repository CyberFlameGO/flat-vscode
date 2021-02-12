import * as vscode from "vscode";
import cronstrue from "cronstrue";

import { Credentials } from "./credentials";
import { RepositoriesProvider } from "./providers";

export async function activate(context: vscode.ExtensionContext) {
  // Authentication
  const credentials = new Credentials();
  await credentials.initialize(context);

  const octokit = await credentials.getOctokit();

  context.subscriptions.push(
    vscode.commands.registerCommand("flat.getGitHubUser", async () => {
      const octokit = await credentials.getOctokit();
      const userInfo = await octokit.users.getAuthenticated();

      vscode.window.showInformationMessage(
        `Logged into GitHub as ${userInfo.data.login}`
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "flat.openIssueOnGitHub",
      (issueUrl: string) =>
        vscode.commands.executeCommand(
          "vscode.open",
          vscode.Uri.parse(issueUrl)
        )
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("flat.createAction", async () => {
      const dataSourceUrl = await vscode.window.showInputBox({
        prompt: "Enter full URL to data source",
      });

      const cronSchedule = await vscode.window.showInputBox({
        prompt: "Enter CRON schedule",
      });

      if (cronSchedule) {
        const parsed = cronstrue.toString(cronSchedule);

        vscode.window.showInformationMessage(
          `Success! Your action will run ${parsed}`
        );
      }

      // TODO:
      // Fill GitHub action template with source URL and cron schedule value
    })
  );

  const reposProvider = new RepositoriesProvider(octokit);
  vscode.window.registerTreeDataProvider("repositories", reposProvider);
}

export function deactivate() {}
