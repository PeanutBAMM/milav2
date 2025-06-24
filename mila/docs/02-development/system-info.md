# Claude System Info & Configuration

Dit document bevat alle system-level configuraties en werkafspraken voor Claude sessies.

## Performance & Efficiency Settings

### 1. Tool Selection Hierarchy (Speed First)
```
1. Bash/Shell commands (fastest) - Voor counts, searches, checks
2. Direct file tools (Read/Write/Edit) - Voor specifieke file operations  
3. Agents (slowest) - ALLEEN voor echt parallelle complexe taken
```

### 2. Specific Performance Rules

#### File Operations
- **Count files**: `find | wc -l` (NOT agent)
- **Search patterns**: `grep -r` (NOT agent)
- **List directories**: `ls` of `find` (NOT agent)
- **Check existence**: `test -f` of `[ -f file ]` (NOT agent)
- **Read JSON**: `cat file.json | jq` (NOT agent)

#### When to Use Agents
- **ALLEEN wanneer**:
  - Taken echt parallel moeten (verschillende complexe analyses)
  - Context tussen files nodig is
  - Taak > 5 seconden duurt met normale tools
- **Maximum**: 2 agents tegelijk (was 3)
- **Default**: GEEN agents, tenzij echt nodig

### 3. Command Preferences
```bash
# GOOD (Fast)
find src -name "*.tsx" | wc -l
grep -r "pattern" src --include="*.ts"
cat package.json | jq '.scripts'

# AVOID (Slow)
Agent: "Count tsx files"
Agent: "Find pattern"
Agent: "Read package.json"
```

## File Operation Rules

### Always Read Before Edit
- Check of file bestaat met `test -f` of Read
- Bij "file not found" → bepaal of file aangemaakt moet worden
- Voorkomt onnodige errors

### Git Operations
- Na elke code wijziging: `npm run push` (niet gewone git push)
- Dit triggert automatische CI monitoring
- Bij failures: Claude analyseert logs en stelt fixes voor

## Token & Resource Management

### No Limits Policy
- Geen token spend limieten
- Focus op efficiency, niet op token besparing
- Gebruik slim: batch operations waar mogelijk

### Parallel Processing
- Bash commands kunnen parallel met `&` 
- Multiple tool calls in één message waar nuttig
- Agents alleen voor ECHT parallelle complexe taken

## CI/CD Integration

### Automatic Monitoring
```bash
# Bij push altijd gebruik:
npm run push  # NIET git push

# Dit doet:
1. git push
2. Wacht op CI
3. Bij failure → logs automatisch
4. Claude analyseert en fixt
```

### Error Patterns
- TypeScript errors → Type fixes
- ESLint violations → Style fixes  
- Console.log detection → Remove statements
- Tech stack compliance → Version fixes

## Development Workflow

### Standard Claude Workflow
1. Read codebase eerst (begrip opdracht)
2. Maak plan → check met gebruiker
3. Implementeer met snelste tools
4. Test met `npm run push`
5. Fix eventuele CI failures direct

### Documentation Updates
- System changes → Update deze file
- User-specific → Update ~/.claude/CLAUDE.md
- Project-specific → Update project CLAUDE.md

## Quick Reference Commands

### Performance Testing
```bash
# Time any command
time [command]

# Compare approaches
time find . -name "*.ts" | wc -l
time ls -la src/**/*.ts | wc -l
```

### Debugging
```bash
# Check current directory
pwd

# Verify file exists
test -f filename && echo "exists" || echo "not found"

# Quick grep with context
grep -n -C 3 "pattern" file
```

## Integration Points

### Links to Related Docs
- [Agent Usage Guidelines](agent-usage-guidelines.md) - When agents ARE appropriate
- [CI/CD Workflow](../claude-ci-workflow.md) - Automated CI monitoring
- [Performance Tips](performance-optimization.md) - General optimization

## Update History

- **2024-06-24**: Initial creation, performance-first approach
- **2024-06-24**: Added bash/grep preference over agents
- **2024-06-24**: Reduced max agents from 3 to 2

---

💡 **Golden Rule**: If it can be done with bash in <1 second, don't use an agent!