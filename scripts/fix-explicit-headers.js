#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const APPS_ROOT = path.join(__dirname, '..');
const DOCS_ROOT = path.join(APPS_ROOT, 'docs');

// Find all markdown files
function getAllMarkdownFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (['node_modules', '.git'].includes(entry.name)) continue;
      getAllMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fix explicit headers after XML tags
function fixExplicitHeaders(content) {
  const lines = content.split('\n');
  const fixedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    const nextNextLine = lines[i + 2];
    
    // Check for XML tag pattern
    const tagMatch = line.match(/^<([a-z-]+)>$/);
    
    if (tagMatch) {
      fixedLines.push(line); // Keep the XML tag
      
      // Check if next line (or line after blank) is ## header
      if (nextLine && nextLine.match(/^##\s+(.+)$/)) {
        // Skip the explicit header
        i++; 
        console.log(`  - Removed explicit header: "${nextLine.trim()}"`);
      } else if (nextLine === '' && nextNextLine && nextNextLine.match(/^##\s+(.+)$/)) {
        // Skip blank line and explicit header
        i += 2;
        console.log(`  - Removed explicit header: "${nextNextLine.trim()}"`);
      }
    } else {
      fixedLines.push(line);
    }
  }
  
  return fixedLines.join('\n');
}

async function main() {
  console.log('🔍 Finding files with explicit headers after XML tags...\n');
  
  // Get all markdown files
  const markdownFiles = getAllMarkdownFiles(DOCS_ROOT);
  
  // Also include project CLAUDE.md files
  const projectDirs = fs.readdirSync(APPS_ROOT, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !['node_modules', '.git', 'docs', 'scripts'].includes(entry.name))
    .map(entry => path.join(APPS_ROOT, entry.name));
  
  for (const projectDir of projectDirs) {
    const claudePath = path.join(projectDir, 'CLAUDE.md');
    if (fs.existsSync(claudePath)) {
      markdownFiles.push(claudePath);
    }
  }
  
  // Check Apps/CLAUDE.md
  const appsClaudePath = path.join(APPS_ROOT, 'CLAUDE.md');
  if (fs.existsSync(appsClaudePath)) {
    markdownFiles.push(appsClaudePath);
  }
  
  let totalFixed = 0;
  
  for (const file of markdownFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const fixed = fixExplicitHeaders(content);
    
    if (fixed !== content) {
      console.log(`\n📝 Fixing: ${path.relative(APPS_ROOT, file)}`);
      fs.writeFileSync(file, fixed);
      totalFixed++;
    }
  }
  
  console.log(`\n✅ Fixed ${totalFixed} files with explicit headers!`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}