import { Octokit } from "@octokit/rest";
import { Endpoints } from "@octokit/types";
import * as vscode from "vscode";
import { formatRelative, differenceInSeconds } from "date-fns";

import { VSCodeGit } from "../lib";

type listWorkflowRunsResponse = Endpoints["GET /repos/{owner}/{repo}/actions/runs"]["response"];
type listWorkflowJobsResponse = Endpoints["GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs"]["response"];

type WorkflowRun = listWorkflowRunsResponse["data"]["workflow_runs"][0];
type Step = listWorkflowJobsResponse["data"]["jobs"][0]["steps"][0];

function makeWorkflowLabel(run: WorkflowRun) {
  const relativeDate = formatRelative(Date.parse(run.created_at), new Date());
  return `${run.conclusion === "success" ? "✅" : "💥"} ${relativeDate}`;
}

function makeStepLabel(step: Step) {
  return `${step.conclusion === "success" ? "✅" : "💥"} ${step.name}`;
}

function calculateStepDirection(step: Step) {
  return differenceInSeconds(
    new Date(step.completed_at),
    new Date(step.started_at)
  );
}

async function waitForRepo(
  gitClient: VSCodeGit
): Promise<{ name: string; owner: string }> {
  let name = "",
    owner = "";
  return new Promise((resolve) => {
    const checkRepoExists = setInterval(() => {
      const details = gitClient.repoDetails;
      if (details.name && details.owner) {
        name = details.name;
        owner = details.owner;
        clearInterval(checkRepoExists);
        resolve({ name, owner });
      }
    }, 1000);
  });
}

class StepItem extends vscode.TreeItem {
  constructor(
    public readonly step: Step,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(makeStepLabel(step), collapsibleState);
    this.description = `Duration: ${calculateStepDirection(step)}s`;
    this.command = this.command;
  }
}

class WorkflowRunItem extends vscode.TreeItem {
  constructor(
    public readonly run: WorkflowRun,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(makeWorkflowLabel(run), collapsibleState);
    this.label = makeWorkflowLabel(run);
    this.description = `Run #${run.run_number}`;
    this.command = this.command;
  }
}

export class WorkflowRunsProvider
  implements vscode.TreeDataProvider<WorkflowRunItem | StepItem> {
  private octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  getTreeItem(element: WorkflowRunItem | StepItem) {
    return element;
  }

  async getChildren(element?: WorkflowRunItem) {
    const gitClient = new VSCodeGit();
    await gitClient.activateExtension();

    const { name, owner } = await waitForRepo(gitClient);

    if (!element) {
      const workflowRunsRes = await this.octokit.actions.listWorkflowRunsForRepo(
        {
          owner: owner,
          repo: name,
        }
      );

      const { workflow_runs } = workflowRunsRes.data;

      return workflow_runs.map((run: WorkflowRun) => {
        return new WorkflowRunItem(
          run,
          vscode.TreeItemCollapsibleState.Collapsed
        );
      });
    } else {
      const runId = element.run.id;
      const runDetailResponse = await this.octokit.actions.listJobsForWorkflowRun(
        {
          owner,
          repo: name,
          run_id: runId,
        }
      );

      const { jobs } = runDetailResponse.data;

      return jobs[0].steps.map((step: Step) => {
        return new StepItem(step, vscode.TreeItemCollapsibleState.None);
      });
    }
  }
}
