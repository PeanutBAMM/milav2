# Git Workflow Guide


<branch-strategy>
This section covers branch strategy.


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
</branch-strategy>

<commit-messages>
This section covers commit messages.

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
</commit-messages>

<workflow>
This section covers workflow.


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
</workflow>

<commands>
This section covers commands.

```bash
npm run push      # Push + monitor CI
npm run pr        # Push + create PR
npm run ci:status # Check recent CI runs
```
</commands>

<tips>
This section covers tips.

1. **Don't force push** unless absolutely necessary
2. **Keep commits atomic** - one logical change per commit
3. **Write descriptive commit messages** - your future self will thank you
4. **Review your own PR** before requesting reviews from others
</tips>