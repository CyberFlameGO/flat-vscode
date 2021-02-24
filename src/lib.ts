import * as vscode from "vscode";
import { URL } from "url";

import { GitAPI } from "./types";
import { flatDecoration } from "./decorations";

const GitUrlParse = require("git-url-parse");

interface ActionParams {
  type?: string;
  name?: string;
  cron?: string;
  source?: string;
}

export function makeActionYaml(params: ActionParams) {
  const { name, cron, type, source } = params;
  return `name: ${name}

on:
  push:
    branches:
      - main
  workflow_dispatch:
  schedule:
    - cron: '${cron}'
  
jobs:
  scheduled:
    runs-on: ubuntu-latest
    steps:
    - name: Check out repo
      uses: actions/checkout@v2
    - name: Fetch data
      uses: githubocto/flat-action@v1
      with:
        ${type === "html" ? `url: '${source}'` : ""}
        ${
          type === "sql"
            ? `
        # We'll upload an encrypted version of your connection string as a secret
        connstring: \${{ secrets.CONNSTRING }}
        `
            : "\n"
        }
        ${
          type === "sql"
            ? `
      # After hitting "Save and Commit Action", you'll be prompted to write your SQL query.
        queryfile: query.sql`
            : "\n"
        }
    - name: Commit and push if changed
      run: |-
        git config user.name "Flat"
        git config user.email "actions@users.noreply.github.com"
        git add -A
        timestamp=$(date -u)
        git commit -m "Latest data: \${timestamp}" || exit 0
        git push
`.replace(/^\s*[\r\n]/gm, "");
}

interface GitExtension {
  getAPI(version: number): GitAPI;
}

export class VSCodeGit {
  extension: vscode.Extension<GitExtension>;

  constructor() {
    const gitExtension = vscode.extensions.getExtension("vscode.git");

    if (!gitExtension) {
      throw new Error("Git extension not found");
    }

    this.extension = gitExtension;
  }

  async activateExtension() {
    await this.extension.activate();
  }

  get rawGit() {
    // Unsure about this magic number, but it works.
    return this.extension.exports.getAPI(1);
  }

  get repoDetails() {
    const remotes = this.repository._repository.remotes;
    if (remotes.length === 0) {
      throw new Error(
        "No remotes found. Are you sure you've created an upstream repo?"
      );
    }

    const remote = remotes[0];
    const parsed = GitUrlParse(remote.pushUrl);
    return {
      name: parsed.name,
      owner: parsed.owner,
    };
  }

  get repository() {
    return this.rawGit.repositories[0];
  }

  get workingTreeChanges() {
    if (!this.repository) {
      throw new Error("No repository found. Are you sure you're in a repo?");
    }

    return this.repository.state.workingTreeChanges;
  }

  add(resources: vscode.Uri[]) {
    if (!this.repository) {
      throw new Error("No repository found. Are you sure you're in a repo?");
    }

    this.repository._repository.add(resources);
  }

  commit(message: string) {
    if (!this.repository) {
      throw new Error("No repository found. Are you sure you're in a repo?");
    }

    this.repository._repository.commit(message);
  }
}

export function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function makeRangeFromMatch(line: number, match: RegExpMatchArray) {
  return new vscode.Range(
    // @ts-ignore
    new vscode.Position(line, match.index),
    // @ts-ignore
    new vscode.Position(line, match.index + match[0].length)
  );
}

export function isValidUrl(input: string) {
  let url;

  try {
    url = new URL(input);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

interface BuildHtmlYamlParams {
  name: string;
  cron: string;
  source: string;
}

export async function buildHtmlYaml(params: BuildHtmlYamlParams) {
  const { name, source, cron } = params;

  const uri = vscode.Uri.parse(
    `flat:/schedule.yaml?name=${name}&cron=${cron}&source=${source}&type=html`
  );
  let doc = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc, { preview: false });

  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const decorations: vscode.DecorationOptions[] = [];
  const sourceCode = editor.document.getText();
  const sourceCodeArr = sourceCode.split("\n");

  const nameRegex = new RegExp(name);
  const cronRegex = new RegExp(escapeRegExp(cron));
  const sourceRegex = new RegExp(source, "i");

  for (let line = 0; line < sourceCodeArr.length; line++) {
    const nameMatch = sourceCodeArr[line].match(nameRegex);
    const cronMatch = sourceCodeArr[line].match(cronRegex);
    const sourceMatch = sourceCodeArr[line].match(sourceRegex);

    if (nameMatch) {
      const nameDecoration = {
        range: makeRangeFromMatch(line, nameMatch),
        hoverMessage: "Name of action",
      };
      decorations.push(nameDecoration);
    }

    if (cronMatch) {
      const cronDecoration = {
        range: makeRangeFromMatch(line, cronMatch),
        hoverMessage: "CRON Schedule",
      };
      decorations.push(cronDecoration);
    }

    if (sourceMatch) {
      const sourceDecoration = {
        range: makeRangeFromMatch(line, sourceMatch),
        hoverMessage: "Data Source",
      };
      decorations.push(sourceDecoration);
    }
  }

  editor.setDecorations(flatDecoration, decorations);
}

interface BuildSqlYamlParams {
  cron: string;
  name: string;
}

export async function buildSqlYaml(params: BuildSqlYamlParams) {
  const { cron, name } = params;

  const uri = vscode.Uri.parse(
    `flat:/schedule.yaml?name=${name}&cron=${cron}&type=sql`
  );
  let doc = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc, { preview: false });
}

interface GetSessionParams {
  createIfNone: boolean;
}

const GITHUB_AUTH_PROVIDER_ID = "github";
const SCOPES = ["user:email", "repo"];

export function getSession(params: GetSessionParams) {
  const { createIfNone } = params;
  return vscode.authentication.getSession(GITHUB_AUTH_PROVIDER_ID, SCOPES, {
    createIfNone,
  });
}
