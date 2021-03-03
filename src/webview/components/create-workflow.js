import React from "react";
import {
  MemoryRouter as Router,
  Switch,
  Route,
  useHistory,
} from "react-router-dom";

import { CreateSQLWorkflow } from "../pages/create-sql-workflow";
import { CreateHTTPWorkflow } from "../pages/create-http-workflow";
import { CreateHTTPSuccess } from "../pages/create-http-success";
import { CreateSQLSuccess } from "../pages/create-sql-success";

function Home() {
  const history = useHistory();

  return (
    <div className="space-y-4">
      <p>Create an automated data fetcher with Flat.</p>
      <p>How are you getting the data?</p>
      <div className="space-y-2">
        <p className="text-xs opacity-50">
          I can read the data I want from a URL
        </p>
        <button
          onClick={() => history.push("/http")}
          className="btn btn-primary w-full"
          to="/http"
        >
          Create HTTP Action
        </button>
      </div>
      <div className="space-y-2">
        <p className="text-xs opacity-50">
          I can read the data I want from a URL
        </p>
        <button
          onClick={() => history.push("/sql")}
          className="btn btn-primary w-full"
          to="/sql"
        >
          Create SQL Action
        </button>
      </div>
    </div>
  );
}

export function CreateWorkflow() {
  return (
    <Router>
      <Switch>
        <Route path="/sql">
          <CreateSQLWorkflow />
        </Route>
        <Route path="/sql-success">
          <CreateSQLSuccess />
        </Route>
        <Route path="/http">
          <CreateHTTPWorkflow />
        </Route>
        <Route path="/http-success">
          <CreateHTTPSuccess />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}
