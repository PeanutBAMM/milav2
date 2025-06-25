# Todo Management System Documentation

<overview>
Unified todo management system for tracking development tasks with automatic scoring, prioritization, and synchronization.
</overview>

## System Architecture

### Core Components

#### 1. **todo-manager.js** (Central System)
- Single source of truth for all todo operations
- TodoManager class with all functionality
- CLI interface with multiple commands
- ~20% code reduction from original implementation

#### 2. **Backwards Compatible Wrappers**
- `todo-scoring.js` → Calls `todo-manager.js score`
- `sync-todos-hook.js` → Calls `todo-manager.js sync`
- `display-todos.js` → Calls `todo-manager.js display`
- Ensures existing integrations continue working

#### 3. **todo-tracker.md**
- Persistent storage for formatted todos
- Auto-generated and synchronized
- Human-readable markdown format
- Located at: `/docs/general/project-management/todo-tracker.md`

## Commands

### Score Command
```bash
node scripts/todo-manager.js score "Your user story here"
```
- Calculates P/S/DX/UX scores
- Determines priority segment
- Assigns area category
- Outputs scoring results

### Sync Command
```bash
echo '[todos-json]' | node scripts/todo-manager.js sync
```
- Reads todos from stdin or argument
- Generates formatted markdown
- Updates todo-tracker.md
- Reports sync status

### Display Command (Recommended)
```bash
echo '[todos-json]' | node scripts/todo-manager.js display
```
- Complete all-in-one solution
- Generates table with sorting
- Syncs to todo-tracker.md
- Displays formatted output
- **Use this for all TodoRead operations**

### Read Command
```bash
node scripts/todo-manager.js read
```
- Reads current todo-tracker.md
- Displays raw markdown content

## Scoring Algorithm

### Metrics
- **P** (Performance): Impact on speed/efficiency (1-10)
- **S** (Stability): Impact on reliability/bugs (1-10)
- **DX** (Developer Experience): Impact on productivity (1-10)
- **UX** (User Experience): Impact on end users (1-10)

### Formula
```
Score = (P×2 + S×3 + DX×2 + UX×1) / 8
```

### Priority Segments
- **TOP PRIORITEIT**: Score > 7.0
- **MEDIUM PRIORITEIT**: Score 5.0-7.0
- **LAGE PRIORITEIT**: Score < 5.0
- **VOLTOOID**: Completed tasks

### Keyword-Based Scoring
System analyzes keywords in user stories:
- High impact keywords: 9 points
- Medium impact keywords: 6 points
- Low impact keywords: 3 points
- Default: 3 points

## Integration with Claude

### TodoWrite Hook
After any TodoWrite operation:
```bash
echo '[updated-todos]' | node scripts/todo-manager.js sync
```

### TodoRead Display
When displaying todos in chat:
```bash
echo '[current-todos]' | node scripts/todo-manager.js display
```

### Workflow
1. User requests todo update
2. Claude updates in-memory todos via TodoWrite
3. Claude runs sync to update todo-tracker.md
4. Claude displays formatted table in chat
5. Everything stays synchronized

## Table Format

### Column Structure
| Column | Width | Alignment | Description |
|--------|-------|-----------|-------------|
| Task | 47 | left | Truncated task description |
| P | 3 | center | Performance score |
| S | 3 | center | Stability score |
| DX | 3 | center | Developer Experience score |
| UX | 3 | center | User Experience score |
| Score | 7 | center | Weighted total score |
| Area | 15 | left | Category with emoji |
| Status | 7 | center | ⏳/🔄/✅ status icon |

### Sorting
- Within each segment: Highest score first
- Maintains logical grouping by priority

## Best Practices

### For Claude
1. Always use `todo-manager.js display` for TodoRead
2. Include sync after TodoWrite operations
3. Never show raw JSON to users
4. Always display formatted tables

### For Developers
1. Use descriptive task names with keywords
2. Include relevant terms for accurate scoring
3. Keep tasks focused and specific
4. Review scores and adjust descriptions if needed

## Migration from Old System

### What Changed
- Three scripts consolidated into one
- Centralized TodoManager class
- Consistent scoring algorithm
- Unified CLI interface
- Better error handling

### What Stayed Same
- All existing commands still work
- Same scoring algorithm
- Same table format
- Same file locations
- Backwards compatible exports

---

*System refactored: 2025-06-25*