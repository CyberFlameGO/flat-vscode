import * as vscode from "vscode";
import { ConnectionString } from "connection-string";
import { createConnection } from "typeorm";

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
