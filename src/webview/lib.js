const vscodeApi = acquireVsCodeApi();

export const vscode = {
  postMessage: vscodeApi.postMessage,
};
