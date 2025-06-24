#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const APPS_ROOT = path.join(__dirname, '..');

// Add XML tags to sections that are missing them
function addMissingXMLTags(content) {
  const lines = content.split('\n');
  const fixedLines = [];
  let inXMLSection = false;
  let currentTag = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    
    // Check for opening XML tag
    const openTagMatch = line.match(/^<([a-z-]+)>$/);
    if (openTagMatch) {
      inXMLSection = true;
      currentTag = openTagMatch[1];
      fixedLines.push(line);
      continue;
    }
    
    // Check for closing XML tag
    const closeTagMatch = line.match(/^<\/([a-z-]+)>$/);
    if (closeTagMatch) {
      inXMLSection = false;
      currentTag = null;
      fixedLines.push(line);
      continue;
    }
    
    // Check for ## header without preceding XML tag
    const headerMatch = line.match(/^##\s+(.+)$/);
    if (headerMatch && !inXMLSection) {
      // Generate tag name from header
      const tagName = headerMatch[1].toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Add opening tag
      fixedLines.push(`<${tagName}>`);
      fixedLines.push(line);
      inXMLSection = true;
      currentTag = tagName;
      
      // Find where this section ends and add closing tag
      let sectionEndIndex = i + 1;
      while (sectionEndIndex < lines.length) {
        const checkLine = lines[sectionEndIndex];
        if (checkLine.match(/^##\s+/) || checkLine.match(/^<[a-z-]+>$/)) {
          break;
        }
        sectionEndIndex++;
      }
      
      // Mark where to insert closing tag
      lines[sectionEndIndex - 1] = lines[sectionEndIndex - 1] + `\n</${tagName}>`;
    } else {
      fixedLines.push(line);
    }
  }
  
  return fixedLines.join('\n');
}

async function main() {
  console.log('🔧 Adding missing XML tags to documentation files...\n');
  
  // Files that need fixing based on the errors
  const filesToFix = [
    '/docs/general/development/agent-usage-guidelines.md',
    '/docs/general/development/documentation-standards.md',
    '/docs/general/development/documentation-standards-examples.md',
    '/docs/general/development/safe-agent-tasks-examples.md',
    '/docs/general/development/session-learnings-2025-06-24.md',
    '/docs/general/development/sync-documentation-test-report.md',
    '/docs/projects/mila/README.md',
    '/docs/projects/mila/implementation/projectplan.md',
    '/docs/projects/mila/implementation/session-summary-2025-01-23.md',
    '/docs/projects/mila/implementation/tech-stack-research.md'
  ];
  
  let fixedCount = 0;
  
  for (const file of filesToFix) {
    const fullPath = path.join(APPS_ROOT, file);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${file}`);
      continue;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const fixed = addMissingXMLTags(content);
    
    if (fixed !== content) {
      fs.writeFileSync(fullPath, fixed);
      console.log(`✓ Fixed: ${file}`);
      fixedCount++;
    } else {
      console.log(`✓ Already good: ${file}`);
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files!`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}