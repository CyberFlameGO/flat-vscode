import * as vscode from "vscode";
import * as cronstrue from "cronstrue";

interface CronInputParams {
  onSuccess: () => void;
  step: number;
  totalSteps: number;
}

export function makeCronInput(params: CronInputParams) {
  const cronInputBox = vscode.window.createInputBox();
  cronInputBox.placeholder = "CRON";
  cronInputBox.title = "Enter CRON schedule for this action";
  cronInputBox.ignoreFocusOut = true;
  cronInputBox.step = params.step;
  cronInputBox.totalSteps = params.totalSteps;

  cronInputBox.onDidAccept(() => {
    if (cronInputBox.value && cronstrue.toString(cronInputBox.value)) {
      params.onSuccess();
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

  return cronInputBox;
}
