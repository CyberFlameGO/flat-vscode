import * as vscode from "vscode";
import { GitAPI } from "./types";
import { URL } from "url";

import { flatDecoration } from "./decorations";

interface ActionParams {
  name: string;
  cron: string;
  source: string;
}

export function makeActionYaml(params: ActionParams) {
  return `name: ${params.name}

on:
  push:
    branches:
      - main
  workflow_dispatch:
  schedule:
    - cron: '${params.cron}'
  
jobs:
  scheduled:
    runs-on: ubuntu-latest
    steps:
    - name: Check out repo
      uses: actions/checkout@v2
    - name: Set up deno
      run: |-
        curl -fsSL https://deno.land/x/install/install.sh | sh
        echo "$HOME/.deno/bin" >> $GITHUB_PATH
    - name: Fetch latest Data
      run: |-
        curl "${params.source}" | jq . > data.json
    - name: Postprocess
      run: |-
        deno run --allow-all postprocess.ts || exit 0
    - name: Commit and push if changed
      run: |-
        git config user.name "Flat"
        git config user.email "actions@users.noreply.github.com"
        git add -A
        timestamp=$(date -u)
        git commit -m "Latest data: \${timestamp}" || exit 0
        git push
`;
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

    if (!this.extension.isActive) {
      this.activateExtension();
    }
  }

  async activateExtension() {
    await this.extension.activate();
  }

  get rawGit() {
    // Unsure about this magic number, but it works.
    return this.extension.exports.getAPI(1);
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

interface BuildVirtualDocumentParams {
  name: string;
  cron: string;
  source: string;
}

export async function buildVirtualDocument(params: BuildVirtualDocumentParams) {
  const { name, source, cron } = params;

  const uri = vscode.Uri.parse(
    `flat:/schedule.yaml?name=${name}&cron=${cron}&source=${source}`
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
