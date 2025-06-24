# CI/CD Documentation

Continuous Integration and Deployment guides that can be used across all projects.


<available-guides>
This section covers available guides.

- [CI/CD Setup Guide](./ci-cd-setup-guide.md) - Complete guide for setting up GitHub Actions
- [CI Overview](./ci-overview.md) - Overview of CI checks and processes
- [Claude CI Workflow](./claude-ci-workflow.md) - Automated CI monitoring with Claude
- [GitHub Actions Setup](./github-actions-setup.md) - GitHub-specific CI/CD configuration
</available-guides>

<key-concepts>
This section covers key concepts.


### Automated Checks
Every push and PR automatically runs:
- TypeScript compilation
- ESLint code quality
- Security audits
- Framework-specific checks (e.g., Expo Doctor)

### Branch Protection
Main branches should require all checks to pass before merging.

### Monitoring
Use `npm run push` to automatically monitor CI status after pushing changes.

---

← [Back to Documentation Hub](../../)
</key-concepts>