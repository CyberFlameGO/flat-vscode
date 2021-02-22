import * as vscode from "vscode";
import cronstrue from "cronstrue";
import { createConnection } from "typeorm";

import { buildVirtualDocument, isValidUrl, getNonce } from "../lib";

function createHTMLAction() {
  const sourceInputBox = vscode.window.createInputBox();
  sourceInputBox.placeholder = "URL";
  sourceInputBox.title = "Enter fully qualified URL of data source";
  sourceInputBox.ignoreFocusOut = true;
  sourceInputBox.step = 1;
  sourceInputBox.totalSteps = 3;

  sourceInputBox.show();

  sourceInputBox.onDidAccept(() => {
    if (sourceInputBox.value && isValidUrl(sourceInputBox.value)) {
      cronInputBox.show();
    } else {
      sourceInputBox.validationMessage = "You need to enter a valid URL";
    }
  });

  const cronInputBox = vscode.window.createInputBox();
  cronInputBox.placeholder = "CRON";
  cronInputBox.title = "Enter CRON schedule for this action";
  cronInputBox.ignoreFocusOut = true;
  cronInputBox.step = 2;
  cronInputBox.totalSteps = 3;

  cronInputBox.onDidAccept(() => {
    if (cronInputBox.value && cronstrue.toString(cronInputBox.value)) {
      nameInputBox.show();
    }
  });

  cronInputBox.onDidChangeValue(() => {
    if (!cronInputBox.value) {
      cronInputBox.prompt = "";
    }

    try {
      const humanReadable = cronstrue.toString(cronInputBox.value);
      cronInputBox.validationMessage = undefined;
      cronInputBox.prompt = `✅ Will run: ${humanReadable}`;
    } catch (e) {
      cronInputBox.validationMessage = e;
    }
  });

  const nameInputBox = vscode.window.createInputBox();
  nameInputBox.placeholder = "Name";
  nameInputBox.title = "Enter name for this action";
  nameInputBox.ignoreFocusOut = true;
  nameInputBox.step = 3;
  nameInputBox.totalSteps = 3;

  nameInputBox.onDidAccept(() => {
    if (nameInputBox.value) {
      nameInputBox.hide();
      buildVirtualDocument({
        name: nameInputBox.value,
        cron: cronInputBox.value,
        source: sourceInputBox.value,
      });
    } else {
      nameInputBox.validationMessage =
        "You need to enter a name for the action.";
    }
  });
}

function createSQLAction(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    "flatSql",
    "SQL: Database Connection Info",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "media")],
    }
  );

  panel.webview.onDidReceiveMessage(
    async (message) => {
      switch (message.command) {
        case "test-connection":
          const { payload } = message;
          const { values } = payload;
          try {
            console.info("Attempting to connect to database...", values);

            const connection = await createConnection({
              type: values.protocol,
              host: values.host,
              port: values.port,
              username: values.user,
              password: values.password,
              database: values.database,
              // LOL, OK
              // https://github.com/typeorm/typeorm/issues/278#issuecomment-614345011
              ssl: true,
              extra: {
                ssl: {
                  rejectUnauthorized: false,
                },
              },
            });

            panel.webview.postMessage({
              command: "test-connection-success",
            });
            return;
          } catch (e) {
            panel.webview.postMessage({
              command: "test-connection-failure",
              payload: {
                error: e.message,
              },
            });
            return;
          }
      }
    },
    undefined,
    context.subscriptions
  );

  // Local path to css styles
  const stylesPath = vscode.Uri.joinPath(
    context.extensionUri,
    "media",
    "index.css"
  );

  const stylesUri = panel.webview.asWebviewUri(stylesPath);

  const scriptPathOnDisk = vscode.Uri.joinPath(
    context.extensionUri,
    "media",
    "index.js"
  );

  const scriptUri = panel.webview.asWebviewUri(scriptPathOnDisk);

  const nonce = getNonce();

  panel.webview.html = `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src https://unpkg.com ${panel.webview.cspSource}; img-src ${panel.webview.cspSource} 'self' data: https:; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>SQL: Database Connection Info</title>
        <link href="${stylesUri}" rel="stylesheet">
			</head>
			<body>
				<div id="app"></div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
}

interface ActionItem extends vscode.QuickPickItem {
  value: string;
}

async function test(context: vscode.ExtensionContext) {
  const document = await vscode.workspace.openTextDocument({
    language: "sql",
    content: "SELECT * from shutup",
  });

  await vscode.window.showTextDocument(document);
}

export const createAction = async (context: vscode.ExtensionContext) => {
  const quickpick = vscode.window.createQuickPick<ActionItem>();
  quickpick.ignoreFocusOut = true;
  quickpick.items = [
    {
      label: "SQL",
      value: "sql",
      description: "You'll be prompted for a connection string and a SQL query",
    },
    {
      label: "HTML",
      value: "html",
      description: "You'll be prompted for a URL and a CRON schedule",
    },
  ];
  quickpick.show();

  quickpick.onDidAccept(() => {
    const [selected] = quickpick.selectedItems;
    quickpick.hide();

    if (selected) {
      switch (selected.value) {
        case "html":
          createHTMLAction();
          break;
        case "sql":
          createSQLAction(context);
          // test(context);
          break;
        default:
          break;
      }
    }
  });
};
