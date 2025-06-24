#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..', '..');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');
const EXCLUDE_DIRS = ['node_modules', '.git', '.expo', 'android', 'ios', 'build', 'dist'];
const EXCLUDE_FILES = ['CLAUDE.md', 'README.md', 'pull_request_template.md'];

// Category rules with keywords (order matters - first match wins)
const CATEGORIES = {
  '05-ci-cd': {
    keywords: ['ci-cd', 'eas-setup', 'eas-update', 'github', 'action', 'pipeline', 'workflow', '.github'],
    files: [],
  },
  '06-testing': {
    keywords: ['test', 'jest', 'detox', 'testing', 'unit', 'integration'],
    files: [],
  },
  '07-architecture': {
    keywords: ['design-reference', 'architecture', 'pattern', 'structure', 'diagram'],
    files: [],
  },
  '08-deployment': {
    keywords: ['deployment', 'deploy', 'release', 'cost-tracking', 'production'],
    files: [],
  },
  '09-troubleshooting': {
    keywords: ['fix', 'error-prevention', 'issue', 'problem', 'troubleshoot', 'debug'],
    files: [],
  },
  '10-project-management': {
    keywords: ['project', 'plan', 'progress', 'review', 'status', 'summary', 'implementation'],
    files: [],
  },
  '01-getting-started': {
    keywords: ['build-instructions', 'setup', 'install', 'quick', 'start', 'getting'],
    files: [],
  },
  '03-react-native': {
    keywords: ['react-native', 'component', 'navigation', 'screen'],
    files: [],
  },
  '04-expo-sdk': {
    keywords: ['expo', 'sdk'],
    excludeKeywords: ['eas-setup', 'eas-update'],
    files: [],
  },
  '02-development': {
    keywords: ['guide', 'standard', 'workflow', 'development', 'coding'],
    files: [],
  },
};

// Helper functions
function categorizeFile(filePath, content) {
  const fileName = path.basename(filePath).toLowerCase().replace('.md', '');
  const contentLower = content.toLowerCase();

  // Direct filename matches (highest priority)
  const fileMatches = {
    'ci-cd-setup': '05-ci-cd',
    'eas-setup': '05-ci-cd',
    eas_setup: '05-ci-cd',
    'github-setup': '05-ci-cd',
    'ci-overview': '05-ci-cd',
    'system-info': '02-development',
    system_info: '02-development',
    testing: '06-testing',
    'design-reference': '07-architecture',
    'deployment-guide': '08-deployment',
    'cost-tracking': '08-deployment',
    'tech-stack-research': '01-getting-started',
    'build-instructions': '01-getting-started',
    build_instructions: '01-getting-started',
    'error-prevention-guide': '09-troubleshooting',
    'fix-summary': '09-troubleshooting',
    fix_summary: '09-troubleshooting',
    projectplan: '10-project-management',
    'implementation-plan': '10-project-management',
    'progress-summary': '10-project-management',
    progress_summary: '10-project-management',
    review: '10-project-management',
    'build-status': '10-project-management',
    build_status: '10-project-management',
    'session-summary': '10-project-management',
    session_summary: '10-project-management',
  };

  if (fileMatches[fileName]) {
    return fileMatches[fileName];
  }

  // Content-based matching
  const combined = fileName + ' ' + contentLower.slice(0, 1000);

  for (const [category, rules] of Object.entries(CATEGORIES)) {
    // Check exclude keywords first
    if (rules.excludeKeywords) {
      const excluded = rules.excludeKeywords.some((keyword) => combined.includes(keyword));
      if (excluded) continue;
    }

    // Check include keywords
    const matched = rules.keywords.some((keyword) => combined.includes(keyword));
    if (matched) {
      return category;
    }
  }

  return '02-development'; // Default category
}

function updateRelativeLinks(content, oldPath, newPath) {
  // Calculate relative path changes
  const oldDir = path.dirname(oldPath);
  const newDir = path.dirname(newPath);

  // Simple regex to find markdown links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  return content.replace(linkRegex, (match, text, link) => {
    // Skip external links
    if (link.startsWith('http') || link.startsWith('#')) {
      return match;
    }

    // Calculate new relative path
    const absolutePath = path.resolve(oldDir, link);
    const newRelativePath = path.relative(newDir, absolutePath);

    return `[${text}](${newRelativePath.replace(/\\/g, '/')})`;
  });
}

function findMarkdownFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip excluded directories
      if (EXCLUDE_DIRS.includes(entry)) continue;
      // Skip if already in organized docs
      if (fullPath.includes(path.join('docs', '0'))) continue;
      // Skip node_modules in any location
      if (fullPath.includes('node_modules')) continue;

      findMarkdownFiles(fullPath, files);
    } else if (entry.endsWith('.md')) {
      // Skip excluded files (but not if in .github directory)
      if (EXCLUDE_FILES.includes(entry) && !fullPath.includes('.github')) continue;
      // Skip PR template - it needs to stay in .github
      if (entry === 'pull_request_template.md' && fullPath.includes('.github')) continue;
      // Skip docs index
      if (fullPath === path.join(DOCS_DIR, 'README.md')) continue;

      files.push(fullPath);
    }
  }

  return files;
}

async function organizeDocumentation() {
  console.log('🚀 Starting documentation organization...\n');

  // Find all markdown files
  const projectFiles = findMarkdownFiles(PROJECT_ROOT);
  const parentFiles = findMarkdownFiles(path.join(PROJECT_ROOT, '..'));
  const files = [...new Set([...projectFiles, ...parentFiles])];

  // Process each file
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const category = categorizeFile(file, content);
      let fileName = path.basename(file);
      
      // Special handling for .github files
      if (file.includes('.github')) {
        if (fileName.toLowerCase() === 'readme.md') {
          fileName = 'github-setup.md';
        } else if (fileName.toLowerCase() === 'ci.md') {
          fileName = 'ci-overview.md';
        }
      }
      
      const newPath = path.join(DOCS_DIR, category, fileName);

      // Skip if source and destination are the same
      if (path.resolve(file) === path.resolve(newPath)) continue;

      // Update relative links
      const updatedContent = updateRelativeLinks(content, file, newPath);

      // Move file
      fs.writeFileSync(newPath, updatedContent);

      // Determine if we should delete the original
      const relativeToRoot = path.relative(PROJECT_ROOT, file);
      const isInProjectRoot = path.dirname(file) === PROJECT_ROOT;
      const isReadme = fileName.toLowerCase() === 'readme.md';

      // Keep README in root, move everything else
      if (!isReadme && !relativeToRoot.startsWith('..')) {
        fs.unlinkSync(file);
        console.log(`✓ Moved: ${relativeToRoot} → docs/${category}/${fileName}`);
      } else if (isReadme && isInProjectRoot) {
        console.log(`✓ Keeping README.md in project root`);
      } else {
        console.log(`✓ Copied: ${relativeToRoot} → docs/${category}/${fileName}`);
      }

      CATEGORIES[category].files.push({
        name: fileName,
        originalPath: file,
        title: extractTitle(content),
      });
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
    }
  }

  // Generate index
  generateDocsIndex();

  console.log('\n✅ Documentation organization complete!');
}

function extractTitle(content) {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1] : 'Untitled';
}

function generateDocsIndex() {
  let indexContent = '# Mila Documentation Index\n\n';
  indexContent +=
    'Welcome to the Mila project documentation. All docs are organized by category for easy navigation.\n\n';
  indexContent += '## 📚 Documentation Structure\n\n';

  const categoryNames = {
    '01-getting-started': '🚀 Getting Started',
    '02-development': '💻 Development',
    '03-react-native': '📱 React Native',
    '04-expo-sdk': '📦 Expo SDK',
    '05-ci-cd': '🔄 CI/CD',
    '06-testing': '🧪 Testing',
    '07-architecture': '🏗️ Architecture',
    '08-deployment': '🚢 Deployment',
    '09-troubleshooting': '🔧 Troubleshooting',
    '10-project-management': '📊 Project Management',
  };

  for (const [category, data] of Object.entries(CATEGORIES)) {
    if (data.files.length === 0) continue;

    indexContent += `### ${categoryNames[category]}\n\n`;

    // Sort files alphabetically
    data.files.sort((a, b) => a.name.localeCompare(b.name));

    for (const file of data.files) {
      indexContent += `- [${file.title}](./${category}/${file.name})\n`;
    }
    indexContent += '\n';
  }

  indexContent += '---\n\n';
  indexContent += '*This index is automatically generated by `npm run organize-docs`*\n';

  fs.writeFileSync(path.join(DOCS_DIR, 'README.md'), indexContent);
  console.log('\n✓ Generated docs/README.md index');
}

// Run if called directly
if (require.main === module) {
  organizeDocumentation().catch(console.error);
}

module.exports = { organizeDocumentation };
