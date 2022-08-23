# Welcome to the IdleTimer contributing guide

Thank you for investing your time in contributing to our project!

In this guide you will get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR.

## New contributor guide

To get an overview of the project, read the [docs](https://idletimer.dev/docs). Here are some resources to help you get started with open source contributions:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Set up Git](https://docs.github.com/en/get-started/quickstart/set-up-git)
- [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

## Getting started

You can contribute to IdleTimer in several ways:

### Discussions
Discussions are where we have conversations.

If you'd like help troubleshooting a PR you're working on, have a great new idea, or want to share something amazing you've learned, join us in [discussions](https://github.com/supremetechnopriest/react-idle-timer/discussions).

### Issues
[Issues](https://docs.github.com/en/github/managing-your-work-on-github/about-issues) are used to track tasks that contributors can help with. If an issue has the `triage` label, it has not been reviewed and you shouldn't begin work on it.

If you've found something in the source code or docs that should be updated, search open issues to see if someone else has reported the same thing. If it's something new, open an issue using a [template](https://github.com/supremetechnopriest/react-idle-timer/issues/new/choose). We'll use the issue to have a conversation about the problem you want to fix.

### Pull requests
A [pull request](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests) is a way to suggest changes in our repository.

When we merge those changes, they will be deployed with the next release. To learn more about opening a pull request in this repo, see the [Pull Request](#pull-request) below.

### Community Support
IdleTimer is maintained by a very small team. If you would like to help, providing
community support would be a great way to start. You can join our [discord](https://discord.gg/YPuxNdWA4D) to 
offer your expertise to new users or participate in conversations on issues labeled 
`question` or discussions.

## Issues

### Create a new issue

If you spot a problem with the package or docs, [search if an issue already exists](https://docs.github.com/en/github/searching-for-information-on-github/searching-on-github/searching-issues-and-pull-requests#search-by-the-title-body-or-comments). If a related issue doesn't exist, you can open a new issue using a relevant [issue form](https://github.com/supremetechnopriest/react-idle-timer/issues/new/choose). 

### Solve an issue

Scan through our [existing issues](https://github.com/supremetechnopriest/react-idle-timer/issues) to find one that interests you. You can narrow down the search using `labels` as filters. As a general rule, we don’t assign issues to anyone. If you find an issue to work on, you are welcome to open a PR with a fix.

## Make Changes

#### Setting up project locally

1. Fork the repository.
- Using GitHub Desktop:
  - [Getting started with GitHub Desktop](https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/getting-started-with-github-desktop) will guide you through setting up Desktop.
  - Once Desktop is set up, you can use it to [fork the repo](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/cloning-and-forking-repositories-from-github-desktop)!

- Using the command line:
  - [Fork the repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository) so that you can make your changes without affecting the original project until you're ready to merge them.

- GitHub Codespaces:
  - [Fork, edit, and preview](https://docs.github.com/en/free-pro-team@latest/github/developing-online-with-codespaces/creating-a-codespace) using [GitHub Codespaces](https://github.com/features/codespaces) without having to install and run the project locally.

2. [Install nodejs](https://nodejs.org/en/download/) if you haven't already.

3. Run `npm install` to install package dependencies.

4. Run 'npm install -g nps` if you don't already have [npm package scripts](https://www.npmjs.com/package/nps) installed.

4. If you are working on the docs, you will need to add a `.env.local` file to the `/docs` directory. Inside the file you will need to add the following and replace [your_token] with a github [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).

```
GOOGLE_ANALYTICS=G-XXXXXXXXXX
GITHUB_TOKEN=[your_token]
```

4. Create a working branch and start with your changes!

All the scripts to work with IdleTimer can be found in `package-scripts.js`. As a contributor the only scripts you should need are `nps.test` for working on the source code and `nps docs.dev` for working on the documentation. 

### Commit your update

Commit the changes once you are happy with them. The following commit message guidelines will be strictly enforced.

#### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Start the commit message with an applicable emoji:
  - :art: `:art:` When improving the format/structure of the code.
  - :stopwatch: `:stopwatch:` When improving performance.
  - :memo: `:memo:` When writing docs.
  - :zap: `:zap:` When adding a new feature.
  - :sparkles: `:sparkles:` When enhancing an existing feature.
  - :lady_beetle: `:lady_beetle:` When fixing a bug.
  - :fire: `:fire:` When removing code or files.
  - :green_heart: `:green_heart:` When fixing the CI build.
  - :white_check_mark: `:white_check_mark:` When adding tests.
  - :lock: `:lock:` When dealing with security.
  - :arrow_up: `:arrow_up:` When upgrading dependencies.
  - :arrow_down: `:arrow_down:` When downgrading dependencies.
  - :shirt: `:shirt:` When removing linter warnings.
  - :shower: `:shower:` When performing generic clean up.

### Pull Request

When you're finished with the changes, create a pull request, also known as a PR.
- Fill the "Ready for review" template so that we can review your PR. This template helps reviewers understand your changes as well as the purpose of your pull request. 
- Don't forget to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) if you are solving one.
- Enable the checkbox to [allow maintainer edits](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/allowing-changes-to-a-pull-request-branch-created-from-a-fork) so the branch can be updated for a merge.
Once you submit your PR, your proposal will be reviewed. We may ask questions or request for additional information.
- We may ask for changes to be made before a PR can be merged, either using [suggested changes](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request) or pull request comments. You can apply suggested changes directly through the UI. You can make any other changes in your fork, then commit them to your branch.
- As you update your PR and apply changes, mark each conversation as [resolved](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/commenting-on-a-pull-request#resolving-conversations).
- If you run into any merge issues, checkout this [git tutorial](https://lab.github.com/githubtraining/managing-merge-conflicts) to help you resolve merge conflicts and other issues.

### Your PR is merged

:tada: Congratulations :tada: Your pull request has been merged and you are now 
an IdleTimer Contributor! Your contributions will published with the next release.
