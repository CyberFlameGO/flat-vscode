import * as vscode from "vscode";
import { createConnection, DatabaseType } from "typeorm";
import { ConnectionString } from "connection-string";

import { buildHtmlYaml, buildSqlYaml, isValidUrl } from "../lib";
import store from "../store";
import { makeCronInput } from "../ui";

interface ActionItem extends vscode.QuickPickItem {
  value: string;
}

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

  const cronInputBox = makeCronInput({
    onSuccess: () => {
      nameInputBox.show();
    },
    step: 2,
    totalSteps: 3,
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
      buildHtmlYaml({
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

async function createSQLAction() {
  const { getState } = store;
  const { setConnectionString } = getState();

  const cronInputBox = makeCronInput({
    onSuccess: () => {
      nameInputBox.show();
    },
    step: 2,
    totalSteps: 3,
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
      buildSqlYaml({
        name: nameInputBox.value,
        cron: cronInputBox.value,
      });
    } else {
      nameInputBox.validationMessage =
        "You need to enter a name for the action.";
    }
  });

  const connStringInputBox = vscode.window.createInputBox();
  connStringInputBox.placeholder = "Connection string";
  connStringInputBox.title = "Enter database connection string";
  connStringInputBox.ignoreFocusOut = true;
  connStringInputBox.show();
  connStringInputBox.step = 1;
  connStringInputBox.totalSteps = 3;

  connStringInputBox.onDidAccept(() => {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Window,
        title: "Testing Connection String",
      },
      async () => {
        try {
          const parsed = new ConnectionString(connStringInputBox.value);
          let protocol = parsed.protocol as DatabaseType;

          if (!protocol) {
            vscode.window.showErrorMessage("Unable to connect to database...");
            return;
          }

          // @ts-ignore
          const connection = await createConnection({
            type: protocol,
            url: connStringInputBox.value,
            ssl: true,
            extra: {
              ssl: {
                rejectUnauthorized: false,
              },
            },
          });

          await connection.close();

          connStringInputBox.hide();

          vscode.window.showInformationMessage(
            "Successfully tested database connection..."
          );

          setConnectionString(connStringInputBox.value);

          cronInputBox.show();
        } catch (e) {
          console.log(e);
          vscode.window.showErrorMessage("Unable to connect to database...");
          return;
        }
      }
    );
  });
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

  quickpick.onDidAccept(() => {
    const [selected] = quickpick.selectedItems;
    quickpick.hide();

    if (selected) {
      vscode.commands.executeCommand(
        "setContext",
        "flat:actionType",
        selected.value
      );

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
