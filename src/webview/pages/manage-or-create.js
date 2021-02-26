import React from "react";
import { useWorkflow } from "../hooks";
import { CreateWorkflow } from "../components/create-workflow";

export function ManageOrCreate() {
  const { isLoading, isSuccess, isError } = useWorkflow();

  return (
    <div className="p-4">
      {isLoading && <div>Loading workflow information...</div>}
      {isSuccess && <div>List workflow runs</div>}
      {isError && <CreateWorkflow />}
    </div>
  );
}
