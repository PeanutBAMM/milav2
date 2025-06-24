# Claude Development Guidelines - Apps Workspace

## Intelligent Layered Documentation System

### Always Loaded (Base Layer)
1. **This file**: Apps/CLAUDE.md - General workspace rules
2. **General docs**: [docs/general/README.md](./docs/general/README.md) - Cross-project guidelines

### Conditionally Loaded (Project Layer)
When working in `/Apps/{project}/`:
3. **Project CLAUDE.md**: {project}/CLAUDE.md - Project-specific rules
4. **Project docs**: [docs/projects/{project}/README.md](./docs/projects/{project}/README.md) - Project documentation

### Loading Priority
```
ALWAYS:
├── Apps/CLAUDE.md (workspace config)
├── docs/general/README.md (general guidelines)
│
IF in project directory:
├── {project}/CLAUDE.md (project config)
└── docs/projects/{project}/README.md (project docs)
```

### How Context Stacking Works
- **General rules** apply to all projects (from Apps level)
- **Project rules** override or extend general rules
- **Conflicts**: Project-specific takes precedence
- **Task matching**: Searches both general AND project docs

## Core Development Rules

### 📝 Documentation Standards
ALL documentation in this workspace must follow standards defined in:
- [Documentation Standards](./docs/general/development/documentation-standards.md)

**Key Requirements**:
- XML section tags for all .md files
- Clickable relative path links
- Standard templates for consistency
- Automatically enforced by sync-documentation.js

### 🛑 Stability-First Philosophy
- **NO bleeding edge**: Only dependencies with proven track record
- **Version locks**: Exact versions, no ^ or ~ in package.json
- **Test incrementally**: Each feature must work on both platforms
- **Error prevention**: Better to skip features than introduce instability

### ⚡ Performance-First Approach
Tool selection hierarchy (fastest to slowest):
1. **Bash/Shell commands** (0.01s) - For counts, searches, checks
2. **Direct file tools** (0.1s) - Read/Write/Edit for specific files
3. **Agents** (3-5s) - ONLY for truly parallel complex tasks

**Max agents**: 2 concurrent (reduced from 3)
**Default**: NO agents unless absolutely necessary
See: [System Info](./docs/general/development/system-info.md) for detailed guidelines

## Development Workflow

### Daily Checkpoint Protocol
Start each day with these checks:
```bash
# 1. Clean install test
rm -rf node_modules && npm install

# 2. Platform builds (if applicable)
npm run ios
npm run android

# 3. Type checking
npm run typecheck

# 4. Lint check
npm run lint
```

### CI/CD Integration
- **Always use**: `npm run push` (NOT regular git push)
- **Automatic**: CI monitoring and failure analysis
- **On failures**: Claude analyzes logs and proposes fixes
- See: [Claude CI Workflow](./docs/general/ci-cd/claude-ci-workflow.md)

## Workspace Scripts

### Available Commands
- **organize-docs** - Auto-categorize markdown files
  - Location: Project-specific (e.g., `docs/projects/mila/organize-mila-docs.js`)
  - Runs on: Pre-commit hook
  - Categories: Based on project needs

### CI/CD Scripts
- `ci-watch.sh` - Monitor CI after push
  - Location: `scripts/ci-watch.sh`
  - Usage: Automatic via `npm run push`
  - Output: Success ✅ or error analysis

### Project Scripts Pattern
Each project has its own scripts in `{project}/scripts/`:
- Pre-install checks
- Tech stack compliance
- Project-specific automation

## Project Registry

### Currently Active Projects
| Project | Type | Status | Documentation |
|---------|------|--------|---------------|
| [Mila](./mila/CLAUDE.md) | React Native (Expo) | Active | [Mila Docs](./docs/projects/mila/README.md) |
| Project2 | TBD | Planning | Coming soon |

## Quick Reference

### Most Used Commands
```bash
# Push with CI monitoring
npm run push

# Organize documentation
npm run organize-docs

# Check project health
npm run verify-versions

# View CI status
npm run ci:status
```

## Example Scenarios

### Working in `/Apps/mila/src/features/auth/`:
Loaded context:
1. ✅ Apps/CLAUDE.md (this file - general rules)
2. ✅ docs/general/README.md (workflows, standards)
3. ✅ mila/CLAUDE.md (project specifics)
4. ✅ docs/projects/mila/README.md (mila documentation)

### Working in `/Apps/` root:
Loaded context:
1. ✅ Apps/CLAUDE.md (this file - general rules)
2. ✅ docs/general/README.md (workflows, standards)
3. ❌ No project-specific files loaded

---

Remember: **Stability > Features**. A working app with 3 features is better than a crashing app with 10 features.