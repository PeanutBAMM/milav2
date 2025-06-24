#!/usr/bin/env node

/**
 * Sync Documentation Script
 * 
 * This script automatically:
 * 1. Detects new code files and generates appropriate documentation
 * 2. Updates README.md indexes when files are added/removed
 * 3. Maintains consistent documentation structure
 * 4. Enforces documentation standards (XML tags, clickable links)
 * 
 * Usage:
 *   node scripts/sync-documentation.js [--check] [--staged]
 *   
 * Options:
 *   --check   Only check, don't make changes
 *   --staged  Only process staged files (for git hooks)
 * 
 * See: docs/general/development/documentation-standards.md
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const APPS_ROOT = path.join(__dirname, '..');
const DOCS_ROOT = path.join(APPS_ROOT, 'docs');

// Helper to suggest alternative tag names
function suggestAlternativeTag(tagName, lineNumber, content) {
  // Get context around the line to understand the section
  const lines = content.split('\n');
  const contextLine = lines[lineNumber - 1] || '';
  
  // Common patterns for subsections
  const patterns = {
    'workflow': ['step', 'task', 'action', 'phase'],
    'setup': ['config', 'install', 'init', 'prepare'],
    'features': ['feature-item', 'capability', 'function'],
    'performance': ['optimization', 'metric', 'benchmark'],
    'testing': ['test-type', 'test-case', 'validation'],
    'documentation': ['doc-section', 'guide', 'reference'],
    'development': ['dev-step', 'process', 'practice'],
    'architecture': ['component', 'layer', 'module'],
    'implementation': ['step', 'phase', 'approach'],
    'dependencies': ['package', 'library', 'dep-info']
  };
  
  // Try to find a pattern match
  if (patterns[tagName]) {
    // Use line number to cycle through suggestions
    const suggestions = patterns[tagName];
    return suggestions[lineNumber % suggestions.length];
  }
  
  // Generic numbered alternative
  return `${tagName}-${lineNumber}`;
}

// XML Tag Validation
function validateXMLTags(content, filePath) {
  const openTags = [];
  const xmlTagRegex = /<([a-z-]+)>|<\/([a-z-]+)>/g;
  let match;
  let isValid = true;
  const issues = [];
  
  // Track line numbers
  let lineNumber = 1;
  let lastIndex = 0;
  
  while ((match = xmlTagRegex.exec(content))) {
    // Count line numbers
    const textBefore = content.substring(lastIndex, match.index);
    lineNumber += (textBefore.match(/\n/g) || []).length;
    lastIndex = match.index;
    
    if (match[1]) {
      // Opening tag
      const tagName = match[1];
      
      // Check for duplicate nesting
      if (openTags.some(t => t.tag === tagName)) {
        const suggestion = suggestAlternativeTag(tagName, lineNumber, content);
        issues.push(`Line ${lineNumber}: Duplicate nested tag <${tagName}> - suggest: <${suggestion}>`);
        isValid = false;
      }
      
      // Check tag name length
      if (tagName.length > 20) {
        issues.push(`Line ${lineNumber}: Tag name too long <${tagName}> (max 20 chars)`);
        isValid = false;
      }
      
      // Check for numbered tags (not allowed)
      if (/^\d+[-_]/.test(tagName)) {
        const cleanName = tagName.replace(/^\d+[-_]/, '');
        issues.push(`Line ${lineNumber}: Numbered tag <${tagName}> not allowed - use semantic name like <${cleanName}>`);
        isValid = false;
      }
      
      // NEW: Check tag usage
      const lines = content.split('\n');
      let nextContentLineIndex = lineNumber;
      while (nextContentLineIndex < lines.length && lines[nextContentLineIndex].trim() === '') {
        nextContentLineIndex++;
      }
      if (nextContentLineIndex < lines.length) {
        const nextContent = lines[nextContentLineIndex].trim();
        
        // Check if tag is wrapping a ### subsection (not allowed)
        if (/^#{3,}/.test(nextContent)) {
          issues.push(`Line ${lineNumber}: XML tag wrapping ### subsection - only tag ## sections`);
          isValid = false;
        }
        
        // Check for explicit ## header after tag (implicit is required)
        if (/^##\s/.test(nextContent)) {
          issues.push(`Line ${lineNumber}: ERROR: Explicit headers not allowed - remove '## ${nextContent.replace(/^##\s+/, '')}' after <${tagName}>`);
          isValid = false;
        }
        
        // Check for redundant title lines
        if (nextContentLineIndex + 1 < lines.length && 
            !/^#{2,}/.test(nextContent) && 
            /^#{3,}/.test(lines[nextContentLineIndex + 1].trim())) {
          issues.push(`Line ${lineNumber}: ERROR: Redundant title '${nextContent}' after <${tagName}> - remove this line`);
          isValid = false;
        }
        
        // Implicit header pattern is valid (no ## needed after tag)
        // Tag serves as the section header
      }
      
      openTags.push({ tag: tagName, line: lineNumber });
    } else if (match[2]) {
      // Closing tag
      const expected = openTags.pop();
      if (!expected || expected.tag !== match[2]) {
        issues.push(`Line ${lineNumber}: Expected </${expected?.tag || '?'}> but found </${match[2]}>`);
        isValid = false;
      }
    }
  }
  
  // Check for unclosed tags
  if (openTags.length > 0) {
    issues.push(`Unclosed tags: ${openTags.map(t => `<${t.tag}> at line ${t.line}`).join(', ')}`);
    isValid = false;
  }
  
  // Check whitespace issues
  const whitespaceIssues = validateXMLWhitespace(content, filePath);
  if (whitespaceIssues.length > 0) {
    issues.push(...whitespaceIssues);
    isValid = false;
  }
  
  // Check if file needs example companion
  const exampleCheck = shouldHaveExampleFile(content, filePath);
  if (exampleCheck.needed) {
    console.warn(`📋 Example file recommended for ${path.relative(path.join(__dirname, '..'), filePath)}:`);
    exampleCheck.issues.forEach(issue => console.warn(`   ${issue}`));
    console.warn(`   Suggested: Create ${exampleCheck.suggestedName}`);
  }
  
  // Report all issues at once
  if (issues.length > 0) {
    console.warn(`⚠️  XML issues in ${path.relative(path.join(__dirname, '..'), filePath)}:`);
    issues.forEach(issue => console.warn(`   ${issue}`));
  }
  
  return isValid;
}

// Validate XML whitespace
function validateXMLWhitespace(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  
  // Check for blank lines after opening tags
  const openingTagPattern = /<([a-z-]+)>$/;
  for (let i = 0; i < lines.length - 1; i++) {
    if (openingTagPattern.test(lines[i]) && lines[i + 1] === '') {
      issues.push(`Line ${i + 1}: Blank line after opening tag <${lines[i].match(openingTagPattern)[1]}>`);
    }
  }
  
  // Check for blank lines before closing tags
  const closingTagPattern = /^<\/([a-z-]+)>/;
  for (let i = 1; i < lines.length; i++) {
    if (closingTagPattern.test(lines[i]) && lines[i - 1] === '') {
      issues.push(`Line ${i + 1}: Blank line before closing tag </${lines[i].match(closingTagPattern)[1]}>`);
    }
  }
  
  // Check for multiple blank lines between tag blocks
  const tagBlockEndPattern = /^<\/[a-z-]+>$/;
  const tagBlockStartPattern = /^<[a-z-]+>$/;
  for (let i = 0; i < lines.length - 3; i++) {
    if (tagBlockEndPattern.test(lines[i]) && 
        lines[i + 1] === '' && 
        lines[i + 2] === '' && 
        tagBlockStartPattern.test(lines[i + 3])) {
      issues.push(`Line ${i + 2}-${i + 3}: Multiple blank lines between tag blocks`);
    }
  }
  
  return issues;
}

// Ensure links are clickable with proper relative paths
function ensureClickableLinks(content, currentPath) {
  // Skip external links and anchors
  return content.replace(
    /\[([^\]]+)\]\((?!http)(?!#)([^)]+)\)/g,
    (match, text, link) => {
      // If already a proper relative path, keep it
      if (link.startsWith('./') || link.startsWith('../')) {
        return match;
      }
      
      // Convert to relative path from Apps root
      const fullPath = path.resolve(path.dirname(currentPath), link);
      const relativePath = path.relative(APPS_ROOT, fullPath);
      return `[${text}](./${relativePath})`;
    }
  );
}

// Templates for generated documentation
const TEMPLATES = {
  project: {
    claude: `# {name} Project Guidelines

<overview>
{description}

### Base Guidelines
This project follows all general development rules from:
- [Apps Workspace Guidelines](../CLAUDE.md)
- [General Documentation](../docs/general/README.md)

The rules below are PROJECT-SPECIFIC extensions and overrides.
</overview>

<configuration>
### Tech Stack
See package.json for dependencies and versions.
</configuration>

---

Remember: **Stability > Features**. A working app with 3 features is better than a crashing app with 10 features.
`,
    readme: `# {name} Project Documentation

<project-info>
- **Type**: {projectType}
- **Status**: Active Development
- **Primary Goal**: {description}
</project-info>

<quick-links>
- [Project CLAUDE.md](../../../{name}/CLAUDE.md) - Project-specific guidelines
</quick-links>

<implementation>
Documentation will be added as the project develops.
</implementation>

<features>
Features will be documented as they are implemented.
</features>

---

**Navigation**: [Back to General](../../general/README.md) | [{name} Project](../../../{name}/)
`
  },
  troubleshooting: `# {category} Troubleshooting

<overview>
Common issues and solutions for {category}. These fixes have been tested across multiple projects.
</overview>

<issues>
{issuesList}
</issues>

<contribution>
### Contributing
When adding new fixes, use this template:

\`\`\`markdown
<issue-descriptive-name>
### Issue Title

**Problem**: Description of the problem
**Affected**: Which projects/environments
**First seen**: Where encountered

**Solution**:
\`\`\`language
// Code solution
\`\`\`

**Why it works**: Explanation
</issue-descriptive-name>
\`\`\`
</contribution>

---

**Navigation**: [Back to Troubleshooting](./README.md) | [All Guides](../README.md)
*Last updated: {date}*
`,
  feature: `# Feature: {name}

<overview>
{description}
</overview>

<components>
### {componentName}
**Location**: [{componentPath}](./{componentPath})
**Purpose**: {purpose}

### Related Components
<!-- Only add if truly related -->
</components>

<state-management>
{stateInfo}

**Store Location**: [{storePath}](./{storePath})
</state-management>

<api-integration>
{apiInfo}

**Service**: [{serviceName}](../api/{serviceName}.md)
</api-integration>

<testing>
Test files location: [{testPath}](./{testPath})
</testing>

---
*Generated from code analysis on {date}*
`,
  service: `# Service: {name}

<overview>
Service for {purpose}.
</overview>

<functions>
{functions}
</functions>

<usage>
\`\`\`typescript
{usageExample}
\`\`\`
</usage>

<dependencies>
{dependencies}
</dependencies>

<related-docs>
<!-- Only essential links -->
- [Project API Overview](../README.md#api)
</related-docs>

---
*Generated from code analysis on {date}*
`,
  component: `# Component: {name}

<overview>
{description}
</overview>

<props>
{propsTable}
</props>

<usage>
\`\`\`tsx
{usageExample}
\`\`\`
</usage>

<styling>
{stylingInfo}

**Style File**: [{styleFile}](./{styleFile})
</styling>

<accessibility>
- **Keyboard Navigation**: {keyboardSupport}
- **Screen Reader**: {screenReaderSupport}
- **Focus Management**: {focusHandling}
</accessibility>

---
*Generated from code analysis on {date}*
`
};

// Helper to detect if a file needs an example companion
function shouldHaveExampleFile(content, filePath) {
  const fileName = path.basename(filePath, '.md');
  const issues = [];
  
  // Skip if this IS an examples file
  if (fileName.endsWith('-examples')) {
    return { needed: false, issues: [] };
  }
  
  // Check for complex XML examples in code blocks
  const codeBlockRegex = /```[\s\S]*?```/g;
  const codeBlocks = content.match(codeBlockRegex) || [];
  
  let hasComplexXMLExamples = false;
  let xmlExampleCount = 0;
  
  for (const block of codeBlocks) {
    // Check if block contains XML-like tags
    if (/<[a-z-]+>/.test(block) && /<\/[a-z-]+>/.test(block)) {
      xmlExampleCount++;
      // Check if it's showing documentation structure (not HTML/JSX)
      if (block.includes('##') || block.includes('###') || block.includes('[/') || block.includes('[')) {
        hasComplexXMLExamples = true;
      }
    }
  }
  
  // Criteria for needing an example file
  if (xmlExampleCount > 3) {
    issues.push(`Has ${xmlExampleCount} XML examples - consider moving to ${fileName}-examples.md`);
  }
  
  if (hasComplexXMLExamples) {
    issues.push(`Contains complex XML structure examples that could cause parsing issues`);
  }
  
  // Check for large template sections
  const templateSections = content.match(/<template[^>]*>[\s\S]*?<\/template>/g) || [];
  if (templateSections.length > 2) {
    issues.push(`Has ${templateSections.length} template sections - consider separate examples file`);
  }
  
  // Check file size - large docs might benefit from examples separation
  const lineCount = content.split('\n').length;
  if (lineCount > 500 && xmlExampleCount > 0) {
    issues.push(`Large file (${lineCount} lines) with XML examples - consider separation`);
  }
  
  return {
    needed: issues.length > 0,
    issues: issues,
    suggestedName: `${fileName}-examples.md`
  };
}

// Helper functions
function detectContext(filePath) {
  const relative = path.relative(APPS_ROOT, filePath);
  
  // Skip docs and node_modules
  if (relative.startsWith('docs/') || relative.includes('node_modules')) {
    return { type: 'skip', project: null };
  }
  
  // Workspace level files
  if (relative.startsWith('scripts/')) return { type: 'workspace-script', project: null };
  if (relative.startsWith('shared/')) return { type: 'shared', project: null };
  
  // Project level files
  const projectMatch = relative.match(/^([^/]+)\//);
  if (projectMatch) {
    const projectPath = path.join(APPS_ROOT, projectMatch[1]);
    if (fs.existsSync(path.join(projectPath, 'package.json'))) {
      return { type: 'project', project: projectMatch[1] };
    }
  }
  
  return { type: 'unknown', project: null };
}

function getProjectInfo(projectPath) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
    const isReactNative = packageJson.dependencies?.['react-native'] || packageJson.dependencies?.['expo'];
    
    return {
      name: packageJson.name || path.basename(projectPath),
      description: packageJson.description || 'Project description',
      projectType: isReactNative ? 'React Native' : 'Node.js',
      dependencies: packageJson.dependencies || {}
    };
  } catch (error) {
    return {
      name: path.basename(projectPath),
      description: 'Project description',
      projectType: 'Unknown',
      dependencies: {}
    };
  }
}

function detectFileType(filePath) {
  const relative = path.relative(APPS_ROOT, filePath);
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath);
  
  // Skip non-code files
  if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) return null;
  
  // Feature detection
  if (relative.includes('/features/')) return 'feature';
  if (relative.includes('/services/')) return 'service';
  if (relative.includes('/components/') && ext === '.tsx') return 'component';
  
  // Skip certain files
  if (fileName.includes('.test.') || fileName.includes('.spec.')) return null;
  if (fileName === 'index.ts' || fileName === 'index.tsx') return null;
  if (relative.includes('/types/') || relative.includes('/utils/')) return null;
  
  return null;
}

function generateDocumentation(filePath, fileType, context) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath, path.extname(filePath));
  const date = new Date().toISOString().split('T')[0];
  
  switch (fileType) {
    case 'feature':
      return generateFeatureDoc(filePath, fileContent, context, date);
    case 'service':
      return generateServiceDoc(filePath, fileContent, context, date);
    case 'component':
      return generateComponentDoc(filePath, fileContent, context, date);
    default:
      return null;
  }
}

function generateFeatureDoc(filePath, content, context, date) {
  const featureName = path.basename(path.dirname(filePath));
  const componentName = path.basename(filePath, path.extname(filePath));
  const projectBase = context.project ? path.join(APPS_ROOT, context.project) : APPS_ROOT;
  const componentPath = path.relative(projectBase, filePath);
  
  // Extract basic info from content
  const hasState = content.includes('useState') || content.includes('useStore') || content.includes('zustand');
  const hasApi = content.includes('supabase') || content.includes('fetch') || content.includes('axios');
  
  // Dummy paths for template (will be refined when more context available)
  const storePath = hasState ? `src/features/${featureName}/store.ts` : 'No store';
  const serviceName = hasApi ? `${featureName}Service` : 'No service';
  const testPath = `__tests__/${featureName}.test.tsx`;
  
  let doc = TEMPLATES.feature
    .replace(/{name}/g, featureName)
    .replace(/{componentName}/g, componentName)
    .replace(/{componentPath}/g, componentPath)
    .replace(/{description}/g, `Feature implementation for ${featureName}`)
    .replace(/{purpose}/g, `Handles ${featureName} functionality`)
    .replace(/{stateInfo}/g, hasState ? 'Uses local state management' : 'No state management detected')
    .replace(/{storePath}/g, storePath)
    .replace(/{apiInfo}/g, hasApi ? 'Integrates with backend services' : 'No API integration detected')
    .replace(/{serviceName}/g, serviceName)
    .replace(/{testPath}/g, testPath)
    .replace(/{date}/g, date);
  
  // Apply clickable links
  doc = ensureClickableLinks(doc, path.join(DOCS_ROOT, 'projects', context.project || 'general', 'features', `${featureName}.md`));
  
  return {
    content: doc,
    path: `features/${featureName}.md`
  };
}

function generateServiceDoc(filePath, content, context, date) {
  const serviceName = path.basename(filePath, path.extname(filePath));
  
  // Extract exported functions (basic regex, could be improved)
  const exportMatches = content.match(/export\s+(async\s+)?function\s+(\w+)/g) || [];
  const functions = exportMatches.map(match => {
    const funcName = match.match(/function\s+(\w+)/)[1];
    return `### ${funcName}\nTODO: Add description`;
  }).join('\n\n');
  
  const doc = TEMPLATES.service
    .replace(/{name}/g, serviceName)
    .replace(/{purpose}/g, serviceName.replace(/([A-Z])/g, ' $1').toLowerCase())
    .replace(/{functions}/g, functions || 'No exported functions detected')
    .replace(/{usageExample}/g, `import { functionName } from './${serviceName}';\n\n// Usage example`)
    .replace(/{dependencies}/g, 'TODO: Document dependencies')
    .replace(/{date}/g, date);
  
  return {
    content: doc,
    path: `api/${serviceName}.md`
  };
}

function generateComponentDoc(filePath, content, context, date) {
  const componentName = path.basename(filePath, path.extname(filePath));
  const projectBase = context.project ? path.join(APPS_ROOT, context.project) : APPS_ROOT;
  const componentPath = path.relative(projectBase, filePath);
  
  // Basic prop detection
  const propsMatch = content.match(/interface\s+\w*Props\s*{([^}]+)}/);
  const propsTable = propsMatch 
    ? '| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| TODO | TODO | TODO | TODO |'
    : 'No props defined';
  
  // Style file detection
  const styleFile = componentPath.replace(/\.tsx?$/, '.styles.ts');
  const hasStyleFile = fs.existsSync(path.join(projectBase, styleFile));
  
  // Accessibility defaults
  const keyboardSupport = 'TODO: Document keyboard support';
  const screenReaderSupport = 'TODO: Document ARIA labels';
  const focusHandling = 'TODO: Document focus management';
  
  let doc = TEMPLATES.component
    .replace(/{name}/g, componentName)
    .replace(/{description}/g, `React component for ${componentName}`)
    .replace(/{propsTable}/g, propsTable)
    .replace(/{usageExample}/g, `<${componentName} />`)
    .replace(/{stylingInfo}/g, content.includes('styled') ? 'Uses styled components' : 'Uses inline styles')
    .replace(/{styleFile}/g, hasStyleFile ? styleFile : 'No separate style file')
    .replace(/{keyboardSupport}/g, keyboardSupport)
    .replace(/{screenReaderSupport}/g, screenReaderSupport)
    .replace(/{focusHandling}/g, focusHandling)
    .replace(/{date}/g, date);
  
  // Apply clickable links
  doc = ensureClickableLinks(doc, path.join(DOCS_ROOT, 'projects', context.project || 'general', 'components', `${componentName}.md`));
  
  return {
    content: doc,
    path: `components/${componentName}.md`
  };
}

function ensureProjectDocs(projectName) {
  const projectPath = path.join(APPS_ROOT, projectName);
  const projectDocsPath = path.join(DOCS_ROOT, 'projects', projectName);
  
  // Create project docs directory if needed
  if (!fs.existsSync(projectDocsPath)) {
    fs.mkdirSync(projectDocsPath, { recursive: true });
  }
  
  // Create CLAUDE.md if missing
  const claudePath = path.join(projectPath, 'CLAUDE.md');
  if (!fs.existsSync(claudePath)) {
    const projectInfo = getProjectInfo(projectPath);
    const claudeContent = TEMPLATES.project.claude
      .replace(/{name}/g, projectName)
      .replace(/{description}/g, projectInfo.description);
    
    fs.writeFileSync(claudePath, claudeContent);
    console.log(`✓ Created: ${projectName}/CLAUDE.md`);
  }
  
  // Create README.md if missing
  const readmePath = path.join(projectDocsPath, 'README.md');
  if (!fs.existsSync(readmePath)) {
    const projectInfo = getProjectInfo(projectPath);
    const readmeContent = TEMPLATES.project.readme
      .replace(/{name}/g, projectName)
      .replace(/{description}/g, projectInfo.description)
      .replace(/{projectType}/g, projectInfo.projectType);
    
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`✓ Created: docs/projects/${projectName}/README.md`);
    
    // Update Apps/CLAUDE.md project registry
    updateProjectRegistry(projectName, projectInfo);
  }
}

function updateProjectRegistry(projectName, projectInfo) {
  const claudePath = path.join(APPS_ROOT, 'CLAUDE.md');
  let claudeContent = fs.readFileSync(claudePath, 'utf8');
  
  // Check if project already in registry
  if (claudeContent.includes(`[${projectName}]`)) return;
  
  // Find the project registry table
  const tableMatch = claudeContent.match(/(\| Project[\s\S]*?\|[\s\S]*?)\n\|/);
  if (tableMatch) {
    const newRow = `| [${projectName}](./${projectName}/CLAUDE.md) | ${projectInfo.projectType} | Active | [${projectName} Docs](./docs/projects/${projectName}/README.md) |`;
    claudeContent = claudeContent.replace(
      tableMatch[0],
      tableMatch[0] + '\n' + newRow + '\n|'
    );
    
    fs.writeFileSync(claudePath, claudeContent);
    console.log(`✓ Updated: Apps/CLAUDE.md project registry`);
  }
}

async function processFile(filePath) {
  const context = detectContext(filePath);
  
  if (context.type === 'skip' || context.type === 'unknown') return null;
  
  // Ensure project documentation structure exists
  if (context.type === 'project') {
    ensureProjectDocs(context.project);
  }
  
  // Check if this file needs documentation
  const fileType = detectFileType(filePath);
  if (!fileType) return null;
  
  // Generate documentation
  const doc = generateDocumentation(filePath, fileType, context);
  if (!doc) return null;
  
  // Determine output path
  let outputPath;
  if (context.type === 'project') {
    const categoryDir = path.join(DOCS_ROOT, 'projects', context.project, path.dirname(doc.path));
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    outputPath = path.join(DOCS_ROOT, 'projects', context.project, doc.path);
  } else {
    const categoryDir = path.join(DOCS_ROOT, 'general', path.dirname(doc.path));
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    outputPath = path.join(DOCS_ROOT, 'general', doc.path);
  }
  
  // Only create if doesn't exist (don't overwrite)
  if (!fs.existsSync(outputPath)) {
    // Fix whitespace before validation
    doc.content = fixXMLWhitespace(doc.content);
    
    // Validate XML tags before writing
    if (!validateXMLTags(doc.content, outputPath)) {
      console.error(`✗ Skipping ${outputPath} due to XML validation errors`);
      return null;
    }
    
    fs.writeFileSync(outputPath, doc.content);
    console.log(`✓ Generated: ${path.relative(APPS_ROOT, outputPath)}`);
    return outputPath;
  }
  
  return null;
}

async function getChangedFiles(staged = false) {
  try {
    const command = staged 
      ? 'git diff --cached --name-only'
      : 'git diff --name-only HEAD~1';
    
    const output = execSync(command, { cwd: APPS_ROOT }).toString();
    return output.split('\n').filter(file => file.length > 0);
  } catch (error) {
    // Fallback: process all files in current directory
    return [];
  }
}

// Get all code files in the project
function getAllCodeFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip directories
      if (['node_modules', '.git', 'docs', 'android', 'ios', 'build', 'dist', '.expo'].includes(entry.name)) continue;
      getAllCodeFiles(fullPath, files);
    } else if (entry.isFile()) {
      // Include TypeScript, JavaScript, and other source files
      const ext = path.extname(entry.name);
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        // Get relative path from APPS_ROOT
        files.push(path.relative(APPS_ROOT, fullPath));
      }
    }
  }
  
  return files;
}

// Add XML tags to existing documentation
function addXMLTagsToSection(content, sectionHeader) {
  // Only tag ## sections, not ### or deeper
  const headerRegex = new RegExp(`^(#{2})\\s+${sectionHeader}\\s*$`, 'gmi');
  return content.replace(headerRegex, (match, hashes) => {
    const tagName = sectionHeader.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return `<${tagName}>\n${match}`;
  });
}

function findSectionEnd(content, startIndex) {
  const lines = content.substring(startIndex).split('\n');
  let depth = 0;
  let endIndex = startIndex;
  
  // Find the depth of current section
  const firstLine = lines[0];
  const currentDepth = (firstLine.match(/^#+/) || [''])[0].length;
  
  // Find where this section ends
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const hashMatch = line.match(/^#+\s/);
    
    if (hashMatch && hashMatch[0].length <= currentDepth) {
      // Found a section at same or higher level
      break;
    }
    
    endIndex += lines[i].length + 1; // +1 for newline
  }
  
  return endIndex;
}

function addClosingXMLTags(content) {
  // Find all opening tags
  const openingTags = [];
  const tagRegex = /<([a-z-]+)>\s*\n\s*(#{2,3})/g;
  let match;
  
  while ((match = tagRegex.exec(content))) {
    const tagName = match[1];
    const sectionStart = match.index;
    const sectionEnd = findSectionEnd(content, sectionStart);
    
    openingTags.push({
      tag: tagName,
      start: sectionStart,
      end: sectionEnd
    });
  }
  
  // Add closing tags in reverse order (to not mess up indices)
  for (let i = openingTags.length - 1; i >= 0; i--) {
    const { tag, end } = openingTags[i];
    
    // Check if closing tag already exists
    const closingTagRegex = new RegExp(`</${tag}>`, 'g');
    const contentAfterSection = content.substring(end, end + 100); // Check next 100 chars
    
    if (!closingTagRegex.test(contentAfterSection)) {
      // Insert closing tag
      const insertPosition = end;
      content = content.substring(0, insertPosition) + 
                `</${tag}>\n` + 
                content.substring(insertPosition);
    }
  }
  
  return content;
}

// Fix XML whitespace issues
function fixXMLWhitespace(content) {
  let fixed = content;
  
  // Pattern 1: Remove blank lines after opening tags
  const openingTagPattern = /(<[a-z-]+>)\n\n+/g;
  fixed = fixed.replace(openingTagPattern, '$1\n');
  
  // Pattern 2: Remove blank lines before closing tags
  const closingTagPattern = /\n\n+(<\/[a-z-]+>)/g;
  fixed = fixed.replace(closingTagPattern, '\n$1');
  
  // Pattern 3: Ensure single blank line between tag blocks
  const betweenTagsPattern = /(<\/[a-z-]+>)\n{0,1}(<[a-z-]+>)/g;
  fixed = fixed.replace(betweenTagsPattern, '$1\n\n$2');
  
  const multiBlankPattern = /(<\/[a-z-]+>)\n{3,}(<[a-z-]+>)/g;
  fixed = fixed.replace(multiBlankPattern, '$1\n\n$2');
  
  // Pattern 4: Special case for file start
  if (fixed.match(/^(<[a-z-]+>)\n\n/)) {
    fixed = fixed.replace(/^(<[a-z-]+>)\n\n/, '$1\n');
  }
  
  // Pattern 5: Special case for file end
  if (fixed.match(/\n\n(<\/[a-z-]+>)$/)) {
    fixed = fixed.replace(/\n\n(<\/[a-z-]+>)$/, '\n$1');
  }
  
  return fixed;
}

function fixExistingDocumentation(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Check if already has properly formed XML tags
  const hasXMLTags = /<[a-z-]+>\s*\n\s*(#{2,3}|##)/.test(content) && 
                     /<\/[a-z-]+>/.test(content);
  
  if (hasXMLTags) {
    // Fix whitespace issues
    content = fixXMLWhitespace(content);
    
    // Ensure clickable links
    content = ensureClickableLinks(content, filePath);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Fixed: ${path.relative(APPS_ROOT, filePath)}`);
      return true;
    }
    
    // Validate existing XML
    if (!validateXMLTags(content, filePath)) {
      console.warn(`⚠️  Remaining XML issues in: ${path.relative(APPS_ROOT, filePath)}`);
    }
    return false;
  }
  
  // Common section headers to add XML tags to
  const sectionHeaders = [
    'Project Overview', 'Project Info', 'Quick Links', 'Essential Links',
    'Architecture', 'Architecture & Design', 'Implementation', 'Implementation Guides',
    'Features', 'Feature Documentation', 'API', 'API & Backend',
    'Scripts', 'Project Scripts', 'Commands', 'Development Commands',
    'Status', 'Current Status', 'Performance', 'Performance & Efficiency',
    'CI/CD', 'CI/CD & Automation', 'Development', 'Development Workflows',
    'Setup', 'Getting Started', 'React Native', 'React Native & Expo',
    'Best Practices', 'Quick Reference', 'Overview', 'Functions',
    'Usage', 'Dependencies', 'Related Documentation', 'Props',
    'Styling', 'Accessibility', 'Components', 'State Management',
    'API Integration', 'Testing', 'Related Docs', 'Project Context',
    'General Reference', 'Base Guidelines', 'Tech Stack', 
    'Project-Specific Configuration', 'Documentation Standards'
  ];
  
  // Add opening XML tags
  for (const header of sectionHeaders) {
    content = addXMLTagsToSection(content, header);
  }
  
  // Add closing XML tags
  content = addClosingXMLTags(content);
  
  // Ensure clickable links
  content = ensureClickableLinks(content, filePath);
  
  // Only write if changed
  if (content !== originalContent) {
    // Validate XML before writing
    if (!validateXMLTags(content, filePath)) {
      console.error(`✗ Skipping ${filePath} due to XML validation errors after fix attempt`);
      return false;
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed: ${path.relative(APPS_ROOT, filePath)}`);
    return true;
  }
  
  return false;
}

function getAllMarkdownFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      getAllMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  const staged = args.includes('--staged');
  const fixExisting = args.includes('--fix-existing');
  const scanMode = args.includes('--scan');
  const forceFix = args.includes('--force-fix');
  const help = args.includes('--help') || args.includes('-h');
  
  if (help) {
    console.log(`
📚 Documentation Sync Tool

Usage: node scripts/sync-documentation.js [options]

Options:
  --scan            Scan all code files and generate documentation
  --staged          Process only staged files (for pre-commit hook)
  --check <file>    Check a specific file for validation errors
  --fix-existing    Fix XML issues in existing documentation
  --force-fix       Force fix documentation (bypass validation)
  --help, -h        Show this help message

Examples:
  # Generate docs for all code files
  node scripts/sync-documentation.js --scan
  
  # Fix existing documentation
  node scripts/sync-documentation.js --fix-existing
  
  # Force fix when validation blocks normal fix
  node scripts/sync-documentation.js --force-fix
  
  # Check specific file
  node scripts/sync-documentation.js --check docs/general/README.md
`);
    return;
  }
  
  console.log('🔄 Syncing documentation...\n');
  
  if (fixExisting || forceFix) {
    console.log('📝 Fixing existing documentation files...\n');
    
    // Get all markdown files in docs directory
    const markdownFiles = getAllMarkdownFiles(DOCS_ROOT);
    
    // Also get CLAUDE.md files in project roots
    const projectDirs = fs.readdirSync(APPS_ROOT, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && 
        !['node_modules', '.git', 'docs', 'scripts'].includes(entry.name))
      .map(entry => path.join(APPS_ROOT, entry.name));
    
    for (const projectDir of projectDirs) {
      const claudePath = path.join(projectDir, 'CLAUDE.md');
      if (fs.existsSync(claudePath)) {
        markdownFiles.push(claudePath);
      }
    }
    
    // Also include Apps/CLAUDE.md
    const appsClaudePath = path.join(APPS_ROOT, 'CLAUDE.md');
    if (fs.existsSync(appsClaudePath)) {
      markdownFiles.push(appsClaudePath);
    }
    
    let fixedCount = 0;
    for (const file of markdownFiles) {
      if (forceFix) {
        // Force fix mode: bypass validation
        const content = fs.readFileSync(file, 'utf8');
        let fixed = fixXMLWhitespace(content);
        fixed = ensureClickableLinks(fixed, file);
        
        if (fixed !== content) {
          fs.writeFileSync(file, fixed);
          console.log(`✓ Force fixed: ${path.relative(APPS_ROOT, file)}`);
          fixedCount++;
        }
      } else if (fixExistingDocumentation(file)) {
        fixedCount++;
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} documentation files!`);
    return;
  }
  
  // Get files to process
  let files;
  if (scanMode) {
    console.log('📂 Scanning all code files...\n');
    files = getAllCodeFiles(APPS_ROOT);
    console.log(`Found ${files.length} code files to process.\n`);
  } else {
    files = await getChangedFiles(staged);
    
    if (files.length === 0 && !staged) {
      console.log('No changed files detected. Use --staged for pre-commit hook or --scan for all files.');
      return;
    }
  }
  
  // Process each file
  const generatedDocs = [];
  for (const file of files) {
    const fullPath = path.join(APPS_ROOT, file);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const docPath = await processFile(fullPath);
      if (docPath && scanMode) {
        generatedDocs.push(docPath);
      }
    }
  }
  
  // Update README indexes if in scan mode
  if (scanMode && generatedDocs.length > 0) {
    console.log('\n📋 Updating README indexes...');
    await updateReadmeIndexes(generatedDocs);
  }
  
  console.log('\n✅ Documentation sync complete!');
}

// Update README indexes with new documentation files
async function updateReadmeIndexes(generatedDocs) {
  // Group docs by category
  const docsByCategory = {};
  
  for (const docPath of generatedDocs) {
    // Extract category from path
    const relative = path.relative(DOCS_ROOT, docPath);
    const parts = relative.split(path.sep);
    
    let category;
    if (parts[0] === 'projects' && parts.length > 2) {
      // Project-specific docs
      category = path.join(DOCS_ROOT, 'projects', parts[1], parts[2]);
    } else if (parts[0] === 'general' && parts.length > 1) {
      // General docs
      category = path.join(DOCS_ROOT, 'general', parts[1]);
    } else {
      continue;
    }
    
    if (!docsByCategory[category]) {
      docsByCategory[category] = [];
    }
    docsByCategory[category].push(docPath);
  }
  
  // Update each category's README
  for (const [categoryPath, docs] of Object.entries(docsByCategory)) {
    const readmePath = path.join(categoryPath, 'README.md');
    
    if (!fs.existsSync(readmePath)) {
      // Create new README if doesn't exist
      const categoryName = path.basename(categoryPath);
      const title = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
      let content = `# ${title} Documentation\n\n<overview>\nDocumentation for ${title.toLowerCase()} related code.\n</overview>\n\n<files>\n`;
      
      // List existing docs in directory
      const existingDocs = fs.readdirSync(categoryPath)
        .filter(f => f.endsWith('.md') && f !== 'README.md')
        .sort();
      
      for (const doc of existingDocs) {
        const docContent = fs.readFileSync(path.join(categoryPath, doc), 'utf8');
        const titleMatch = docContent.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : doc.replace('.md', '');
        content += `- [${title}](./${doc})\n`;
      }
      
      content += `</files>\n`;
      fs.writeFileSync(readmePath, content);
      console.log(`✓ Created category index: ${path.relative(APPS_ROOT, readmePath)}`);
    } else {
      // Update existing README
      let content = fs.readFileSync(readmePath, 'utf8');
      
      // Find the files section
      const filesMatch = content.match(/<files>([\s\S]*?)<\/files>/);
      if (filesMatch) {
        const currentFiles = filesMatch[1].trim().split('\n');
        const newFiles = [];
        
        // Add new docs to list
        for (const docPath of docs) {
          const docName = path.basename(docPath);
          const docContent = fs.readFileSync(docPath, 'utf8');
          const titleMatch = docContent.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1] : docName.replace('.md', '');
          const link = `- [${title}](./${docName})`;
          
          if (!currentFiles.some(line => line.includes(docName))) {
            newFiles.push(link);
          }
        }
        
        if (newFiles.length > 0) {
          // Merge and sort all files
          const allFiles = [...currentFiles, ...newFiles]
            .filter(line => line.trim())
            .sort();
          
          // Update content
          content = content.replace(
            /<files>[\s\S]*?<\/files>/,
            `<files>\n${allFiles.join('\n')}\n</files>`
          );
          
          fs.writeFileSync(readmePath, content);
          console.log(`✓ Updated category index: ${path.relative(APPS_ROOT, readmePath)}`);
        }
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { detectContext, generateDocumentation };