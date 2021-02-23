import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

import { encryptSecret, VSCodeGit } from "../lib";
import store from "../store";
import { authWithGithub } from "./auth-with-github";

export async function saveAndCommitSql() {
  // Global state
  const { connectionString, reset, octokit } = store.getState();

  const gitClient = new VSCodeGit();
  await gitClient.activateExtension();

  if (!octokit) {
    authWithGithub();
    return;
  }

  // Let's encrypt the user's connection string.
  const encryptedConnectionString = encryptSecret(connectionString);

  // Next, let's grab the repo name.
  const { name, owner } = gitClient.repoDetails;

  // Go time! Let's create a secret for the encrpyted conn string.
  const keyRes = await octokit.actions.getRepoPublicKey({
    owner,
    repo: name,
  });

  const keyId = keyRes.data.key_id;

  try {
    await octokit.actions.createOrUpdateRepoSecret({
      owner: owner,
      repo: name,
      secret_name: "connstring",
      encrypted_value: encryptedConnectionString,
      key_id: keyId,
    });
  } catch (e) {
    await vscode.window.showErrorMessage(
      "Oh no! We weren't able to create a secret for your connection string."
    );
  }

  // In any event, let's go ahead and commit the YAML.
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const { document } = editor;
  const action = document.getText();

  const folders = vscode.workspace.workspaceFolders;

  if (!folders) {
    return;
  }

  let rootPath: vscode.WorkspaceFolder;
  rootPath = folders[0];

  // Write file
  const workflowsDir = path.join(rootPath.uri.path, ".github/workflows");
  fs.mkdirSync(workflowsDir, { recursive: true });
  fs.writeFileSync(path.join(workflowsDir, "flat.yaml"), action);

  // Add and commit.
  await gitClient.add([vscode.Uri.parse(path.join(workflowsDir, "flat.yaml"))]);
  await gitClient.commit("feat: add flat.yaml workflow");
  await vscode.commands.executeCommand("workbench.action.closeActiveEditor");

  vscode.window.showInformationMessage(
    "Created and committed flat.yml 🎊! Write your SQL query."
  );

  // Write SQL file
  const sqlPath = path.join(workflowsDir, "query.sql");

  fs.writeFileSync(sqlPath, "");

  const sqlDocument = await vscode.workspace.openTextDocument(
    vscode.Uri.parse(sqlPath)
  );

  await vscode.window.showTextDocument(sqlDocument);

  // Reset Zustand state so subsequent extension runs don't blow up.
  reset();
}
