import * as Octokit from "@octokit/rest";
import * as vscode from "vscode";

import { getSession } from "../lib";
import store from "../store";

export async function authWithGithub(prompt = false) {
  const { setOctokit, setSessionToken } = store.getState();
  const session = await getSession({ createIfNone: false });
  vscode.window.showInformationMessage("YESSSSS");

  if (session) {
    vscode.window.showInformationMessage("HAS SESSION" + session);
    setSessionToken(session.accessToken);
    setOctokit(
      new Octokit.Octokit({
        auth: session.accessToken,
      })
    );
    vscode.commands.executeCommand("setContext", "flat:authedWithGithub", true);
  } else if (prompt) {
    vscode.window.showInformationMessage("YESSSSS BEFORE PTOMPT");
    const session = await getSession({ createIfNone: true });
    vscode.window.showInformationMessage("YESSSSS AFTER PTOMPT");

    if (session) {
      setSessionToken(session.accessToken);
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
  }
}
