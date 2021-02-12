import * as vscode from "vscode";
import * as Octokit from "@octokit/rest";

export class RepositoryItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    this.tooltip = this.label;
    this.description = this.description;
    this.command = this.command;
  }
}

export class IssueItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    this.tooltip = this.label;
    this.description = this.description;
    this.command = this.command;
  }
}

export class RepositoriesProvider
  implements vscode.TreeDataProvider<RepositoryItem> {
  private octokit: Octokit.Octokit;
  private _onDidChangeTreeData: vscode.EventEmitter<
    RepositoryItem | undefined | void
  > = new vscode.EventEmitter<RepositoryItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<
    RepositoryItem | undefined | void
  > = this._onDidChangeTreeData.event;

  constructor(octokit: Octokit.Octokit) {
    this.octokit = octokit;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: RepositoryItem): vscode.TreeItem {
    return element;
  }

  async getChildren(
    element?: RepositoryItem
  ): Promise<RepositoryItem[] | IssueItem[]> {
    const userInfo = await this.octokit.users.getAuthenticated();

    if (!element) {
      const repos = await this.octokit.request("GET /users/{username}/repos", {
        username: userInfo.data.login,
      });

      return repos.data.map((repo) => {
        return new RepositoryItem(
          repo.name,
          repo.description ?? "No description provided",
          vscode.TreeItemCollapsibleState.Collapsed
        );
      });
    } else {
      const issues = await this.octokit.issues.listForRepo({
        repo: element.label,
        owner: userInfo.data.login,
      });

      return issues.data.map((issue) => {
        return new IssueItem(
          issue.title,
          issue.body || "No body for this issue",
          vscode.TreeItemCollapsibleState.Collapsed,
          {
            command: "data-experiment.openIssueOnGitHub",
            title: "",
            arguments: [issue.url],
          }
        );
      });
    }
  }
}
