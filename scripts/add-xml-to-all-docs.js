#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const APPS_ROOT = path.join(__dirname, '..');

// Skip these files from XML tag addition
const SKIP_FILES = [
  'CLAUDE.md', // Project memory files have special format
  '.expo/README.md', // Generated file
];

// Add XML tags to sections that are missing them
function addXMLTagsToFile(content, filePath) {
  const lines = content.split('\n');
  const fixedLines = [];
  let inXMLSection = false;
  let currentTag = null;
  const openTags = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    
    // Check for opening XML tag
    const openTagMatch = line.match(/^<([a-z-]+)>$/);
    if (openTagMatch) {
      inXMLSection = true;
      currentTag = openTagMatch[1];
      openTags.push(currentTag);
      fixedLines.push(line);
      continue;
    }
    
    // Check for closing XML tag
    const closeTagMatch = line.match(/^<\/([a-z-]+)>$/);
    if (closeTagMatch) {
      inXMLSection = false;
      currentTag = null;
      openTags.pop();
      fixedLines.push(line);
      continue;
    }
    
    // Check for ## header without preceding XML tag
    const headerMatch = line.match(/^##\s+(.+)$/);
    if (headerMatch && openTags.length === 0) {
      // Generate tag name from header
      const tagName = headerMatch[1].toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Skip numbered sections
      if (/^\d+[-_]/.test(tagName)) {
        fixedLines.push(line);
        continue;
      }
      
      // Add opening tag
      fixedLines.push(`<${tagName}>`);
      fixedLines.push(line);
      inXMLSection = true;
      currentTag = tagName;
      openTags.push(tagName);
      
      // Find where this section ends
      let sectionEndIndex = i + 1;
      while (sectionEndIndex < lines.length) {
        const checkLine = lines[sectionEndIndex];
        // Stop at next ## header or XML tag
        if (checkLine.match(/^##\s+/) || checkLine.match(/^<[a-z-]+>$/)) {
          break;
        }
        sectionEndIndex++;
      }
      
      // Store where to insert closing tag
      if (!lines[sectionEndIndex - 1].match(/^<\/[a-z-]+>$/)) {
        lines[sectionEndIndex - 1] = lines[sectionEndIndex - 1] + `\n</${tagName}>`;
      }
    } else {
      fixedLines.push(line);
    }
  }
  
  // Close any unclosed tags at end of file
  while (openTags.length > 0) {
    const tag = openTags.pop();
    fixedLines.push(`</${tag}>`);
  }
  
  return fixedLines.join('\n');
}

// Special handling for README files
function processREADME(content, filePath) {
  const fileName = path.basename(filePath);
  const dirName = path.basename(path.dirname(filePath));
  
  // For root README files, add overview section
  if (!content.includes('<overview>') && !content.includes('<project-info>')) {
    const lines = content.split('\n');
    const titleIndex = lines.findIndex(line => line.startsWith('# '));
    
    if (titleIndex !== -1) {
      // Find first content after title
      let contentStart = titleIndex + 1;
      while (contentStart < lines.length && lines[contentStart].trim() === '') {
        contentStart++;
      }
      
      // Insert overview tag
      if (contentStart < lines.length && !lines[contentStart].startsWith('#')) {
        lines.splice(contentStart, 0, '<overview>');
        
        // Find where overview ends (next header or end of intro)
        let overviewEnd = contentStart + 1;
        while (overviewEnd < lines.length && 
               !lines[overviewEnd].startsWith('#') && 
               lines[overviewEnd].trim() !== '') {
          overviewEnd++;
        }
        lines.splice(overviewEnd, 0, '</overview>');
      }
      
      content = lines.join('\n');
    }
  }
  
  return content;
}

async function main() {
  console.log('🔧 Adding XML tags to all documentation files...\n');
  
  // Find all markdown files
  const markdownFiles = [];
  
  function findMarkdownFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (['node_modules', '.git', 'android', 'ios', 'build'].includes(entry.name)) continue;
        findMarkdownFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const relative = path.relative(APPS_ROOT, fullPath);
        if (!SKIP_FILES.some(skip => relative.endsWith(skip))) {
          markdownFiles.push(fullPath);
        }
      }
    }
  }
  
  findMarkdownFiles(APPS_ROOT);
  
  let fixedCount = 0;
  let checkedCount = 0;
  
  for (const file of markdownFiles) {
    checkedCount++;
    let content = fs.readFileSync(file, 'utf8');
    
    // Special processing for README files
    if (path.basename(file) === 'README.md') {
      content = processREADME(content, file);
    }
    
    // Add XML tags to all sections
    const fixed = addXMLTagsToFile(content, file);
    
    if (fixed !== content) {
      fs.writeFileSync(file, fixed);
      console.log(`✓ Fixed: ${path.relative(APPS_ROOT, file)}`);
      fixedCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Checked: ${checkedCount} files`);
  console.log(`   Fixed: ${fixedCount} files`);
  console.log(`   Already good: ${checkedCount - fixedCount} files`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}