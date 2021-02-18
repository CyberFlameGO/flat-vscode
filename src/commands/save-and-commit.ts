import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

import { VSCodeGit } from "../lib";

export const saveAndCommit = async () => {
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
  await gitClient.add([vscode.Uri.parse(path.join(workflowsDir, "flat.yaml"))]);
  await gitClient.commit("feat: add flat.yaml workflow");

  await vscode.commands.executeCommand("workbench.action.closeActiveEditor");

  vscode.window.showInformationMessage(
    "Created and committed flat.yml 🎊! Push to GitHub to trigger the action."
  );
};
