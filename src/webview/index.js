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

useStore.setState({
  ...initialState,
  octokit: new Octokit.Octokit({
    auth: initialState.sessionToken,
  }),
});

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
  appEl
);
