import * as vscode from "vscode";

export const flatDecoration = vscode.window.createTextEditorDecorationType({
  cursor: "crosshair",
  fontWeight: "bold",
  backgroundColor: "rgba(255, 255, 0, .25)",
});
