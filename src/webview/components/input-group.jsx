import React from "react";
import { Field, ErrorMessage } from "formik";

export function InputGroup({
  name,
  id = name,
  label,
  placeholder,
  type = "text",
  isUsingEnvVar = false,
  onToggle,
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 flex rounded-md shadow-sm">
        <div className="relative flex items-stretch flex-grow focus-within:z-10">
          <Field
            type={type}
            name={name}
            id={id}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 text-gray-900"
            placeholder={placeholder}
          />
        </div>
        <button
          type="button"
          onClick={() => onToggle(name)}
          className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-xs rounded-r-md  bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
        >
          <input
            defaultChecked={isUsingEnvVar}
            checked={isUsingEnvVar}
            type="checkbox"
            className="pointer-events-none rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <span className="text-gray-700">Use Env Var</span>
        </button>
      </div>
      <ErrorMessage
        className="mt-2 text-xs text-red-600"
        component="p"
        name={name}
      ></ErrorMessage>
    </div>
  );
}
