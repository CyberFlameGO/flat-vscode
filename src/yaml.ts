interface ActionParams {
  type: "sql" | "http";
  name?: string;
  cron?: string;
  source?: string;
  format?: string;
}

export function makeActionYaml(params: ActionParams) { 
  const { name, cron, type, source, format } = params;
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
        ${type === "http" ? `http_url: '${source}'` : ""}
        ${type === "sql" ? `sql_format: ${format}` : ""}
        ${
          type === "sql"
            ? `
        # We'll upload an encrypted version of your connection string as a secret
        sql_connstring: \${{ secrets.CONNSTRING }}
        `
            : "\n"
        }
        ${
          type === "sql"
            ? `
        # After hitting "Save and Commit Action", you'll be prompted to write your SQL query.
        sql_queryfile: query.sql`
            : "\n"
        }
`.replace(/^\s*[\r\n]/gm, "");
}
