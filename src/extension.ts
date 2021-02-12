import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "data-experiment" is now active!'
  );

  let disposable = vscode.commands.registerCommand(
    "data-experiment.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from data-experiment!");
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
