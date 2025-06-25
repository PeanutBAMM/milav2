#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration for Mila project documentation
const MILA_PROJECT_ROOT = path.join(__dirname, '..', '..', '..', 'mila');
const MILA_DOCS_DIR = __dirname; // This script is in /docs/projects/mila/
const EXCLUDE_DIRS = ['node_modules', '.git', '.expo', 'android', 'ios', 'build', 'dist'];
const EXCLUDE_FILES = ['CLAUDE.md', 'README.md', 'pull_request_template.md', 'todo-tracker.md'];

// Categories for Mila project documentation
const CATEGORIES = {
  'implementation': {
    keywords: ['plan', 'setup', 'tech-stack', 'session', 'progress', 'eas'],
    files: [],
  },
  'architecture': {
    keywords: ['design', 'architecture', 'pattern', 'structure', 'component'],
    files: [],
  },
  'api': {
    keywords: ['api', 'endpoint', 'database', 'schema', 'supabase'],
    files: [],
  },
  'features': {
    keywords: ['feature', 'screen', 'auth', 'shopping', 'list', 'expense'],
    files: [],
  },
};

// Helper functions
function categorizeFile(filePath, content) {
  const fileName = path.basename(filePath).toLowerCase().replace('.md', '');
  const contentLower = content.toLowerCase();

  // Direct filename matches
  const fileMatches = {
    'projectplan': 'implementation',
    'implementation-plan': 'implementation',
    'tech-stack-research': 'implementation',
    'session-summary': 'implementation',
    'design-reference': 'architecture',
    'database-schema': 'api',
    'api-reference': 'api',
  };

  // Check filename patterns
  for (const [pattern, category] of Object.entries(fileMatches)) {
    if (fileName.includes(pattern)) {
      return category;
    }
  }

  // Content-based matching
  const combined = fileName + ' ' + contentLower.slice(0, 1000);

  for (const [category, rules] of Object.entries(CATEGORIES)) {
    const matched = rules.keywords.some((keyword) => combined.includes(keyword));
    if (matched) {
      return category;
    }
  }

  return 'implementation'; // Default category for Mila docs
}

function findMarkdownFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (EXCLUDE_DIRS.includes(entry)) continue;
      if (fullPath.includes('node_modules')) continue;
      findMarkdownFiles(fullPath, files);
    } else if (entry.endsWith('.md')) {
      if (EXCLUDE_FILES.includes(entry) && !fullPath.includes('.github')) continue;
      if (entry === 'pull_request_template.md' && fullPath.includes('.github')) continue;
      files.push(fullPath);
    }
  }

  return files;
}

async function organizeMilaDocs() {
  console.log('🚀 Organizing Mila project documentation...\n');

  // Find markdown files in Mila project
  const files = findMarkdownFiles(MILA_PROJECT_ROOT);
  
  // Filter to only Mila-specific docs (not in node_modules, etc)
  const milaFiles = files.filter(file => {
    const relative = path.relative(MILA_PROJECT_ROOT, file);
    return !relative.includes('node_modules') && 
           !relative.includes('docs/') && // Skip already organized docs
           !relative.startsWith('.');
  });

  // Process each file
  for (const file of milaFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const category = categorizeFile(file, content);
      const fileName = path.basename(file);
      const newPath = path.join(MILA_DOCS_DIR, category, fileName);

      // Skip if already in correct location
      if (path.resolve(file) === path.resolve(newPath)) continue;

      // Create category directory if needed
      const categoryDir = path.join(MILA_DOCS_DIR, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }

      // Copy file
      fs.writeFileSync(newPath, content);
      console.log(`✓ Organized: ${path.basename(file)} → ${category}/${fileName}`);

      CATEGORIES[category].files.push({
        name: fileName,
        title: extractTitle(content),
      });
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
    }
  }

  // Generate index
  generateMilaDocsIndex();

  console.log('\n✅ Mila documentation organization complete!');
}

function extractTitle(content) {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1] : 'Untitled';
}

function generateMilaDocsIndex() {
  let indexContent = '# Mila Project Documentation\n\n';
  indexContent += 'Documentation specific to the Mila family shopping list application.\n\n';

  const categoryNames = {
    'implementation': '📋 Implementation & Planning',
    'architecture': '🏗️ Architecture & Design',
    'api': '🔌 API & Database',
    'features': '✨ Features & Components',
  };

  for (const [category, data] of Object.entries(CATEGORIES)) {
    if (data.files.length === 0) continue;

    indexContent += `## ${categoryNames[category]}\n\n`;
    data.files.sort((a, b) => a.name.localeCompare(b.name));

    for (const file of data.files) {
      indexContent += `- [${file.title}](./${category}/${file.name})\n`;
    }
    indexContent += '\n';
  }

  indexContent += '---\n\n';
  indexContent += '← [Back to General Docs](../../general/)\n\n';
  indexContent += '*This index is specific to the Mila project*\n';

  fs.writeFileSync(path.join(MILA_DOCS_DIR, 'README.md'), indexContent);
  console.log('\n✓ Generated Mila project index');
}

// Run if called directly
if (require.main === module) {
  organizeMilaDocs().catch(console.error);
}

module.exports = { organizeMilaDocs };