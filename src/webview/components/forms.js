import React from "react";
import { Field, ErrorMessage, useField } from "formik";

function InputGroupHeader({ id, label, ariaDescription, description }) {
  return (
    <React.Fragment>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {description && (
        <p className="mt-1 text-xs opacity-50" id={ariaDescription}>
          {description}
        </p>
      )}
    </React.Fragment>
  );
}

export function InputGroup({
  id,
  placeholder,
  label,
  type = "text",
  name,
  description,
}) {
  const ariaDescription = `${id}-description`;

  return (
    <div>
      <InputGroupHeader
        label={label}
        id={id}
        ariaDescription={ariaDescription}
        description={description}
      />
      <div className="mt-2">
        <Field
          type={type}
          name={name}
          id={id}
          className="shadow-sm block w-full"
          placeholder={placeholder}
          aria-describedby={ariaDescription}
        />
      </div>
      <ErrorMessage className="form-error" component="p" name={name} />
    </div>
  );
}

export function CronInputGroup({ id, label, name, description }) {
  const [field, meta, helpers] = useField(name);
  const [customCron, setCustomCron] = React.useState("");

  const handleCustomCronChange = (e) => {
    setCustomCron(e.target.value);
  };

  const handleSaveCustomCron = () => {
    helpers.setValue(customCron);
  };

  return (
    <div>
      <InputGroupHeader id={id} label={label} description={description} />
      <div className="space-y-4 mt-2">
        <div className="flex items-center space-x-4" role="group">
          <label className="flex items-center space-x-1">
            <Field type="radio" name={name} value="* * * * *" />
            <span>Five Minutes</span>
          </label>
          <label className="flex items-center space-x-1">
            <Field type="radio" name={name} value="0 * * * *" />
            <span>Hour</span>
          </label>
          <label className="flex items-center space-x-1">
            <Field type="radio" name={name} value="0 0 * * *" />
            <span>Day</span>
          </label>
        </div>
        <div className="space-y-2">
          <p className="mt-1 text-xs opacity-50">
            Or, use a custom CRON schedule (
            <a className="text-underline" href="https://crontab.guru/">
              Need help?
            </a>
            )
          </p>
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                value={customCron}
                onChange={handleCustomCronChange}
                className="shadow-sm block w-full"
                placeholder="Enter custom schedule"
                type="text"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveCustomCron}
              className="btn btn-secondary"
            >
              Save
            </button>
          </div>
        </div>
      </div>
      <ErrorMessage className="form-error" component="p" name={name} />
    </div>
  );
}
