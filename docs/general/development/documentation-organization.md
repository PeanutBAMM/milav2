# Documentation Organization Guide

<overview>
All project documentation is automatically organized using the `organize-docs.js` script. This ensures consistent structure and easy navigation.

## How It Works

### Running the Script
```bash
npm run organize-docs
```

This command:
1. Scans for markdown files in project and parent directories
2. Categorizes based on filename and content
3. Moves files to appropriate folders under `/docs`
4. Generates an index at `/docs/README.md`

### Categorization Rules

Files are categorized using a priority system:

1. **Filename matching** (highest priority)
   - `ci-cd-setup` → `05-ci-cd/`
   - `system-info` → `02-development/`
   - `projectplan` → `10-project-management/`

2. **Content keywords** (first 1000 chars)
   - Keywords like 'github', 'workflow', 'pipeline' → `05-ci-cd/`
   - Keywords like 'test', 'jest' → `06-testing/`

3. **Default**: `02-development/`

### Special Handling

#### GitHub Documentation
- `.github/README.md` → `05-ci-cd/github-setup.md`
- `.github/CI.md` → `05-ci-cd/ci-overview.md`
- PR templates stay in `.github/` (GitHub requirement)

#### Excluded Files
- `CLAUDE.md` - Project memory files
- `README.md` - Root readme stays in place
- `pull_request_template.md` - Must stay in `.github/`

### Directory Structure
```
docs/
├── 01-getting-started/     # Setup, installation guides
├── 02-development/         # Development workflow, tools
├── 03-react-native/        # React Native specific docs
├── 04-expo-sdk/           # Expo SDK documentation
├── 05-ci-cd/              # CI/CD, GitHub Actions
├── 06-testing/            # Testing strategies
├── 07-architecture/       # Design patterns, architecture
├── 08-deployment/         # Build and deployment
├── 09-troubleshooting/    # Common issues, solutions
├── 10-project-management/ # Planning, progress tracking
└── README.md              # Auto-generated index
```

## When to Run

Run `npm run organize-docs`:
- After adding new documentation
- Before committing (automated via git hooks)
- When docs seem disorganized

## Tips

1. **Name files descriptively** - The filename heavily influences categorization
2. **Use keywords** in the first paragraph for better categorization
3. **Check the index** at `/docs/README.md` after running
4. **Don't move files manually** - Let the script handle organization

## Troubleshooting

### File in wrong category?
1. Add specific filename match in `organize-docs.js`
2. Or add keywords to the file's content
3. Run the script again

### File not being organized?
Check if it's:
- In an excluded directory (node_modules, .git, etc.)
- An excluded file (CLAUDE.md, README.md)
- Already in the correct location
</overview>