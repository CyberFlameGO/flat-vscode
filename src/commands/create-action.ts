import * as vscode from "vscode";
import cronstrue from "cronstrue";

import { buildVirtualDocument, isValidUrl } from "../lib";

export const createAction = async () => {
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
};
