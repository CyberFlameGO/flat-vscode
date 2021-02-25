import React from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import * as cronstrue from "cronstrue";

import { InputGroup, CronInputGroup } from "../components/forms";

const initialValues = {
  source: "",
  cron: "",
  name: "",
};

const validationSchema = yup.object().shape({
  source: yup.string().url("URL is invalid.").required("Please enter a URL"),
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
});

function FormComponent() {
  return (
    <Form>
      <div className="space-y-8">
        <InputGroup
          name="source"
          label="Where is the data?"
          id="source"
          placeholder="Enter URL"
          description="This needs to be a stable, unchanging URL"
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
        <button className="btn btn-primary w-full" type="submit">
          Create Action
        </button>
      </div>
    </Form>
  );
}

export function HTMLFormik({ onSubmit }) {
  return (
    <Formik
      initialValues={initialValues}
      validateOnChange={false}
      validateOnBlur={false}
      validationSchema={validationSchema}
      component={FormComponent}
      onSubmit={onSubmit}
    />
  );
}
