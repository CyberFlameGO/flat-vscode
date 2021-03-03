import React from "react";
import { useHistory } from "react-router-dom";
import { useEvent } from "react-use";

import { SQLFormik } from "../components/sql-formik";
import { vscode } from "../lib";
import { MESSAGES } from "../../constants";

export function CreateSQLWorkflow() {
  const history = useHistory();
  const [status, setStatus] = React.useState("idle");

  const handleMessage = (e) => {
    const message = e.data;
    switch (message.command) {
      case MESSAGES.createSqlSuccess:
        setStatus("success");
    }
  };

  useEvent("message", handleMessage);

  const handleSubmit = async (values) => {
    await vscode.postMessage({
      command: MESSAGES.createSqlWorkflow,
      payload: values,
    });

    setStatus("loading");
  };

  return (
    <div>
      <header>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => history.push("/")}
            className="appearance-none text-underline"
          >
            Home
          </button>
          <span>&gt;</span>
          <span className="font-bold">Create SQL Action</span>
        </div>
      </header>
      <div className="my-4">
        <SQLFormik status={status} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
