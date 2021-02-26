import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import { CreateSQLWorkflow } from "../pages/create-sql-workflow";
import { CreateHTMLWorkflow } from "../pages/create-html-workflow";
import { CreateHTMLSuccess } from "../pages/create-html-success";

function Home() {
  return (
    <div className="space-y-4">
      <p>Create an automated data fetcher with Flat.</p>
      <p>How are you getting the data?</p>
      <div className="space-y-2">
        <p className="text-xs opacity-50">
          I can read the data I want from a URL
        </p>
        <Link className="btn btn-primary w-full" to="/html">
          Create HTTP Action
        </Link>
      </div>
      <div className="space-y-2">
        <p className="text-xs opacity-50">
          I can read the data I want from a URL
        </p>
        <Link className="btn btn-primary w-full" to="/sql">
          Create SQL Action
        </Link>
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
        <Route path="/html">
          <CreateHTMLWorkflow />
        </Route>
        <Route path="/html-success">
          <CreateHTMLSuccess />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}
