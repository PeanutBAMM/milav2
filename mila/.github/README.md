# GitHub Actions & CI/CD

This directory contains our automated workflows for continuous integration and deployment.

## Workflows

### 🔍 `pr-checks.yml`

Runs on every pull request to ensure code quality:

- TypeScript type checking
- ESLint validation
- Security audit
- Expo compatibility check

### 📱 `eas-update-preview.yml`

Creates preview builds for pull requests:

- Deploys to preview channel
- Comments on PR with instructions
- Enables testing before merge

### 🚀 `eas-update-production.yml`

Deploys to production on merge to main:

- Runs all quality checks first
- Deploys OTA update
- Creates deployment record

## Setup Required

1. Add `EXPO_TOKEN` to repository secrets
2. Ensure `eas.json` has correct channels
3. Team members need development builds

See `/docs/CI-CD-SETUP.md` for detailed setup instructions.
