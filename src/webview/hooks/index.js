import { useQuery } from "react-query";
import { getWorkflowRuns, getWorkflow, getRun } from "../api";

export function useRun(id, config) {
  return useQuery(["run", { id }], getRun, {
    retry: false,
    refetchOnWindowFocus: false,
    ...config,
  });
}

export function useWorkflowRuns() {
  return useQuery("runs", getWorkflowRuns, {
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useWorkflow() {
  return useQuery("workflow", getWorkflow, {
    retry: false,
    refetchOnWindowFocus: false,
  });
}
