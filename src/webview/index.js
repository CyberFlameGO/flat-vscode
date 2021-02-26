import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import * as Octokit from "@octokit/rest";

import "./styles.css";
import { App } from "./components/app";
import { useStore } from "./store";

const appEl = document.getElementById("app");
const initialState = JSON.parse(appEl.getAttribute("data-state"));
const queryClient = new QueryClient();

// INCANTATION FOR GETTING STATE
// const vscode = acquireVsCodeApi();
// const previousState = vscode.getState();
// console.log(vscode, previousState);

useStore.setState({
  ...initialState,
  octokit: initialState.sessionToken
    ? new Octokit.Octokit({
        auth: initialState.sessionToken,
      })
    : null,
});

console.log("booted with", initialState);

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
  appEl
);
