# Agent Usage Guidelines for Claude

## Overview
Agents zijn krachtige tools die Claude kan gebruiken om taken parallel uit te voeren. **BELANGRIJK**: Sinds 2024-06-24 gebruiken we een performance-first approach waarbij bash/grep commands de voorkeur hebben boven agents.

⚠️ **Performance Update**: Agents zijn 300-500x langzamer dan directe bash commands. Gebruik ze ALLEEN voor echt complexe parallelle taken.

📚 **See also**: [System Info](../system-info.md) voor complete performance settings

## Quick Reference Table

| Task Type | Agent Suitable | Argument Example | Related Docs |
|-----------|---------------|------------------|--------------|
| File Count | ✅ Yes | `"Count .tsx files in src/"` | [Safe Examples](./safe-agent-tasks-examples.md#1-codebase-analysis-tasks) |
| Pattern Search | ✅ Yes | `"Find all useState hooks"` | [Code Quality](./safe-agent-tasks-examples.md#3-code-quality-checks) |
| Config Read | ✅ Yes | `"Read package.json scripts"` | [package.json](../../mila/package.json) |
| Directory List | ✅ Yes | `"List folders in features/"` | [Architecture](../07-architecture/) |
| Complex Analysis | ❌ No | `"Analyze component dependencies"` | Use normal tools |
| File Write | ❌ No | `"Update all imports"` | [CI/CD Guide](../01-getting-started/ci-cd-setup-guide.md) |
| Git Operations | ❌ No | `"Commit changes"` | [Git Workflow](../02-development/) |

📚 **For detailed argument syntax**: See [Agent Argument Reference](./agent-argument-reference.md)

## Wanneer Agents Gebruiken

### ✅ Ideaal voor Agents

#### 1. Bulk Read Operations
```
Voorbeeld: "Analyseer alle React components voor gebruikte hooks"
Agent taak: Read alle .tsx files in src/components en verzamel hook patterns
```

#### 2. Code Analysis
```
Voorbeeld: "Check voor unused imports in de hele codebase"
Agent taken (parallel):
- Agent 1: Scan src/features
- Agent 2: Scan src/shared  
- Agent 3: Scan src/services
```

#### 3. Documentation Updates
```
Voorbeeld: "Update copyright jaar in alle files naar 2025"
Agent taak: Find & replace in alle relevante files
```

#### 4. Search Operations
```
Voorbeeld: "Vind alle TODO comments"
Agent taak: Grep door hele codebase voor TODO/FIXME patterns
```

### ❌ NIET voor Agents

1. **Package.json wijzigingen** - Te kritiek, manual only
2. **Environment files** (.env, .env.local) - Security risk
3. **Git operations** - Kunnen conflicten veroorzaken
4. **Database migrations** - Require careful sequencing
5. **Build configurations** - Te complex voor parallel werk

## Veiligheidsregels

### 1. Read-First Policy
```
GOED:
Agent: "Lees alle test files"
→ Analyze results
→ Dan pas: "Update test imports"

FOUT:
Agent: "Update alle files direct"
```

### 2. Scope Limiting
```
GOED:
Agent: "Check TypeScript errors in src/features alleen"

FOUT:  
Agent: "Fix alle TypeScript errors overal"
```

### 3. Dry-Run First
```
GOED:
Agent: "Toon welke files console.log bevatten"
→ Review lijst
→ Dan pas: "Remove console.log uit deze files"
```

## Praktische Voorbeelden

### Voorbeeld 1: Performance Audit
```bash
# Claude kan 3 agents parallel inzetten:
Agent 1: "Analyseer bundle sizes per feature"
Agent 2: "Check voor duplicate dependencies"  
Agent 3: "Identify large image files"

# Resultaat: Complete performance overview in 1/3 tijd
```

### Voorbeeld 2: Code Quality Check
```bash
# 5 Parallel agents:
Agent 1: "Find components zonder tests"
Agent 2: "Check voor missing TypeScript types"
Agent 3: "Identify duplicate code patterns"
Agent 4: "Find hardcoded strings"
Agent 5: "Check import organization"
```

### Voorbeeld 3: Refactoring Prep
```bash
# Voorbereidende analyse:
Agent: "Map alle gebruik van oude Button component"
→ Review usage patterns
→ Plan migration strategy
→ Dan pas manual refactoring
```

## Best Practices

### 1. Batch Similar Tasks
```
GOED:
Agents: "Check alle .tsx files voor [pattern1, pattern2, pattern3]"

MINDER EFFICIENT:
Agent 1: "Check voor pattern1"
Agent 2: "Check voor pattern2"  
Agent 3: "Check voor pattern3"
```

### 2. Clear Success Criteria
```
GOED:
"Find alle files met > 500 lines"
"List components using deprecated APIs"

VAAG:
"Check code quality"
"Find problematic files"
```

### 3. Progress Reporting
Agents moeten rapporteren:
- Hoeveel files processed
- Findings count
- Any errors encountered

## Integration met CI/CD

Agents kunnen helpen bij CI failure analysis:

```bash
# Bij CI failure:
Agent 1: "Analyseer TypeScript errors in failed files"
Agent 2: "Check related test files"
Agent 3: "Find recent changes in affected modules"

# Snellere root cause analysis!
```

## Monitoring & Rollback

### Voor grote agent operations:
1. **Git commit first** - Safety checkpoint
2. **Run agents** - Execute changes
3. **Review diff** - `git diff` om changes te zien
4. **Test** - Run relevante tests
5. **Commit of rollback** - Based op resultaten

### Rollback commands:
```bash
# Undo alle changes sinds laatste commit
git restore .

# Undo specifieke file
git restore path/to/file
```

## Performance Tips

1. **Parallellize wisely** - Max 5-10 agents tegelijk
2. **Chunk large tasks** - Split 1000+ files in batches
3. **Cache results** - Agents kunnen results delen
4. **Filter early** - Beperk scope voor efficiency

## Common Agent Patterns

### Pattern 1: Analyze → Review → Fix
```
Step 1: Agent analyseert probleem
Step 2: Claude reviewed findings  
Step 3: Agent(s) fix issues
```

### Pattern 2: Multi-Stage Pipeline
```
Agents Stage 1: Collect data
Agents Stage 2: Process/transform
Agents Stage 3: Apply changes
```

### Pattern 3: Verification Loop
```
Do:
  Agent: Make changes
  Agent: Run verification
While: Issues found
```

## Troubleshooting

### Agent fails halfway?
- Check agent output voor error details
- Rollback partial changes
- Retry met smaller scope

### Too many file changes?
- Break into smaller agent tasks
- Use more specific file patterns
- Add intermediate review steps

### Performance issues?
- Reduce parallel agent count
- Add file type filters
- Exclude node_modules, dist, etc.

---

💡 **Remember**: Agents zijn tools voor efficiency, niet vervanging voor careful thinking. Use them wisely!