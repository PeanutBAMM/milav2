# Git Workflow Guide

## Branch Strategy

### Branch Types
- `main` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes  
- `chore/*` - Maintenance tasks

### Creating a New Feature
```bash
git checkout main
git pull origin main
git checkout -b feature/shopping-lists
```

## Commit Messages

Use semantic commit messages:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc)
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Maintenance tasks

Examples:
```bash
git commit -m "feat: Add shopping list CRUD operations"
git commit -m "fix: Resolve auth token refresh issue"
git commit -m "docs: Update API documentation"
```

## Pull Request Workflow

### Option 1: Via GitHub (Recommended)
1. Push your branch: `npm run push`
2. GitHub will show a banner suggesting to create a PR
3. Click the banner and fill in the PR template

### Option 2: Via CLI
```bash
npm run pr
```
This will:
- Push your branch
- Open interactive PR creation in your terminal

### PR Best Practices
- Keep PRs focused on a single feature/fix
- Fill out the PR template completely
- Wait for CI checks to pass
- Request review when ready

## Available Commands

```bash
npm run push      # Push + monitor CI
npm run pr        # Push + create PR
npm run ci:status # Check recent CI runs
```

## Tips

1. **Don't force push** unless absolutely necessary
2. **Keep commits atomic** - one logical change per commit
3. **Write descriptive commit messages** - your future self will thank you
4. **Review your own PR** before requesting reviews from others