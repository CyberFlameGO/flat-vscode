import React from "react";
import { useWorkflow } from "../hooks";
import { CreateWorkflow } from "../components/create-workflow";
import { WorkflowRuns } from "../components/workflow-runs";
import { Spinner } from "../components/spinner";

export function ManageOrCreate() {
  const { isLoading, isSuccess, isError } = useWorkflow();

  return (
    <div className="p-4">
      {isLoading && <Spinner>Loading workflow information...</Spinner>}
      {isSuccess && <WorkflowRuns />}
      {isError && <CreateWorkflow />}
    </div>
  );
}
