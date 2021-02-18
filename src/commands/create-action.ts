import * as vscode from "vscode";
import cronstrue from "cronstrue";

import { buildVirtualDocument, isValidUrl } from "../lib";

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

function getSqlWebViewContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SQL: Database Connection Info</title>
    <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
    <script type="text/javascript">
      function app () {
        return {
          form: {
            host: "",
            port: "",
            username: "",
            password: "",
            database: ""
          },
          isTesting: false,
          handleTest () {
            this.isTesting = true;
          },
          handleSubmit (e) {
            e.preventDefault();
            console.log(e)
          }
        }
      }
    </script>  
    <script src="https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.x.x/dist/alpine.min.js" defer></script>
</head>
<body class="p-4">
  <div x-data="app()">
    <form class="space-y-4 flex flex-col" @submit="handleSubmit">
      <input x-model="form.host" class="p-2 text-sm block text-black" placeholder="Host" />
      <input x-model="form.port" class="p-2 text-sm block text-black" placeholder="Port " />
      <input x-model="form.username" class="p-2 text-sm block text-black" placeholder="Username " />
      <input x-model="form.password" class="p-2 text-sm block text-black" placeholder="Password " />
      <input x-model="form.database" class="p-2 text-sm block text-black" placeholder="Database " />
      <div class="flex space-x-4">
        <button type="submit" class="bg-blue-700 text-white p-2 text-sm flex-1">Submit</button>
        <button type="button" @click="handleTest" class="bg-blue-700 text-white p-2 text-sm flex-shrink-0">
          <template x-if="isTesting">
            <span>Testing...</span>
          </template>
          <template x-if="!isTesting">
            <span>Test Connection</span>
          </template>
        </button>
      </div>
    </form>
  </div>
  
</body>

</html>`;
}

function createSQLAction() {
  const panel = vscode.window.createWebviewPanel(
    "flatSql",
    "SQL: Database Connection Info",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
    }
  );

  panel.webview.html = getSqlWebViewContent();
}

interface ActionItem extends vscode.QuickPickItem {
  value: string;
}

export const createAction = async () => {
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

  quickpick.onDidAccept((e) => {
    const [selected] = quickpick.selectedItems;
    quickpick.hide();

    if (selected) {
      switch (selected.value) {
        case "html":
          createHTMLAction();
          break;
        case "sql":
          createSQLAction();
          break;
        default:
          break;
      }
    }
  });
};
