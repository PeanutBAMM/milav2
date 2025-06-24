# PR Workflow Documentation

## Branch Strategy

We use a feature branch workflow:

1. **Main branch**: Production-ready code
2. **Feature branches**: `feature/feature-name`
3. **Bugfix branches**: `fix/bug-description`

## Workflow Steps

1. Create feature branch from main
2. Make changes
3. Test locally on both platforms
4. Push branch
5. Create PR
6. CI checks run automatically
7. Review & merge

<commands>
This section covers commands.

```bash
# Create feature branch
git checkout -b feature/feature-name

# Push branch
git push -u origin feature/feature-name

# Create PR via GitHub CLI
gh pr create --title "Title" --body "Description"
```

## CI Checks on PR

- TypeScript compilation
- ESLint
- Expo Doctor
- Security audit
- Version compliance
</commands>