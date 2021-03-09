<p align="center">
  <img src="https://raw.githubusercontent.com/githubocto/flat-vscode/main/docs/icon.png" width=512>
</p>

# Flat

Flat is a VSCode extension that steps you through the process of creating a [Flat action](https://github.com/githubocto/flat), which makes it easy to fetch data and commit it to your repository as flatfiles.

Just as [materialized views](https://en.wikipedia.org/wiki/Materialized_view) make it easier and faster to work the results of a query, Flat makes it easy to materialize data from anywhere into your workspace.

Flat streamlines a pattern popularized by [Simon Willison](https://simonwillison.net/2020/Oct/9/git-scraping/) and [Alex Gaynor](https://github.com/alex/nyt-2020-election-scraper)). The pattern of pulling data into git is an interesting one that deserves a dead-simple developer experience. Flat is an experiment from [GitHub's Office of the CTO](https://octo.github.com) to make it easier for anyone to employ this pattern.

## Usage

### VS Code & Codespaces

To use Flat, [install the extension](https://marketplace.visualstudio.com/items?itemName=githubocto.flat) and click the Flat icon in the sidebar. You will prompted to authenticate with GitHub (nb: Flat uses the `user:email` and `repo` scopes):

![Screenshot of initial auth view for Flat extension](https://raw.githubusercontent.com/githubocto/flat-vscode/main/docs/auth.png)

Once authenticated, Flat will either guide you through the steps for creating a Flat action, or list all workflow runs of said action.

![Screenshot of starting view for Flat extension](https://raw.githubusercontent.com/githubocto/flat-vscode/main/docs/start.png)

### Creating an HTTP action

![Screenshot of HTTP creation view for Flat extension](https://raw.githubusercontent.com/githubocto/flat-vscode/main/docs/http.png)

To create an HTTP action, you'll be asked for the following inputs:

1. A URL
2. A CRON schedule
3. A name

These inputs will be used to generate and commit a `.github/workflows/flat.yaml` file to your repository.

### Creating a SQL action

![Screenshot of SQL creation view for Flat extension](https://raw.githubusercontent.com/githubocto/flat-vscode/main/docs/sql.png)

To create a SQL action, you'll be asked for the following inputs:

1. A database connection string <span style="color: red;">\*</span>
2. A CRON schedule
3. A format for saving your data (CSV or JSON)
4. A name

<span style="color: red;">\*</span> Note that we will encrypt this value and create a [GitHub secret](https://docs.github.com/en/actions/reference/encrypted-secrets) in your repository for this connection string. No sensitive data will be committed to your repository.

These inputs will be used to generate and commit a `.github/workflows/flat.yaml` file to your repository.

### Viewing Workflow Runs

If Flat determines that you already have an action with runs, it will instead list these runs:

![Screenshot of past runs in Flat extension](https://raw.githubusercontent.com/githubocto/flat-vscode/main/docs/past_runs.png)

## Appendix

For documentation of the various configuration options that this extension uses in `flat.yaml`, see the [Flat action documentation](https://github.com/githubocto/flat).
## License

[MIT](LICENSE)
