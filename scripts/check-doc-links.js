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

function extractLinks(content) {
  const links = [];
  
  // Match [text](path) links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    const linkPath = match[2];
    // Only check relative paths (not URLs or anchors)
    if (!linkPath.startsWith('http') && !linkPath.startsWith('#') && !linkPath.startsWith('mailto:')) {
      links.push({
        text: match[1],
        path: linkPath,
        fullMatch: match[0]
      });
    }
  }
  
  return links;
}

function checkLinks(filePath, rootDir) {
  const content = fs.readFileSync(filePath, 'utf8');
  const links = extractLinks(content);
  const brokenLinks = [];
  
  const fileDir = path.dirname(filePath);
  
  for (const link of links) {
    // Clean the path (remove anchors)
    const cleanPath = link.path.split('#')[0];
    if (!cleanPath) continue; // Skip pure anchors
    
    // Resolve the path relative to the file containing the link
    const resolvedPath = path.resolve(fileDir, cleanPath);
    
    // Check if the file exists
    if (!fs.existsSync(resolvedPath)) {
      brokenLinks.push({
        ...link,
        resolvedPath,
        expectedPath: path.relative(rootDir, resolvedPath)
      });
    }
  }
  
  return brokenLinks;
}

function main() {
  console.log(`${colors.bright}${colors.blue}Checking Documentation Links${colors.reset}`);
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
  
  let totalBrokenLinks = 0;
  let filesWithBrokenLinks = 0;
  
  // Check links in each file
  for (const filePath of mdFiles) {
    const brokenLinks = checkLinks(filePath, rootDir);
    
    if (brokenLinks.length > 0) {
      const relativePath = path.relative(rootDir, filePath);
      console.log(`\n${colors.bright}${relativePath}${colors.reset}`);
      filesWithBrokenLinks++;
      
      for (const link of brokenLinks) {
        console.log(`${colors.red}  ✗ [${link.text}](${link.path})${colors.reset}`);
        console.log(`${colors.yellow}    Expected: ${link.expectedPath}${colors.reset}`);
        totalBrokenLinks++;
      }
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log(`${colors.bright}Summary:${colors.reset}`);
  
  if (totalBrokenLinks === 0) {
    console.log(`${colors.green}✓ All links are valid!${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Found ${totalBrokenLinks} broken link(s) in ${filesWithBrokenLinks} file(s)${colors.reset}`);
  }
}

// Run the script
main();