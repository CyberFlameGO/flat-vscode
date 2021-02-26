import React from "react";

export function NoUpstreamWarning() {
  return (
    <div className="p-4">
      <div className="space-y-4">
        <p>Flat only works on GitHub repos with valid upstream remotes.</p>
      </div>
    </div>
  );
}
