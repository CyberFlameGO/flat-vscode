import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

import store from "../store";
import { authWithGithub } from "./auth-with-github";
import { VSCodeGit, makeActionYaml } from "../lib";

const sodium = require("tweetsodium");

interface Params {
  cron: string;
  source: string;
  name: string;
}

export async function saveAndCommitSql(params: Params) {
  // Global state
  const { reset, octokit } = store.getState();

  const gitClient = new VSCodeGit();
  await gitClient.activateExtension();

  if (!octokit) {
    authWithGithub();
    return;
  }

  const { cron, source, name: actionName } = params;

  // Next, let's grab the repo name.
  const { name, owner } = gitClient.repoDetails;

  // Go time! Let's create a secret for the encrpyted conn string.
  const keyRes = await octokit.actions.getRepoPublicKey({
    owner,
    repo: name,
  });

  const key = keyRes.data.key;

  // Convert the message and key to Uint8Array's (Buffer implements that interface)
  const messageBytes = Buffer.from(source);
  const keyBytes = Buffer.from(key, "base64");

  // Encrypt using LibSodium.
  const encryptedBytes = sodium.seal(messageBytes, keyBytes);

  // Base64 the encrypted secret
  const encrypted = Buffer.from(encryptedBytes).toString("base64");

  const keyId = keyRes.data.key_id;

  try {
    await octokit.actions.createOrUpdateRepoSecret({
      owner: owner,
      repo: name,
      secret_name: "CONNSTRING",
      encrypted_value: encrypted,
      key_id: keyId,
    });
  } catch (e) {
    await vscode.window.showErrorMessage(
      "Oh no! We weren't able to create a secret for your connection string."
    );
  }

  // In any event, let's go ahead and commit the YAML.
  const actionYaml = makeActionYaml({
    type: "sql",
    name: actionName,
    source,
    cron,
  });

  const folders = vscode.workspace.workspaceFolders;

  if (!folders) {
    return;
  }

  let rootPath: vscode.WorkspaceFolder;
  rootPath = folders[0];

  // Write file
  const workflowsDir = path.join(rootPath.uri.path, ".github/workflows");
  fs.mkdirSync(workflowsDir, { recursive: true });
  fs.writeFileSync(path.join(workflowsDir, "flat.yaml"), actionYaml);

  // Add and commit.
  await gitClient.add([vscode.Uri.parse(path.join(workflowsDir, "flat.yaml"))]);
  await gitClient.commit("feat: add flat.yaml workflow");

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
