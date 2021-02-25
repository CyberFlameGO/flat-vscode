import { useQuery } from "react-query";
import { useStore } from "../store";

export function useWorkflowRuns() {
  const { octokit, repo } = useStore();

  return useQuery("runs", () =>
    octokit.actions.listWorkflowRunsForRepo({
      repo: repo.name,
      owner: repo.owner,
    })
  );
}
