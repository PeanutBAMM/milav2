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

- **todo-manager** - Unified todo management system
  - Location: `scripts/todo-manager.js`
  - Central system voor alle todo operaties
  - Commands:
    - `score <story>` - Score een nieuwe user story
    - `sync` - Sync todos naar todo-tracker.md
    - `display` - Display formatted todo table (met auto-sync)
    - `read` - Read current todo-tracker.md
  - Features:
    - Automatische P/S/DX/UX score berekening
    - Prioriteit segmentatie (TOP/MEDIUM/LAGE)
    - Perfect uitgelijnde markdown tabellen
    - Area categorisatie
    - Geïntegreerde sync & display
  - Usage: `node scripts/todo-manager.js <command>`

- **Backwards Compatible Wrappers**:
  - `todo-scoring.js` → Roept `todo-manager.js score` aan
  - `sync-todos-hook.js` → Roept `todo-manager.js sync` aan
  - `display-todos.js` → Roept `todo-manager.js display` aan
  - **Deze blijven werken** voor bestaande integraties

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

## Todo Management

### Standaard Todo Weergave - VERPLICHT FORMAT MET AUTO-SYNC

**BELANGRIJK**: Bij ELKE `TodoRead` actie MOET je:

1. **NOOIT** de raw JSON array tonen
2. **ALTIJD** het onderstaande tabel format gebruiken
3. **ALTIJD** sorteren op score binnen elke sectie (hoog → laag)
4. **ALTIJD** syncen naar todo-tracker.md
5. **DIRECT** de tabellen genereren zonder tussenstappen te tonen

**VERPLICHTE WORKFLOW bij TodoRead:**
```bash
# Gebruik todo-manager display voor ALLES in één keer:
# 1. Leest todos
# 2. Sorteert op score
# 3. Synct naar todo-tracker.md
# 4. Geeft perfect geformatteerde output

echo '[todos-json]' | node scripts/todo-manager.js display
```

**Dit garandeert:**
- ✅ Chat weergave = todo-tracker.md (ALTIJD)
- ✅ Automatische sortering op score
- ✅ Geen manual sync meer nodig
- ✅ Consistentie overal

**Output Format (EXACT zo weergeven):**

## 🔥 TOP PRIORITEIT (Score > 7.0)

| Task                                            |  P  |  S  | DX  | UX  |  Score  | Area            | Status  |
| :---------------------------------------------- | :-: | :-: | :-: | :-: | :-----: | :-------------- | :-----: |
| **Self-Healing RAG System**                     |  8  | 10  | 10  |  4  | **8.8** | 🔧 Automation   |    ⏳    |
| **Sentry MCP koppelen**                         |  7  |  9  |  8  |  6  | **7.9** | 📊 Monitoring   |    ⏳    |
| **Unit Tests robuuster**                        |  6  |  9  |  7  |  8  | **7.6** | 🏆 Quality      |    ⏳    |

(etc. voor MEDIUM, LAGE, VOLTOOID secties)

### Todo Synchronisatie Workflow
1. Bij `TodoWrite` → automatisch `todo-manager.js sync` runnen
2. Bij `TodoRead` → gebruik `todo-manager.js display` (doet alles)
3. Dit houdt `todo-tracker.md` altijd up-to-date
4. Scoring gebeurt automatisch via keywords
5. Centrale TodoManager class voor consistentie

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

# Todo management commands
node scripts/todo-manager.js score "Your story here"
node scripts/todo-manager.js sync
node scripts/todo-manager.js display
node scripts/todo-manager.js read
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