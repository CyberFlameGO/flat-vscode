import React from "react";
import { Link } from "react-router-dom";
import { HTMLFormik } from "../components/html-formik";

export function CreateHTMLWorkflow() {
  const handleSubmit = (values) => {
    console.log(values);
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
        <HTMLFormik onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
