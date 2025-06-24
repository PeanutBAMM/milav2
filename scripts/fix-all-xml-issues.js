#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const APPS_ROOT = path.join(__dirname, '..');

// Fix all XML issues in a file
function fixAllXMLIssues(content, filePath) {
  let fixed = content;
  
  // 1. Remove explicit headers after XML tags
  fixed = fixed.replace(/(<[a-z-]+>)\n##\s+(.+)/g, '$1');
  
  // 2. Fix XML tags wrapping ### subsections (remove the tags)
  const lines = fixed.split('\n');
  const fixedLines = [];
  let skipNextClosingTag = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    
    // Check if XML tag is wrapping a ### subsection
    if (line.match(/^<[a-z-]+>$/) && nextLine && nextLine.match(/^###/)) {
      // Skip this opening tag
      console.log(`  Removing tag wrapping ### subsection: ${line}`);
      skipNextClosingTag = true;
      continue;
    }
    
    // Skip corresponding closing tag
    if (skipNextClosingTag && line.match(/^<\/[a-z-]+>$/)) {
      skipNextClosingTag = false;
      continue;
    }
    
    fixedLines.push(line);
  }
  
  fixed = fixedLines.join('\n');
  
  // 3. Fix tag names that are too long (>20 chars)
  fixed = fixed.replace(/<(xml-structure-examples)>/g, '<xml-examples>');
  fixed = fixed.replace(/<\/(xml-structure-examples)>/g, '</xml-examples>');
  fixed = fixed.replace(/<(important-discoveries)>/g, '<discoveries>');
  fixed = fixed.replace(/<\/(important-discoveries)>/g, '</discoveries>');
  fixed = fixed.replace(/<(code-snippets-to-remember)>/g, '<code-snippets>');
  fixed = fixed.replace(/<\/(code-snippets-to-remember)>/g, '</code-snippets>');
  fixed = fixed.replace(/<(next-session-todos)>/g, '<next-todos>');
  fixed = fixed.replace(/<\/(next-session-todos)>/g, '</next-todos>');
  
  // 4. Remove redundant titles after tags
  fixed = fixed.replace(/(<[a-z-]+>)\n([^#\n].*)/g, (match, tag, title) => {
    // Check if the title looks like a redundant tag or comment
    if (title.includes('<') && title.includes('>')) {
      console.log(`  Removing redundant title: ${title.trim()}`);
      return tag;
    }
    return match;
  });
  
  // 5. Fix missing closing tags at end of file
  const openTags = [];
  const finalLines = fixed.split('\n');
  
  for (const line of finalLines) {
    const openMatch = line.match(/^<([a-z-]+)>$/);
    const closeMatch = line.match(/^<\/([a-z-]+)>$/);
    
    if (openMatch) {
      openTags.push(openMatch[1]);
    } else if (closeMatch) {
      const lastOpen = openTags.pop();
      if (lastOpen !== closeMatch[1]) {
        console.log(`  Warning: Mismatched closing tag </${closeMatch[1]}> (expected </${lastOpen}>)`);
      }
    }
  }
  
  // Add missing closing tags
  while (openTags.length > 0) {
    const tag = openTags.pop();
    fixed = fixed.trimEnd() + `\n</${tag}>`;
    console.log(`  Added missing closing tag: </${tag}>`);
  }
  
  return fixed;
}

async function main() {
  console.log('🔧 Fixing all XML issues in documentation files...\n');
  
  // Files with known issues
  const filesToFix = [
    'docs/general/development/agent-usage-guidelines.md',
    'docs/general/development/documentation-standards-examples.md',
    'docs/general/development/documentation-standards.md',
    'docs/general/development/safe-agent-tasks-examples.md',
    'docs/general/development/session-learnings-2025-06-24.md',
    'docs/general/development/sync-documentation-test-report.md',
    'docs/general/development/xml-cleanup-summary.md',
    'docs/projects/mila/README.md',
    'docs/projects/mila/implementation/projectplan.md',
    'docs/projects/mila/implementation/session-summary-2025-01-23.md',
    'docs/projects/mila/implementation/tech-stack-research.md',
  ];
  
  let fixedCount = 0;
  
  for (const file of filesToFix) {
    const fullPath = path.join(APPS_ROOT, file);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${file}`);
      continue;
    }
    
    console.log(`\n📝 Processing: ${file}`);
    const content = fs.readFileSync(fullPath, 'utf8');
    const fixed = fixAllXMLIssues(content, fullPath);
    
    if (fixed !== content) {
      fs.writeFileSync(fullPath, fixed);
      console.log(`✓ Fixed: ${file}`);
      fixedCount++;
    } else {
      console.log(`✓ No issues found`);
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files!`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}