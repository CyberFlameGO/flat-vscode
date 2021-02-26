import React from "react";

import { MESSAGES } from "../../constants";
import { vscode } from "../lib";

export function Auth() {
  const handleAuth = () => {
    vscode.postMessage({
      command: MESSAGES.authWithGitHub,
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
