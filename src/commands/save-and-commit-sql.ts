import * as vscode from "vscode";
import { Octokit } from "@octokit/rest";
import * as path from "path";
import * as fs from "fs";

import { encryptSecret, VSCodeGit } from "../lib";
import store from "../store";

export async function saveAndCommitSql(octokit: Octokit) {
  const { getState } = store;
  const { connectionString, reset } = getState();
  const gitClient = new VSCodeGit();

  const encryptedConnectionString = encryptSecret(connectionString);

  const userInfo = await octokit.users.getAuthenticated();
  const owner = userInfo.data.login;

  if (!owner) {
    await vscode.window.showErrorMessage("Hmm, we couldn't authenticate you.");
    return;
  }

  const repoName = gitClient.repoName;

  /*
    <SECRET_CREATION>
  */
  const keyRes = await octokit.actions.getRepoPublicKey({
    owner,
    repo: repoName,
  });

  const keyId = keyRes.data.key_id;

  try {
    const res = await octokit.actions.createOrUpdateRepoSecret({
      owner: owner,
      repo: repoName,
      secret_name: "connstring",
      encrypted_value: encryptedConnectionString,
      key_id: keyId,
    });
  } catch (e) {
    throw new Error("Failed to create secrets");
  }
  /*
    </SECRET_CREATION>
  */

  /*
    <YAML_COMMIT>
  */
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
    "Created and committed flat.yml 🎊! Write your SQL query."
  );
  /*
    </YAML_COMMIT>
  */

  const sqlPath = path.join(workflowsDir, "query.sql");

  fs.writeFileSync(sqlPath, "");
  console.log(sqlPath, vscode.Uri.parse(sqlPath));

  const sqlDocument = await vscode.workspace.openTextDocument(
    vscode.Uri.parse(sqlPath)
  );

  await vscode.window.showTextDocument(sqlDocument);

  // Reset Zustand state
  reset();
}
