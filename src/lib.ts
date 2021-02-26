import * as vscode from "vscode";
import { ConnectionString } from "connection-string";
import { createConnection } from "typeorm";

interface ActionParams {
  type: "sql" | "http";
  name?: string;
  cron?: string;
  source?: string;
  format?: string;
  outfile?: string;
}

export function makeActionYaml(params: ActionParams) {
  const { name, cron, type, source, format, outfile } = params;
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
      uses: githubocto/flat@v1
      with:
        type: ${type}
        ${type === "http" ? `url: '${source}'` : ""}
        ${type === "http" ? `outfile: ${outfile}` : ""}
        ${type === "sql" ? `format: ${format}` : ""}
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
`.replace(/^\s*[\r\n]/gm, "");
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

export function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export async function testConnection(connectionString: string) {
  try {
    const parsed = new ConnectionString(connectionString);
    const protocol = parsed.protocol;

    if (!protocol) {
      throw new Error("Unable to connect to database.");
    }

    // @ts-ignore
    const connection = await createConnection({
      type: protocol,
      url: connectionString,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    });

    await connection.close();
  } catch (e) {
    throw e;
  }
}
