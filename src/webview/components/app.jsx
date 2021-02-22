import React from "react";
import { ConnectionString } from "connection-string";

import { ConnectionStringFormik } from "./connection-string-formik";

const STUB_CONN_STRING =
  "postgres://abpgdbkqadfusn:9fd749957378141f616a01328ade277ef88f5bd6feb09443f5c139a4b3a88ad6@ec2-54-221-221-153.compute-1.amazonaws.com:5432/d2h501tj836d0v";

export function App() {
  const [connString, setConnString] = React.useState(STUB_CONN_STRING);
  const [parsedConnString, setParsedConnString] = React.useState();

  const handleParseString = () => {
    try {
      const parsed = new ConnectionString(connString);
      console.info("Parsed the following values", parsed);

      setParsedConnString({
        protocol: parsed.protocol,
        user: parsed.user,
        password: parsed.password,
        host: parsed.hostname,
        port: parsed.port,
        database: parsed?.path[0] || "",
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <section
        className="bg-gray-100 border-b border-gray-200 p-4"
        id="conn-string-input"
      >
        <div className="flex space-x-2">
          <input
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900 p-2"
            value={connString}
            placeholder="Enter database connection string..."
            onChange={(e) => setConnString(e.target.value)}
          />
          <div className="flex-shrink-0">
            <button
              className="bg-blue-600 text-white h-full px-4 h-8"
              onClick={handleParseString}
            >
              Parse Connection String
            </button>
          </div>
        </div>
      </section>
      {parsedConnString && (
        <section className="p-4" id="conn-string-form">
          <ConnectionStringFormik initialValues={parsedConnString} />
        </section>
      )}
    </div>
  );
}
