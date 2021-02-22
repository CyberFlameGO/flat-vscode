import * as vscode from "vscode";
import { Octokit } from "@octokit/rest";

export async function authWithGitHub(octokit: Octokit) {
  const userInfo = await octokit.users.getAuthenticated();

  vscode.window.showInformationMessage(
    `Logged into GitHub as ${userInfo.data.login}`
  );
}
