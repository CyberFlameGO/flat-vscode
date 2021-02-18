import * as vscode from "vscode";

export interface CommitOptions {
  all?: boolean | "tracked";
}

export interface Branch {
  readonly name: string;
}

export interface RepositoryState {
  HEAD: Branch | undefined | null;
  refs: Branch[];
  workingTreeChanges: Change[];
  indexChanges: Change[];
  mergeChanges: Change[];
  onDidChange: vscode.Event<void>;
}

export interface Change {
  readonly uri: vscode.Uri;
}

export interface RawRepository {
  add(resources: vscode.Uri[]): Promise<void>;
  commit(message: string): Promise<void>;
  createBranch(name: string, checkout: boolean, ref?: string): Promise<void>;
  deleteBranch(name: string, force?: boolean): Promise<void>;

  checkout(treeish: string): Promise<void>;

  push(
    remoteName?: string,
    branchName?: string,
    setUpstream?: boolean
  ): Promise<void>;
}

export interface Repository {
  state: RepositoryState;

  createBranch(name: string, checkout: boolean, ref?: string): Promise<void>;
  deleteBranch(name: string, force?: boolean): Promise<void>;

  checkout(treeish: string): Promise<void>;

  push(
    remoteName?: string,
    branchName?: string,
    setUpstream?: boolean
  ): Promise<void>;

  commit(message: string, opts?: CommitOptions): Promise<void>;

  _repository: RawRepository;
}

export interface GitAPI {
  repositories: Repository[];
  getRepository(uri: vscode.Uri): Repository | null;
  onDidOpenRepository: vscode.Event<Repository>;
  onDidCloseRepository: vscode.Event<Repository>;
}
