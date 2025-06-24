#!/usr/bin/env node

/**
 * Cleanup XML Tags Script
 * 
 * This script removes excessive XML tags from documentation files.
 * It ensures only ## (h2) sections have XML tags, not ### (h3) or deeper.
 * 
 * Usage:
 *   node scripts/cleanup-xml-tags.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const APPS_ROOT = path.join(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// Stats tracking
let totalFiles = 0;
let filesModified = 0;
let tagsRemoved = 0;
let totalTagsBefore = 0;
let totalTagsAfter = 0;

/**
 * Count XML tags in content
 */
function countXMLTags(content) {
  const openTags = (content.match(/<[a-z-]+>/g) || []).length;
  const closeTags = (content.match(/<\/[a-z-]+>/g) || []).length;
  return openTags + closeTags;
}

/**
 * Clean up XML tags in a markdown file
 */
function cleanupXMLTags(content, filePath) {
  const lines = content.split('\n');
  const result = [];
  const openTags = [];
  let modified = false;
  let removedCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if this is an opening XML tag
    const openTagMatch = trimmed.match(/^<([a-z-]+)>$/);
    if (openTagMatch) {
      const tagName = openTagMatch[1];
      
      // Look ahead to see what follows this tag
      let nextContentLine = '';
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') {
        j++;
      }
      if (j < lines.length) {
        nextContentLine = lines[j];
      }
      
      // Check if the next content is a ### or deeper heading
      const isSubsectionTag = /^#{3,}/.test(nextContentLine.trim());
      
      if (isSubsectionTag) {
        // Skip this tag - it's wrapping a subsection
        console.log(`  Removing subsection tag: <${tagName}> at line ${i + 1}`);
        openTags.push({ name: tagName, skip: true, line: i });
        modified = true;
        removedCount++;
        continue;
      } else {
        // Keep this tag - it's wrapping a ## section
        openTags.push({ name: tagName, skip: false, line: i });
        result.push(line);
        continue;
      }
    }
    
    // Check if this is a closing XML tag
    const closeTagMatch = trimmed.match(/^<\/([a-z-]+)>$/);
    if (closeTagMatch) {
      const tagName = closeTagMatch[1];
      
      // Find the matching opening tag
      const openTag = openTags.reverse().find(t => t.name === tagName);
      openTags.reverse();
      
      if (openTag && openTag.skip) {
        // Skip this closing tag too
        console.log(`  Removing subsection closing tag: </${tagName}> at line ${i + 1}`);
        modified = true;
        removedCount++;
        // Remove from openTags array
        const index = openTags.indexOf(openTag);
        if (index > -1) {
          openTags.splice(index, 1);
        }
        continue;
      }
    }
    
    // Keep the line
    result.push(line);
  }
  
  if (removedCount > 0) {
    tagsRemoved += removedCount;
  }
  
  return {
    content: result.join('\n'),
    modified: modified,
    removedCount: removedCount
  };
}

/**
 * Process a single markdown file
 */
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const tagsBefore = countXMLTags(content);
  totalTagsBefore += tagsBefore;
  
  console.log(`\nProcessing: ${path.relative(APPS_ROOT, filePath)}`);
  console.log(`  Tags before: ${tagsBefore}`);
  
  const { content: newContent, modified, removedCount } = cleanupXMLTags(content, filePath);
  
  if (modified) {
    const tagsAfter = countXMLTags(newContent);
    totalTagsAfter += tagsAfter;
    
    console.log(`  Tags after: ${tagsAfter} (removed ${removedCount})`);
    
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, newContent);
      console.log('  ✓ File updated');
    } else {
      console.log('  [DRY RUN] Would update file');
    }
    
    filesModified++;
  } else {
    totalTagsAfter += tagsBefore;
    console.log('  No changes needed');
  }
  
  totalFiles++;
}

/**
 * Find all markdown files in a directory
 */
function findMarkdownFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .git
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      findMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Main function
 */
function main() {
  console.log('🧹 XML Tag Cleanup Script');
  console.log('========================');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log('Rule: Only ## sections should have XML tags\n');
  
  // Find all markdown files
  const docsDir = path.join(APPS_ROOT, 'docs');
  const markdownFiles = findMarkdownFiles(docsDir);
  
  // Also include CLAUDE.md files in project roots
  const projectDirs = fs.readdirSync(APPS_ROOT, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && 
      !['node_modules', '.git', 'docs', 'scripts', 'assets'].includes(entry.name))
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
  
  console.log(`Found ${markdownFiles.length} markdown files to process\n`);
  
  // Process each file
  for (const file of markdownFiles) {
    processFile(file);
  }
  
  // Summary
  console.log('\n📊 Summary');
  console.log('==========');
  console.log(`Files processed: ${totalFiles}`);
  console.log(`Files modified: ${filesModified}`);
  console.log(`Total tags before: ${totalTagsBefore}`);
  console.log(`Total tags after: ${totalTagsAfter}`);
  console.log(`Tags removed: ${tagsRemoved}`);
  console.log(`Reduction: ${((tagsRemoved / totalTagsBefore) * 100).toFixed(1)}%`);
  
  if (DRY_RUN) {
    console.log('\n⚠️  This was a DRY RUN. No files were actually modified.');
    console.log('Run without --dry-run to apply changes.');
  } else {
    console.log('\n✅ Cleanup complete!');
  }
}

// Run the script
if (require.main === module) {
  main();
}