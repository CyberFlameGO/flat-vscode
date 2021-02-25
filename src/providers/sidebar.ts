import * as vscode from "vscode";

import { getNonce } from "../lib";
import store from "../store";
import { VSCodeGit } from "../lib";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public async resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = await this._getHtmlForWebview(
      webviewView.webview
    );

    webviewView.webview.onDidReceiveMessage(async (data) => {
      // switch (data.type) {
      // }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private async _getHtmlForWebview(webview: vscode.Webview) {
    const gitClient = new VSCodeGit();
    await gitClient.activateExtension();
    const { sessionToken } = store.getState();

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

    // Next, let's grab the repo name.
    const { name, owner } = gitClient.repoDetails;

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
