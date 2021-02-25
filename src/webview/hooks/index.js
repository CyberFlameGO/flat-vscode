import { useQuery } from "react-query";
import { getWorkflowRuns, getWorkflow } from "../api";

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
