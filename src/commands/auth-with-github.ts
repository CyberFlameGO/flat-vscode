import * as Octokit from "@octokit/rest";
import * as vscode from "vscode";

import { getSession } from "../lib";
import store from "../store";

export async function authWithGithub() {
  const { setOctokit } = store.getState();
  // Check if there's an existing session
  const session = await getSession({ createIfNone: false });

  if (session) {
    setOctokit(
      new Octokit.Octokit({
        auth: session.accessToken,
      })
    );
    vscode.commands.executeCommand("setContext", "flat:authedWithGithub", true);
  } else {
    const authPermisson = await vscode.window.showInformationMessage(
      "In order to use Flat, you need to authenticate with GitHub",
      {},
      "Authenticate"
    );

    if (authPermisson === "Authenticate") {
      const session = await getSession({ createIfNone: true });
      if (session) {
        setOctokit(
          new Octokit.Octokit({
            auth: session.accessToken,
          })
        );
        vscode.window.showInformationMessage("Authed successfully");
        vscode.commands.executeCommand(
          "setContext",
          "flat:authedWithGithub",
          true
        );
      }
    } else {
      vscode.window.showErrorMessage(
        "You will not be able to take advantage of Flat until you auth with GitHub"
      );
    }
  }
}
