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

export function FormatInputGroup({ id, label, name, description }) {
  return (
    <div>
      <InputGroupHeader id={id} label={label} description={description} />
      <div className=" mt-2">
        <div className="flex items-center space-x-4" role="group">
          <label className="flex items-center space-x-1">
            <Field type="radio" name={name} value="json" />
            <span>JSON</span>
          </label>
          <label className="flex items-center space-x-1">
            <Field type="radio" name={name} value="csv" />
            <span>CSV</span>
          </label>
        </div>
      </div>
    </div>
  );
}

const defaultSchedules = {
  fiveMinutes: "* * * * *",
  hour: "0 * * * *",
  day: "0 0 * * * ",
};

const scheduleValues = Object.values(defaultSchedules);

export function CronInputGroup({ id, label, name, description }) {
  const [showCustom, setShowCustom] = React.useState(false);
  const [field, meta, helpers] = useField(name);
  const [customCron, setCustomCron] = React.useState("");

  React.useEffect(() => {
    if (scheduleValues.includes(field.value)) {
      setShowCustom(false);
      setCustomCron("");
    }
  }, [field.value]);

  const handleCustomCronChange = (e) => {
    setCustomCron(e.target.value);
    helpers.setValue(e.target.value);
  };

  const handleOtherChange = (e) => {
    helpers.setValue("");
    setShowCustom(true);
  };

  return (
    <div>
      <InputGroupHeader id={id} label={label} description={description} />
      <div className="space-y-4 mt-2">
        <div className="flex items-center space-x-4" role="group">
          <label className="flex items-center space-x-1">
            <Field
              type="radio"
              name={name}
              value={defaultSchedules.fiveMinutes}
            />
            <span>Five Minutes</span>
          </label>
          <label className="flex items-center space-x-1">
            <Field type="radio" name={name} value={defaultSchedules.hour} />
            <span>Hour</span>
          </label>
          <label className="flex items-center space-x-1">
            <Field type="radio" name={name} value={defaultSchedules.day} />
            <span>Day</span>
          </label>
          <label className="flex items-center space-x-1">
            <input
              onChange={handleOtherChange}
              type="radio"
              name="other"
              checked={showCustom}
            />
            <span>Other</span>
          </label>
        </div>
        {showCustom && (
          <div className="space-y-2">
            <p className="mt-1 text-xs opacity-50">
              Enter a custom CRON schedule (
              <a className="text-underline" href="https://crontab.guru/">
                Need help?
              </a>
              )
            </p>
            <div className="flex">
              <input
                value={customCron}
                onChange={handleCustomCronChange}
                className="shadow-sm block w-full"
                placeholder="Enter custom schedule"
                type="text"
              />
            </div>
          </div>
        )}
      </div>
      <ErrorMessage className="form-error" component="p" name={name} />
    </div>
  );
}
