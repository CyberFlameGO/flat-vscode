import React from "react";
import { Link } from "react-router-dom";
import { useEvent } from "react-use";

import { HTMLFormik } from "../components/html-formik";
import { vscode } from "../lib";

export function CreateHTMLWorkflow() {
  const [status, setStatus] = React.useState("idle");

  const handleMessage = (e) => {
    const message = e.data;
    switch (message.command) {
      case "create-html-success":
        setStatus("success");
    }
  };

  useEvent("message", handleMessage);

  const handleSubmit = async (values) => {
    await vscode.postMessage({
      command: "create-html-workflow",
      payload: values,
    });

    setStatus("loading");
  };

  return (
    <div>
      <header>
        <div className="flex items-center space-x-1">
          <Link className="text-underline" to="/">
            Home
          </Link>
          <span>&gt;</span>
          <span className="font-bold">Create HTTP Action</span>
        </div>
      </header>
      <div className="my-4">
        <HTMLFormik status={status} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
