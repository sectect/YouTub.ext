# GitHub setup

CI runs `npm ci` and `npm test` on pull requests and pushes to `main` or `master`. Actions are pinned to commits, use read-only permissions, and do not retain checkout credentials. Dependabot proposes weekly npm and Actions updates.

After pushing, configure a ruleset for the default branch:

- Require pull requests, one code-owner approval, and resolved conversations.
- Dismiss stale approvals when new commits are pushed.
- Require the CI `verify` check after its first run.
- Block force pushes and branch deletion; restrict bypass access.

Confirm CODEOWNERS accounts have write access. Enable Dependabot alerts, security updates, and secret scanning/push protection where available. These repository settings are not enabled by committing configuration files.
