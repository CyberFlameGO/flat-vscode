import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

import { encryptSecret, VSCodeGit } from "../lib";
import store from "../store";
import { Credentials } from "../credentials";

export async function saveAndCommitSql(context: vscode.ExtensionContext) {
  // Global state
  const { getState } = store;
  const { connectionString, reset } = getState();

  const gitClient = new VSCodeGit();

  // Let's auth with GitHub so that we can create secrets for the user.
  const credentials = new Credentials();

  try {
    await credentials.initialize(context);
  } catch (e) {
    await vscode.window.showErrorMessage(
      "Yikes! We need you to auth with GitHub in order to complete this workflow."
    );
    return;
  }

  // Phew, we made it. Let's get our Octokit instance.
  const octokit = await credentials.getOctokit();

  // Let's encrypt the user's connection string.
  const encryptedConnectionString = encryptSecret(connectionString);

  // Then, let's get the current user's "owner" name
  const userInfo = await octokit.users.getAuthenticated();
  const owner = userInfo.data.login;

  if (!owner) {
    await vscode.window.showErrorMessage(
      "Hmm, we couldn't seem to identify you!"
    );
    return;
  }

  // Next, let's grab the repo name.
  const repoName = gitClient.repoName;

  // Go time! Let's create a secret for the encrpyted conn string.
  const keyRes = await octokit.actions.getRepoPublicKey({
    owner,
    repo: repoName,
  });

  const keyId = keyRes.data.key_id;

  try {
    await octokit.actions.createOrUpdateRepoSecret({
      owner: owner,
      repo: repoName,
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
