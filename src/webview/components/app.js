import React from "react";

import { useStore } from "../store";

import { Auth } from "../pages/auth";
import { NoUpstreamWarning } from "../pages/no-upstream-warning";
import { ManageOrCreate } from "../pages/manage-or-create";

export function App() {
  const { repo, octokit } = useStore();
  const hasRepo = repo.name && repo.owner;

  if (!octokit) {
    return <Auth />;
  } else {
    return (
      <React.Fragment>
        {hasRepo ? <ManageOrCreate /> : <NoUpstreamWarning />}
      </React.Fragment>
    );
  }
}
