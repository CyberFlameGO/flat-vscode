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
