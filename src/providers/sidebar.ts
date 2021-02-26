import * as vscode from "vscode";

import { getNonce } from "../lib";
import store from "../store";
import { VSCodeGit } from "../lib";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public async refresh() {
    if (!this._view) return;

    this._view.webview.html = await this._getHtmlForWebview(this._view.webview);
  }

  public async resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    const updateWebview = async () => {
      webviewView.webview.html = await this._getHtmlForWebview(
        webviewView.webview
      );
    };

    await updateWebview();

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case "auth-with-github":
          await vscode.commands.executeCommand("flat.authWithGithub");
          await updateWebview();
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private async _getHtmlForWebview(webview: vscode.Webview) {
    const gitClient = new VSCodeGit();

    await gitClient.activateExtension();

    const { sessionToken } = store.getState();
    console.log("****** GETTING HTML *******");
    console.log(sessionToken);
    console.log("****** GETTING HTML*******");

    const stylesPath = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "index.css"
    );

    const stylesUri = webview.asWebviewUri(stylesPath);

    const scriptPathOnDisk = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "index.js"
    );

    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    const nonce = getNonce();

    let name = "",
      owner = "";

    try {
      const details = await gitClient.waitForRepo(3);
      name = details.name;
      owner = details.owner;
    } catch (e) {
      console.error("no upstream, wtf?", e);
    }

    const initialAppState = {
      sessionToken,
      repo: {
        name,
        owner,
      },
    };

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">        
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${
          webview.cspSource
        }; img-src ${
      webview.cspSource
    } 'self' data: https:; script-src 'nonce-${nonce}'; connect-src https://api.github.com;">
        <link href="${stylesUri}" rel="stylesheet">
			</head>
      <body>
				<div data-state=${JSON.stringify(initialAppState)} id="app"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}
