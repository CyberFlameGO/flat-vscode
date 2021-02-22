import React from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";

import { getVsCodeApi } from "../lib";
import {
  TEST_CONNECTION,
  TEST_CONNECTION_FAILURE,
  TEST_CONNECTION_SUCCESS,
} from "../constants";
import { useEvent } from "react-use";
import { InputGroup } from "./input-group";

const validationSchema = yup.object().shape({
  protocol: yup.string().required("Please enter a protocol"),
  host: yup.string().required("Please enter a host"),
  port: yup.string().required("Please enter a port"),
  user: yup.string().required("Please enter a username"),
  password: yup.string().required("Please enter a password"),
  database: yup.string().required("Please enter a database"),
});

const vscode = getVsCodeApi();

function ConnectionStringFormComponent({ values, envVarMap, onEnvVarChange }) {
  const [testSuccess, setTestSuccess] = React.useState(false);
  const [testingError, setTestingError] = React.useState();
  const [testingStatus, setTestingStatus] = React.useState("idle");

  const handleTestConnection = async () => {
    setTestSuccess(false);
    setTestingError(undefined);
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

    switch (command) {
      case TEST_CONNECTION_SUCCESS:
        setTestingStatus("idle");
        setTestSuccess(true);
      case TEST_CONNECTION_FAILURE:
        setTestingError(payload.error);
        setTestingStatus("idle");
    }
  }, []);

  useEvent("message", onMessage);

  return (
    <div className="space-y-4">
      {testingError && (
        <div className="bg-red-100 text-red-700 p-4 border border-red-200 rounded">
          {testingError}
        </div>
      )}
      {testSuccess && (
        <div className="bg-green-100 text-green-700 p-4 border border-green-200 rounded">
          Successfully tested your connection credentials!
        </div>
      )}
      <Form className="space-y-4 flex flex-col">
        <div>
          <InputGroup
            label="Protocol"
            name="protocol"
            placeholder="Enter protocol"
            isUsingEnvVar={envVarMap["protocol"]}
            onToggle={onEnvVarChange}
          />
          {envVarMap["protocol"] && <div className="my-4">YO</div>}
        </div>
        <InputGroup
          label="Host"
          name="host"
          placeholder="Enter host"
          isUsingEnvVar={envVarMap["host"]}
          onToggle={onEnvVarChange}
        />
        <InputGroup
          label="Port"
          name="port"
          placeholder="Enter port"
          isUsingEnvVar={envVarMap["port"]}
          onToggle={onEnvVarChange}
        />
        <InputGroup
          label="Username"
          name="user"
          placeholder="Enter username"
          isUsingEnvVar={envVarMap["user"]}
          onToggle={onEnvVarChange}
        />
        <InputGroup
          label="Password"
          name="password"
          isUsingEnvVar={envVarMap["password"]}
          placeholder="Enter password"
          onToggle={onEnvVarChange}
        />
        <InputGroup
          label="Database name"
          name="database"
          placeholder="Enter database name"
          isUsingEnvVar={envVarMap["database"]}
          onToggle={onEnvVarChange}
        />
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
  const [envVarMap, setEnvVarMap] = React.useState(
    Object.keys(initialValues).reduce((acc, next) => {
      acc[next] = false;
      return acc;
    }, {})
  );

  const handleEnvVarChange = React.useCallback((envVar) => {
    setEnvVarMap((curr) => {
      return {
        ...curr,
        [envVar]: !curr[envVar],
      };
    });
  });

  // TODO: Use OctoKit to set secret values on the repo???

  return (
    <Formik
      validationSchema={validationSchema}
      validateOnBlur={false}
      validateOnChange={false}
      initialValues={initialValues}
      onSubmit={onSubmit}
      children={(props) => (
        <ConnectionStringFormComponent
          {...props}
          envVarMap={envVarMap}
          onEnvVarChange={handleEnvVarChange}
        />
      )}
    />
  );
}
