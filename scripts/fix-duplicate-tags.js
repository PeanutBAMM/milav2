#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function findMarkdownFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!item.startsWith('.') && item !== 'node_modules' && item !== 'ios' && item !== 'android') {
        findMarkdownFiles(fullPath, files);
      }
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixDuplicateTags(content, filePath) {
  const lines = content.split('\n');
  let modified = false;
  let fixedLines = [];
  let duplicatesFixed = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    
    // Check for duplicate tag pattern: <tag>\n<tag>
    const tagMatch = line.match(/^<([a-z-]+)>$/);
    const nextTagMatch = nextLine && nextLine.match(/^<([a-z-]+)>$/);
    
    if (tagMatch && nextTagMatch && tagMatch[1] === nextTagMatch[1]) {
      // Found duplicate tag
      console.log(`${colors.yellow}  Found duplicate <${tagMatch[1]}> at line ${i + 1}${colors.reset}`);
      fixedLines.push(line); // Keep first tag
      i++; // Skip duplicate
      modified = true;
      duplicatesFixed++;
    } else {
      fixedLines.push(line);
    }
  }
  
  if (modified) {
    console.log(`${colors.green}  Fixed ${duplicatesFixed} duplicate tag(s)${colors.reset}`);
  }
  
  return {
    content: fixedLines.join('\n'),
    modified,
    duplicatesFixed
  };
}

function main() {
  console.log(`${colors.bright}${colors.blue}Fixing Duplicate XML Tags${colors.reset}`);
  console.log('=' .repeat(50) + '\n');
  
  const rootDir = path.join(__dirname, '..');
  const docsDir = path.join(rootDir, 'docs');
  
  if (!fs.existsSync(docsDir)) {
    console.error(`${colors.red}Error: docs directory not found${colors.reset}`);
    process.exit(1);
  }
  
  // Find all markdown files
  console.log(`${colors.cyan}Scanning for markdown files...${colors.reset}`);
  const mdFiles = findMarkdownFiles(docsDir);
  console.log(`Found ${mdFiles.length} markdown files\n`);
  
  let totalDuplicates = 0;
  let filesFixed = 0;
  
  // Process each file
  for (const filePath of mdFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = fixDuplicateTags(content, filePath);
    
    if (result.modified) {
      const relativePath = path.relative(rootDir, filePath);
      console.log(`\n${colors.bright}${relativePath}${colors.reset}`);
      
      fs.writeFileSync(filePath, result.content);
      filesFixed++;
      totalDuplicates += result.duplicatesFixed;
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log(`${colors.bright}Summary:${colors.reset}`);
  console.log(`${colors.green}✓ Fixed ${totalDuplicates} duplicate tag(s) in ${filesFixed} file(s)${colors.reset}`);
}

// Run the script
main();