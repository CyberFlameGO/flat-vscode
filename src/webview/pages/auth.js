import React from "react";

import { AUTH_WITH_GITHUB } from "../constants";
import { vscode } from "../lib";

export function Auth() {
  const handleAuth = () => {
    vscode.postMessage({
      command: AUTH_WITH_GITHUB,
    });
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        <p>In order to use Flat, you need to authenticate with GitHub.</p>
        <button onClick={handleAuth} className="btn btn-primary">
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
}
