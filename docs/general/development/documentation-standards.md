# Documentation Standards

These standards apply to ALL documentation in the Apps workspace and are automatically enforced by the sync-documentation.js script.

<overview>
This document defines the documentation standards for the entire workspace. All markdown files must follow these guidelines for consistency, maintainability, and automated processing.
</overview>

### Usage Rules
1. **Only tag ## sections** - NEVER tag ### or deeper subsections
2. **One tag per major section** - Keep it simple and maintainable
3. **Lowercase with hyphens** - e.g., `<project-info>`, `<api-docs>`
4. **Properly nested** - Every opening tag must have a closing tag
5. **No duplicate nesting** - Don't nest same tag type within itself
6. **Descriptive but concise** - Tags should be self-explanatory
7. **Implicit headers preferred** - XML tag can replace ## header for cleaner docs

### Tag Naming Conventions

**GOOD Examples:**
- `overview` - Clear, concise
- `quick-links` - Descriptive  
- `api-reference` - Specific purpose

**BAD Examples:**
- `1-tool-selection-hierarchy-speed-first` - Too specific/long
- `stuff` - Too vague
- `MySection` - No capitals

### Tag Placement Rules

**PREFERRED - Implicit headers (cleaner for humans):**
```xml
<performance>
Introduction to performance configuration and guidelines.

### Tool Selection
Subsection content...

### Optimization Tips  
More subsection content...

<features>
Overview of available features and capabilities.

### Feature One
Details about feature one...
</features>
</performance>
```

**ALSO CORRECT - Explicit ## headers (backward compatible):**
```xml
[performance]
Content about performance...
[/performance]
```

**INCORRECT - Don't tag ### subsections:**
```xml
[performance]
  ### Tool Selection
  [/tool-hierarchy]
[/performance]
```

### Implicit Header Pattern
- XML tags can serve as section headers
- The tag name implies the ## section title
- First paragraph after tag serves as section intro
- Cleaner and less redundant for human readers
- Parser treats tag-name as ## Tag Name section

### Do's and Don'ts

**DO:**
- ✅ Use XML tags ONLY for ## sections
- ✅ Keep it simple - one tag per major section
- ✅ Keep tag names short (1-3 words)
- ✅ Close tags in reverse order of opening
- ✅ Use semantic names that describe content

**DON'T:**
- ❌ Tag ### subsections (biggest mistake!)
- ❌ Use XML tags inside code blocks
- ❌ Create nested structures
- ❌ Use numbers or special characters in tags
- ❌ Leave unclosed tags
- ❌ Over-tag your documentation

### Common Section Names
- `<overview>` - Document introduction
- `<quick-links>` - Navigation links
- `<setup>` - Installation/setup instructions
- `<usage>` - How to use something
- `<api>` - API documentation
- `<features>` - Feature descriptions
- `<architecture>` - System design
- `<implementation>` - Implementation details
- `<testing>` - Testing information
- `<troubleshooting>` - Common issues
- `<examples>` - Code examples
- `<references>` - External links/resources

<whitespace-rules>
Proper whitespace handling is crucial for both readability and machine parsing of XML-structured markdown.

### Core Whitespace Principles

1. **Adjacent Tag Placement**: XML tags should be adjacent to their content
2. **No Visual Separation**: Tags are semantic markers, not visual dividers
3. **Intentional Spacing**: Only add whitespace where visually needed

### Correct Whitespace Format

**GOOD - Proper whitespace:**
```markdown
<section-name>
Content starts immediately after the header.
No blank line before the closing tag.
</section-name>

<next-section>
One blank line between tag blocks for separation.
</next-section>
```

**BAD - Improper whitespace:**
```markdown
<section-name>
Content has unnecessary blank lines.
</section-name>

<next-section>
Too many blank lines everywhere.
</next-section>
```

### Whitespace Rules

1. **Opening Tags**:
   - NO blank line after opening tag
   - Place immediately before content
   - Example: `<tag>\n## Header`

2. **Closing Tags**:
   - NO blank line before closing tag
   - Place immediately after last content line
   - Example: `Last line of content\n</tag>`

3. **Between Tag Blocks**:
   - ONE blank line for visual separation
   - Helps distinguish logical sections
   - Example: `</tag1>\n\n<tag2>`

4. **Within Content**:
   - Preserve natural content spacing
   - Blank lines within sections are OK
   - Don't remove spacing that aids readability

### Special Cases

**Lists within tags:**
```markdown
<features>
- Feature 1
- Feature 2
- Feature 3
</features>
```

**Code blocks within tags:**
```markdown
<example>
```javascript
// Code preserves its own formatting
const example = true;
```
</example>
```

**Nested content:**
```markdown
<parent>
Introduction paragraph.

### Subsection
Subsection content maintains natural spacing.

Another paragraph in the subsection.
</parent>
```

### Validation Rules

The sync-documentation.js script enforces these rules by:
1. Detecting whitespace violations
2. Auto-fixing during pre-commit
3. Reporting issues with line numbers
4. Preserving intentional content spacing

### Why These Rules Matter

1. **Consistency**: Uniform formatting across all docs
2. **Parsing**: Clean structure for documentation databases
3. **Readability**: Clear visual hierarchy
4. **Maintenance**: Easier to update and validate
5. **Scalability**: Rules that work at any scale
</whitespace-rules>

### Rules
1. **Always use relative paths** from the Apps root directory
2. **Make links clickable** in VS Code and other editors
3. **Validate link targets** - Only link to existing files
4. **Use descriptive text** - Not "click here" but meaningful descriptions

### Format Examples
```markdown
<!-- Good -->
[Component Documentation](./docs/components/Button.md)
[Auth Service](../api/auth-service.md)
[Project Plan](./implementation/projectplan.md)

<!-- Bad -->
[Click here](./file.md)
[Doc](http://external-link.com)
../../../some/file.md (raw path without link syntax)
```

### Special Cases
- **External links**: Always use full URLs with https://
- **Anchors**: Use `#section-name` for same-file navigation
- **Code files**: Link directly to source files when referencing code

### Feature Documentation Template

Use this structure for documenting features:

```
# Feature: {FeatureName}

[overview tag]
## Overview
Brief description of what this feature does and why it exists.
[/overview tag]

[components tag]
## Components

### {ComponentName}
**Location**: Link to component file
**Purpose**: What this component does

### Related Components
- Link to related components
[/components tag]

[state-management tag]
## State Management
Description of state management approach.

**Store**: Link to store file
**Actions**: List key actions
[/state-management tag]

[api-integration tag]
## API Integration
How this feature interacts with backend services.

**Endpoints**:
- GET /api/{feature} - Description
- POST /api/{feature} - Description
[/api-integration tag]

[testing tag]
## Testing
**Test Location**: Link to test files
**Coverage**: Current coverage percentage
[/testing tag]
```

Note: Replace [tag] with actual XML tags using angle brackets.

### Service Documentation Template

```
# Service: {ServiceName}

[overview tag]
## Overview
What this service provides to the application.
[/overview tag]

[functions tag]
## Functions

### functionName(params): ReturnType
Description of what the function does.

**Parameters**:
- param1: Type - Description
- param2: Type - Description

**Returns**: Description of return value

**Example**:
(code example here)
[/functions tag]

[error-handling tag]
## Error Handling
How errors are handled and what errors can occur.
[/error-handling tag]

[dependencies tag]
## Dependencies
- package-name - Why it's needed
- Link to internal services - How it's used
[/dependencies tag]
```

### Component Documentation Template

```
# Component: {ComponentName}

[overview tag]
## Overview
What this component renders and its purpose in the UI.
[/overview tag]

[props tag]
## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| propName | type | default | What it does |
[/props tag]

[usage tag]
## Usage
(Show import and usage example)
[/usage tag]

[styling tag]
## Styling
How the component is styled.

**Theme Variables**: List of theme variables used
**Customization**: How to customize appearance
[/styling tag]

[accessibility tag]
## Accessibility
- **Keyboard**: Keyboard navigation support
- **Screen Reader**: ARIA labels and roles
- **Focus Management**: How focus is handled
[/accessibility tag]
```

### Project Documentation Template (README.md)

```
# {Project Name} Documentation

Brief project description.

[project-info tag]
## Project Overview
- **Type**: React Native / Node.js / etc.
- **Status**: Development / Production
- **Version**: Current version
- **Purpose**: Main goal of the project
[/project-info tag]

[quick-links tag]
## Quick Links
- Link to setup guide
- Link to architecture docs
- Link to API reference
[/quick-links tag]

[getting-started tag]
## Getting Started
(Installation and startup commands)
[/getting-started tag]

[Additional sections as needed...]
```

### Automated Checks
The `sync-documentation.js` script automatically:
1. Validates XML tag structure
2. Checks link targets exist
3. Applies standard templates
4. Reports formatting issues

### Manual Review Checklist
- [ ] All sections wrapped in XML tags
- [ ] Links use relative paths and are clickable
- [ ] No placeholder content (📝 markers)
- [ ] Follows appropriate template
- [ ] Cross-links are minimal and essential

### Pre-commit Hook
Documentation is automatically checked and updated on commit via:
```json
"lint-staged": {
  "*.md": [
    "node scripts/sync-documentation.js --staged"
  ]
}
```

### Manual Generation
Generate documentation for new features:
```bash
node scripts/sync-documentation.js [file-path]
```

### CI/CD Integration
Documentation validation runs in CI pipeline to ensure standards.

### When to Create Example Files

Create separate example files when documentation contains:
1. **Multiple XML structure examples** (>3 examples)
2. **Complex code blocks** with XML-like syntax
3. **Large template sections** (>2 templates)
4. **Files over 500 lines** with examples

### Naming Convention
- Main file: `feature-name.md`
- Examples: `feature-name-examples.md`

### Benefits
1. **No parsing conflicts** - Examples don't interfere with XML validation
2. **Better organization** - Clear separation of rules and examples
3. **Easier maintenance** - Update examples without touching main docs
4. **Reusability** - Link to examples from multiple docs

### Implementation
The `sync-documentation.js` script automatically:
- Detects when files need example companions
- Suggests appropriate example file names
- Warns about complex inline examples

### Example Structure
```markdown
# Feature Name Examples

This file contains examples for [Feature Name](./feature-name.md).

Note: Using [tag] notation to avoid XML parsing issues.

## Section Examples
[Examples here...]
```

### Good Documentation
- [System Info](./system-info.md) - Well-structured with clear sections
- [Agent Guidelines](./agent-usage-guidelines.md) - Good use of examples
- [Git Workflow](./git-workflow.md) - Clear, actionable content
- [Documentation Standards Examples](./documentation-standards-examples.md) - Proper example separation

### Common Mistakes to Avoid
1. **Missing XML tags** - Every section needs tags
2. **Broken links** - Always verify link targets
3. **Inconsistent formatting** - Follow templates
4. **Too many cross-links** - Keep it minimal
5. **Placeholder content** - Only document what exists
6. **Complex XML examples inline** - Use separate example files

### Exceptions
1. **Inside code blocks** - Never use XML tags in code examples
2. **File paths** - Don't wrap file paths in tags
3. **Inline code** - Keep `inline code` clean
4. **Tables** - Table content doesn't need tags
5. **Lists within sections** - The parent section tag is enough

### Example of What NOT to Do

The following are examples written in plain text to avoid XML parsing issues:

**WRONG: XML tags in code block**
- Don't put XML tags inside JavaScript/TypeScript code
- Keep code blocks clean of documentation markup

**WRONG: Over-tagging lists**
- Don't wrap individual list items in tags
- The parent section tag is sufficient

**RIGHT: Parent tag is sufficient**
- Use one tag for the entire Features section
- List items don't need individual tags

<best-practices>
1. **ONLY tag ## sections** - Never tag ### or deeper subsections
2. **One tag per major section** - Keep documentation clean
3. **Semantic naming** - Tag name should describe content purpose
4. **Consistent throughout project** - Same sections use same tag names
5. **Validate before commit** - Run sync-documentation.js
6. **Less is more** - Aim for 5-10 tags per file, not 20-40

### Quick Reference

For complex XML examples, see [Documentation Standards Examples](./documentation-standards-examples.md#template-examples).

**Clean structure (implicit headers):**
```
# Document Title (no tag)

<overview>
Brief introduction explaining the document's purpose and scope.
</overview>

<features>
Description of the key features available in this system.

### Feature One
Subsection content...

### Feature Two  
More subsection content...
</features>
```

**Also valid (explicit headers):**
```
<overview>
Content...
</overview>
```
</best-practices>

<claude-checklist>
When writing ANY documentation, I must ALWAYS:

### ✅ XML Tag Rules
- [ ] Use XML tags ONLY for ## sections (never ### or deeper)
- [ ] Use implicit header pattern (no `## Title` after `<tag>`)
- [ ] NO redundant titles between tag and content
- [ ] NO numbered tags like `<1-section>` - use `<section>`
- [ ] Keep tag names short (1-3 words) and semantic
- [ ] Close all tags in reverse order

### ✅ Content Structure
- [ ] After `<tag>`, immediate content should be:
  - Either a ### subsection
  - Or a brief intro paragraph then ### subsection
  - NEVER just a title line
- [ ] No blank lines after opening tags
- [ ] No blank lines before closing tags
- [ ] Single blank line between tag blocks

### ✅ Examples
**CORRECT:**
```
### Main Component
Details about the component...

### Helper Functions
Details about helpers...
```

**WRONG:**
```
<1-feature-name>
Feature Name Description
## Feature Overview
Content...
</1-feature-name>
```

### ✅ Before Saving
- [ ] Run sync-documentation.js validation
- [ ] Ensure no ERROR messages
- [ ] Check implicit headers are used throughout
</claude-checklist>

---

**Remember**: Good documentation is consistent, findable, and maintainable. These standards ensure all three.