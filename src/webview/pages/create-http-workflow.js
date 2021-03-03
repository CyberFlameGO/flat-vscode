import React from "react";
import { useHistory } from "react-router-dom";
import { useEvent } from "react-use";

import { HTTPFormik } from "../components/http-formik";
import { MESSAGES } from "../../constants";
import { vscode } from "../lib";

export function CreateHTTPWorkflow() {
  const history = useHistory();
  const [status, setStatus] = React.useState("idle");

  const handleMessage = (e) => {
    const message = e.data;
    switch (message.command) {
      case MESSAGES.createHttpSuccess:
        setStatus("success");
    }
  };

  useEvent("message", handleMessage);

  const handleSubmit = async (values) => {
    await vscode.postMessage({
      command: MESSAGES.createHttpWorkflow,
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
          <span className="font-bold">Create HTTP Action</span>
        </div>
      </header>
      <div className="my-4">
        <HTTPFormik status={status} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
