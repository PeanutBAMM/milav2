# Agent Argument Reference Guide

<overview>
Deze guide toont exact hoe agent taken geformuleerd moeten worden voor optimale resultaten.

## Argument Structure

### Basic Format
```
Agent Task: "[ACTION] [TARGET] in [SCOPE]"
```

## Detailed Task Arguments

### 1. File Operations

#### Count Files
```typescript
// Argument structure
{
  action: "count",
  target: "files with extension X",
  scope: "directory path",
  filter?: "additional criteria"
}

// Examples
"Count .tsx files in src/"
"Count test files in features/"
"Count files larger than 300 lines in components/"
```
📚 **See**: [Architecture](../../projects/mila/architecture/)

#### List Files
```typescript
// Argument structure  
{
  action: "list",
  target: "file type or pattern",
  scope: "directory",
  output?: "just names | full paths"
}

// Examples
"List all .env files in root"
"List component files in shared/"
"List files modified today in src/"
```

### 2. Pattern Search

#### Find Code Patterns
```typescript
// Argument structure
{
  action: "find" | "search",
  pattern: "regex or string",
  scope: "directory",
  fileType?: ".ts | .tsx | etc"
}

// Examples
"Find useState usage in components/"
"Search for console.log in src/"
"Find TODO comments in features/"
```

### 3. Configuration Reads

#### Read Config Files
```typescript
// Argument structure
{
  action: "read" | "get" | "show",
  target: "config section",
  file: "config filename"
}

// Examples
"Read scripts from package.json"
"Get compilerOptions from tsconfig.json"
"Show dependencies with 'react' in name"
```
📚 **Related configs**:
- [package.json](../../../mila/package.json)
- [tsconfig.json](../../../mila/tsconfig.json)
- [.eslintrc.js](../../../mila/.eslintrc.js)

### 4. Directory Operations

#### List Directories
```typescript
// Argument structure
{
  action: "list",
  target: "folders" | "directories",
  scope: "parent directory",
  depth?: number
}

// Examples
"List folders in src/features/"
"List all directories in project root"
"Show subdirectories of components/"
```

### 5. Validation Checks

#### Check Existence
```typescript
// Argument structure
{
  action: "check" | "verify",
  condition: "exists" | "has",
  target: "what to check"
}

// Examples
"Check if Button.test.tsx exists"
"Verify all features have index.ts"
"Check for .env.example file"
```

## Parallel Agent Patterns

### Multiple Simple Tasks
```javascript
// Good - 3 simple parallel tasks
Agent 1: "Count components in features/"
Agent 2: "List hooks in shared/"
Agent 3: "Check for test files"

// Bad - tasks too complex
Agent 1: "Analyze all component dependencies"
Agent 2: "Refactor import statements"
```

### Batch Similar Operations
```javascript
// Efficient batching
Agent: "Count [.ts, .tsx, .test.ts] files in src/"

// Less efficient
Agent 1: "Count .ts files"
Agent 2: "Count .tsx files"  
Agent 3: "Count .test.ts files"
```

## Output Format Specifications

### Requesting Specific Output
```typescript
// Arguments can include output format
"List components (just names)"
"Count files (group by directory)"
"Find patterns (with line numbers)"
"Check existence (boolean only)"
```

## Error Handling

### What Happens When Agent Fails
1. **File not found**: Returns empty result
2. **Permission denied**: Reports error
3. **Invalid pattern**: Asks for clarification
4. **Timeout**: Retries with smaller scope

## Integration with Other Tools

### Agent + Normal Tools Workflow
```javascript
// Step 1: Agent discovers
Agent: "Find all files using old API"

// Step 2: Claude analyzes results
Review findings...

// Step 3: Normal tools fix
Edit: Update each file individually
```

## Performance Guidelines

### Task Complexity Limits
| Complexity | Time | Agent Suitable |
|------------|------|----------------|
| Simple | <5s | ✅ Yes |
| Medium | 5-10s | ⚠️ Maybe |
| Complex | >10s | ❌ No |

### Scope Recommendations
- ✅ Single directory: Fast
- ✅ Specific file types: Efficient  
- ⚠️ Entire codebase: Slow
- ❌ Node_modules: Never

## Common Mistakes to Avoid

### ❌ Too Vague
```
"Check code quality"
"Find issues"
"Analyze everything"
```

### ❌ Write Operations
```
"Update all files"
"Fix all errors"
"Refactor components"
```

### ✅ Clear & Specific
```
"Count .tsx files in src/features/"
"Find console.log in components/"
"List npm scripts in package.json"
```

## Quick Command Reference

### Most Common Agent Tasks
```bash
# File operations
"Count [extension] files in [directory]"
"List all [pattern] in [scope]"

# Search operations  
"Find [pattern] in [directory]"
"Search for [string] in [file type]"

# Config operations
"Read [section] from [config file]"
"Show [property] in [json file]"

# Validation
"Check if [file] exists"
"Verify [condition] in [scope]"
```

---

💡 **Pro Tip**: When in doubt, make the task smaller and more specific. Agents work best with laser-focused objectives!
</overview>