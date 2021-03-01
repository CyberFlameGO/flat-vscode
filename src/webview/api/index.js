import { useStore } from "../store";

export async function getRun({ queryKey }) {
  const { octokit, repo } = useStore.getState();
  const [_key, { id }] = queryKey;

  const res = await octokit.actions.getWorkflowRun({
    repo: repo.name,
    owner: repo.owner,
    run_id: id,
  });

  return res.data;
}

export async function getWorkflowRuns() {
  const { octokit, repo } = useStore.getState();
  const res = await octokit.actions.listWorkflowRunsForRepo({
    repo: repo.name,
    owner: repo.owner,
  });

  return res.data;
}

export async function getWorkflow() {
  const { octokit, repo } = useStore.getState();
  const res = await octokit.actions.getWorkflow({
    repo: repo.name,
    owner: repo.owner,
    workflow_id: "flat.yaml",
  });
  return res.data;
}
