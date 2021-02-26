import React from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import * as cronstrue from "cronstrue";
import { Redirect } from "react-router-dom";

import {
  InputGroup,
  CronInputGroup,
  FormatInputGroup,
} from "../components/forms";
import { vscode } from "../lib";

const initialValues = {
  source: "",
  cron: "",
  name: "",
  format: "json",
};

const validationSchema = yup.object().shape({
  source: yup
    .string()
    .required("Please enter a database connection string")
    .test("is-valid-connstring", async function (value) {
      if (!value) return;
      function waitForResponse() {
        return new Promise((resolve, reject) => {
          window.addEventListener("message", function (e) {
            const message = e.data;
            if (message.command === "database-connect-success") {
              resolve();
            } else if (message.command === "database-connect-error") {
              reject();
            }
          });
        });
      }

      vscode.postMessage({
        command: "test-connection-string",
        payload: {
          connstring: value,
        },
      });

      try {
        await waitForResponse();
        return true;
      } catch (e) {
        return false;
      }
    }),
  cron: yup
    .string()
    .required("Please enter a CRON schedule")
    .test(
      "is-valid-cron",
      "${originalValue} is not valid CRON",
      function (value) {
        try {
          cronstrue.toString(value);
          return true;
        } catch (e) {
          return false;
        }
      }
    ),
  name: yup.string().required("Please enter a Name"),
  format: yup.string().required("Please choose a format"),
});

function FormComponent({ status, isSubmitting, isValid }) {
  const isLoading = status === "loading" || isSubmitting;

  return (
    <Form>
      <div className="space-y-8">
        <InputGroup
          name="source"
          label="Where is the data?"
          id="source"
          placeholder="Enter connection string"
          description="This needs to be a stable, unchanging database connection string"
        />
        <CronInputGroup
          name="cron"
          label="How often should the data be fetched?"
          id="cron"
          description="Once every..."
        />
        <InputGroup
          name="name"
          label="What should we call this action?"
          id="name"
          placeholder="Enter name"
        />
        <FormatInputGroup
          name="format"
          label="What format should we save the data as?"
          id="format"
        />
        <button
          disabled={isLoading}
          className="btn btn-primary w-full"
          type="submit"
        >
          {isLoading
            ? isValid
              ? "Creating..."
              : "Validating"
            : "Create and Commit Action"}
        </button>
      </div>
    </Form>
  );
}

export function SQLFormik({ onSubmit, status }) {
  if (status === "success") {
    return <Redirect to="/sql-success" />;
  } else {
    return (
      <Formik
        initialValues={initialValues}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={validationSchema}
        component={(props) => <FormComponent {...props} status={status} />}
        onSubmit={onSubmit}
      />
    );
  }
}
