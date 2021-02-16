import * as vscode from "vscode";
import * as queryString from "query-string";

import { Credentials } from "./credentials";
import { RepositoriesProvider } from "./providers";
import { makeActionYaml } from "./lib";

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function makeRangeFromMatch(line: number, match: RegExpMatchArray) {
  return new vscode.Range(
    // @ts-ignore
    new vscode.Position(line, match.index),
    // @ts-ignore
    new vscode.Position(line, match.index + match[0].length)
  );
}

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

  const scheme = "flat";

  const flatProvider = new (class
    implements vscode.TextDocumentContentProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    provideTextDocumentContent(uri: vscode.Uri): string {
      const parsed = queryString.parse(uri.query);
      return makeActionYaml({
        name: (parsed.name as string) || "Please provide a name",
        cron: (parsed.cron as string) || "Please provide a cron schedule",
        source: (parsed.source as string) || "Please provide a cron source",
      });
    }
  })();

  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(scheme, flatProvider)
  );

  const decorationType = vscode.window.createTextEditorDecorationType({
    cursor: "crosshair",
    // use a themable color. See package.json for the declaration and default values.
    backgroundColor: "rgba(255, 255, 0, .25)",
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("flat.createAction", async () => {
      const sourceUrl = await vscode.window.showInputBox({
        prompt: "Enter full URL to data source",
      });

      const cronSchedule = await vscode.window.showInputBox({
        prompt: "Enter CRON schedule",
      });

      const actionName = await vscode.window.showInputBox({
        prompt: "Enter name of action",
      });

      if (actionName && cronSchedule && sourceUrl) {
        const uri = vscode.Uri.parse(
          `flat:/schedule.yaml?name=${actionName}&cron=${cronSchedule}&source=${sourceUrl}`
        );
        let doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc, { preview: false });

        const editor = vscode.window.activeTextEditor;

        if (!editor) {
          return;
        }

        const decorations: vscode.DecorationOptions[] = [];
        const sourceCode = editor.document.getText();
        const sourceCodeArr = sourceCode.split("\n");

        const nameRegex = new RegExp(actionName);
        const cronRegex = new RegExp(escapeRegExp(cronSchedule));
        const sourceRegex = new RegExp(sourceUrl, "i");

        for (let line = 0; line < sourceCodeArr.length; line++) {
          const nameMatch = sourceCodeArr[line].match(nameRegex);
          const cronMatch = sourceCodeArr[line].match(cronRegex);
          const sourceMatch = sourceCodeArr[line].match(sourceRegex);

          if (nameMatch) {
            const nameDecoration = {
              range: makeRangeFromMatch(line, nameMatch),
              hoverMessage: "Name of action",
            };
            decorations.push(nameDecoration);
          }

          if (cronMatch) {
            const cronDecoration = {
              range: makeRangeFromMatch(line, cronMatch),
              hoverMessage: "CRON Schedule",
            };
            decorations.push(cronDecoration);
          }

          if (sourceMatch) {
            const sourceDecoration = {
              range: makeRangeFromMatch(line, sourceMatch),
              hoverMessage: "Data Source",
            };
            decorations.push(sourceDecoration);
          }
        }

        editor.setDecorations(decorationType, decorations);
      }
    })
  );

  const reposProvider = new RepositoriesProvider(octokit);
  vscode.window.registerTreeDataProvider("repositories", reposProvider);
}

export function deactivate() {}
