const vscodeApi = acquireVsCodeApi();

export const vscode = {
  postMessage: vscodeApi.postMessage,
};

export function capitalize(s) {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
