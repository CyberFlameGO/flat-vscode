import React from "react";
import { useWorkflowRuns } from "../hooks";

// const vscode = acquireVsCodeApi();
// const previousState = vscode.getState();
// console.log(vscode, previousState);

export function App() {
  const { data, status, isLoading, isSuccess } = useWorkflowRuns();

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {isSuccess && <div>{data.data.total_count} workflow runs</div>}
    </div>
  );
}
