#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const APPS_ROOT = path.join(__dirname, '..');

// Fix specific issues in the remaining files
function fixFinalIssues(content, filePath) {
  let fixed = content;
  const fileName = path.basename(filePath);
  
  // Fix documentation-standards-examples.md
  if (fileName === 'documentation-standards-examples.md') {
    // These are code examples showing XML structure, they should use [tag] notation
    fixed = fixed.replace(/<overview>\n## Overview/g, '[overview]\n## Overview');
    fixed = fixed.replace(/<features>\n## Features/g, '[features]\n## Features');
    fixed = fixed.replace(/<\/overview>/g, '[/overview]');
    fixed = fixed.replace(/<\/features>/g, '[/features]');
    
    // Fix any remaining <tag> in code examples to [tag]
    const lines = fixed.split('\n');
    let inCodeBlock = false;
    const fixedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Track code blocks
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
      }
      
      // Inside code blocks, convert <tag> to [tag]
      if (inCodeBlock && line.includes('<') && line.includes('>')) {
        // But not HTML/JSX examples
        if (!line.includes('div') && !line.includes('span') && !line.includes('header') && 
            !line.includes('main') && !line.includes('template') && !line.includes('h1')) {
          line = line.replace(/<([a-z-]+)>/g, '[$1]');
          line = line.replace(/<\/([a-z-]+)>/g, '[/$1]');
        }
      }
      
      fixedLines.push(line);
    }
    
    fixed = fixedLines.join('\n');
  }
  
  // Fix agent-usage-guidelines.md - needs closing tags
  if (fileName === 'agent-usage-guidelines.md') {
    // Check if missing closing tags
    if (!fixed.includes('</monitoring-rollback>')) {
      fixed = fixed.trimEnd() + '\n</monitoring-rollback>';
    }
    if (!fixed.includes('</troubleshooting>')) {
      // Find where troubleshooting section ends
      const troubleshootingIndex = fixed.indexOf('## Troubleshooting');
      if (troubleshootingIndex > -1) {
        // Find next ## section or end of file
        const afterTroubleshooting = fixed.substring(troubleshootingIndex);
        const nextSectionMatch = afterTroubleshooting.match(/\n##[^#]/);
        
        if (nextSectionMatch) {
          const insertIndex = troubleshootingIndex + nextSectionMatch.index;
          fixed = fixed.substring(0, insertIndex) + '\n</troubleshooting>' + fixed.substring(insertIndex);
        } else {
          fixed = fixed.trimEnd() + '\n</troubleshooting>';
        }
      }
    }
  }
  
  // Fix documentation-standards.md
  if (fileName === 'documentation-standards.md') {
    // Make sure all sections have proper closing tags
    const openTags = [];
    const lines = fixed.split('\n');
    
    for (const line of lines) {
      const openMatch = line.match(/^<([a-z-]+)>$/);
      const closeMatch = line.match(/^<\/([a-z-]+)>$/);
      
      if (openMatch && openMatch[1] !== 'performance') {
        openTags.push(openMatch[1]);
      } else if (closeMatch) {
        const expected = openTags[openTags.length - 1];
        if (expected === closeMatch[1]) {
          openTags.pop();
        }
      }
    }
    
    // Add missing closing tags
    while (openTags.length > 0) {
      const tag = openTags.pop();
      fixed = fixed.trimEnd() + `\n</${tag}>`;
      console.log(`  Added missing closing tag: </${tag}>`);
    }
  }
  
  // Fix tech-stack-research.md
  if (fileName === 'tech-stack-research.md') {
    // Close any unclosed sections
    if (!fixed.includes('</architecture>')) {
      fixed = fixed.trimEnd() + '\n</architecture>';
    }
  }
  
  return fixed;
}

async function main() {
  console.log('🔧 Fixing final documentation issues...\n');
  
  const filesToFix = [
    'docs/general/development/agent-usage-guidelines.md',
    'docs/general/development/documentation-standards-examples.md',
    'docs/general/development/documentation-standards.md',
    'docs/projects/mila/implementation/tech-stack-research.md',
  ];
  
  let fixedCount = 0;
  
  for (const file of filesToFix) {
    const fullPath = path.join(APPS_ROOT, file);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${file}`);
      continue;
    }
    
    console.log(`📝 Processing: ${file}`);
    const content = fs.readFileSync(fullPath, 'utf8');
    const fixed = fixFinalIssues(content, fullPath);
    
    if (fixed !== content) {
      fs.writeFileSync(fullPath, fixed);
      console.log(`✓ Fixed: ${file}\n`);
      fixedCount++;
    } else {
      console.log(`✓ No changes needed\n`);
    }
  }
  
  console.log(`✅ Fixed ${fixedCount} files!`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}