import * as vscode from "vscode";
import * as queryString from "query-string";
import * as path from "path";
import * as fs from "fs";

import { makeActionYaml, VSCodeGit } from "./lib";
import { Repository } from "./types";

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

  context.subscriptions.push(
    vscode.commands.registerCommand("flat.saveAndCommit", async () => {
      // Initialize git client.
      const gitClient = new VSCodeGit();

      // Check if we're in a repo. Bail if not.
      const repo = gitClient.repository;
      if (!repo) {
        await vscode.window.showErrorMessage(
          "Hmm, this doesn't look like a Git repository. Are you sure you're in the right directory?"
        );
        return;
      }

      // Check if there are pending changes. Bail if so.
      const stagedChanges = gitClient.workingTreeChanges;

      if (stagedChanges.length > 0) {
        await vscode.window.showErrorMessage(
          "Bailing out! It looks like you already have some changes staged."
        );
        return;
      }

      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        return;
      }

      const { document } = editor;
      const action = document.getText();

      let rootPath: vscode.WorkspaceFolder;

      const folders = vscode.workspace.workspaceFolders;
      if (!folders) {
        return;
      }

      // Write yaml to disk.
      rootPath = folders[0];
      const workflowsDir = path.join(rootPath.uri.path, ".github/workflows");
      fs.mkdirSync(workflowsDir, { recursive: true });
      fs.writeFileSync(path.join(workflowsDir, "flat.yaml"), action);

      // Add and commit.
      await gitClient.add([
        vscode.Uri.parse(path.join(workflowsDir, "flat.yaml")),
      ]);
      await gitClient.commit("feat: add flat.yaml workflow");

      await vscode.commands.executeCommand(
        "workbench.action.closeActiveEditor"
      );

      vscode.window.showInformationMessage(
        "Created and committed flat.yml 🎊! Push to GitHub to trigger the action."
      );
    })
  );
}

export function deactivate() {}
