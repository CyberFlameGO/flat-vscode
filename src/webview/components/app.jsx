import React from "react";
import { ConnectionString } from "connection-string";

import { ConnectionStringFormik } from "./connection-string-formik";

const STUB_CONN_STRING =
  "protocol://user:password@host1:123,[abcd::]:456/one/two?p1=val1&msg=hello+world!";

export function App() {
  const [connString, setConnString] = React.useState(STUB_CONN_STRING);
  const [parsedConnString, setParsedConnString] = React.useState();

  const handleParseString = () => {
    const parsed = new ConnectionString(connString);
    setParsedConnString({
      protocol: parsed.protocol,
      user: parsed.user,
      password: parsed.password,
      host: parsed.host,
      port: parsed.port,
    });
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        <section id="conn-string-input">
          <div className="flex space-x-2">
            <input
              className="bg-white text-sm px-2 text-black block w-full h-8"
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
        <hr className="bg-gray-100" />
        {parsedConnString && (
          <section id="conn-string-form">
            <ConnectionStringFormik initialValues={parsedConnString} />
          </section>
        )}
      </div>
    </div>
  );
}
