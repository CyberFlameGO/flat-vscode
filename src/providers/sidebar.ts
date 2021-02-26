import * as vscode from "vscode";

import store from "../store";
import { getNonce, testConnection } from "../lib";
import { VSCodeGit } from "../git";

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
          break;
        case "test-connection-string":
          const { connstring } = data.payload;
          try {
            await testConnection(connstring);
            webviewView.webview.postMessage({
              command: "database-connect-success",
            });
          } catch (e) {
            webviewView.webview.postMessage({
              command: "database-connect-error",
            });
          }
          break;
        case "create-sql-workflow":
          try {
            await vscode.commands.executeCommand(
              "flat.saveAndCommitSql",
              data.payload
            );
            webviewView.webview.postMessage({ command: "create-sql-success" });
          } catch (e) {
            webviewView.webview.postMessage({
              command: "create-sql-error",
              payload: e,
            });
          }
          break;
        case "create-http-workflow":
          try {
            await vscode.commands.executeCommand(
              "flat.saveAndCommit",
              data.payload
            );
            webviewView.webview.postMessage({ command: "create-http-success" });
          } catch (e) {
            webviewView.webview.postMessage({
              command: "create-http-error",
              payload: e,
            });
          }
          break;
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
