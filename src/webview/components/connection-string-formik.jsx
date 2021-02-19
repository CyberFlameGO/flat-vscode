import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";

import { getVsCodeApi } from "../lib";
import {
  TEST_CONNECTION,
  TEST_CONNECTION_FAILURE,
  TEST_CONNECTION_SUCCESS,
} from "../constants";
import { useEvent } from "react-use";

const validationSchema = yup.object().shape({
  protocol: yup.string().required("Please enter a protocol"),
  host: yup.string().required("Please enter a host"),
  port: yup.string().required("Please enter a port"),
  user: yup.string().required("Please enter a username"),
  password: yup.string().required("Please enter a password"),
  database: yup.string().required("Please enter a database"),
});

const vscode = getVsCodeApi();

function ConnectionStringFormComponent({ values }) {
  const [testingError, setTestingError] = React.useState();
  const [testingStatus, setTestingStatus] = React.useState("idle");

  const handleTestConnection = async () => {
    setTestingStatus("loading");

    vscode.postMessage({
      command: TEST_CONNECTION,
      payload: {
        values,
      },
    });
  };

  const onMessage = React.useCallback((event) => {
    const message = event.data;
    const { command, payload } = message;
    console.log({ payload });

    switch (command) {
      case TEST_CONNECTION_SUCCESS:
        setTestingStatus("idle");
      case TEST_CONNECTION_FAILURE:
        setTestingError(payload.error);
        setTestingStatus("idle");
    }
  }, []);

  useEvent("message", onMessage);

  return (
    <div className="space-y-4">
      {testingError && (
        <div className="bg-red-100 text-red-700 p-4 border border-red-200">
          {JSON.stringify(testingError, null, 2)}
        </div>
      )}
      <Form className="space-y-4 flex flex-col">
        <div className="space-y-1">
          <Field
            name="protocol"
            className="h-8 px-2 text-sm block text-black w-full"
            placeholder="Protocol"
          />
          <ErrorMessage
            component="p"
            className="text-sm text-red-600"
            name="protocol"
          />
        </div>
        <div className="space-y-1">
          <Field
            name="host"
            className="h-8 px-2 text-sm block text-black w-full"
            placeholder="Host"
          />
          <ErrorMessage
            component="p"
            className="text-sm text-red-600"
            name="host"
          />
        </div>
        <div className="space-y-1">
          <Field
            name="port"
            className="h-8 px-2 text-sm block text-black w-full"
            placeholder="Port "
          />
          <ErrorMessage
            component="p"
            className="text-sm text-red-600"
            name="port"
          />
        </div>
        <div className="space-y-1">
          <Field
            name="user"
            className="h-8 px-2 text-sm block text-black w-full"
            placeholder="Username"
          />
          <ErrorMessage
            component="p"
            className="text-sm text-red-600"
            name="user"
          />
        </div>
        <div className="space-y-1">
          <Field
            name="password"
            className="h-8 px-2 text-sm block text-black w-full"
            placeholder="Password"
          />
          <ErrorMessage
            component="p"
            className="text-sm text-red-600"
            name="password"
          />
        </div>
        <div className="space-y-1">
          <Field
            name="database"
            className="h-8 px-2 text-sm block text-black w-full"
            placeholder="Database"
          />
          <ErrorMessage
            component="p"
            className="text-sm text-red-600"
            name="database"
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-700 text-white h-8 px-2 text-sm flex-1"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingStatus === "loading"}
            className="bg-blue-700 text-white h-8 px-2 text-sm flex-shrink-0"
          >
            {testingStatus === "idle" && "Test Connection"}
            {testingStatus === "loading" && "Testing..."}
          </button>
        </div>
      </Form>
    </div>
  );
}

export function ConnectionStringFormik({ initialValues, onSubmit }) {
  return (
    <Formik
      validationSchema={validationSchema}
      validateOnBlur={false}
      validateOnChange={false}
      initialValues={initialValues}
      onSubmit={onSubmit}
      component={ConnectionStringFormComponent}
    />
  );
}
