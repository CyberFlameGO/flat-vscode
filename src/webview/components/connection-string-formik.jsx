import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";

const validationSchema = yup.object().shape({
  protocol: yup.string().required("Please enter a protocol"),
  host: yup.string().required("Please enter a host"),
  port: yup.string().required("Please enter a port"),
  user: yup.string().required("Please enter a username"),
  password: yup.string().required("Please enter a password"),
});

function ConnectionStringFormComponent() {
  return (
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
      <div className="flex space-x-4">
        <button
          type="submit"
          className="bg-blue-700 text-white h-8 px-2 text-sm flex-1"
        >
          Submit
        </button>
        <button
          type="button"
          className="bg-blue-700 text-white h-8 px-2 text-sm flex-shrink-0"
        >
          Test Connection
        </button>
      </div>
    </Form>
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
