/**
 * Simple RAG (Retrieval-Augmented Generation) System
 * Local-first, performance-optimized documentation index
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class SimpleDocsRAG {
  constructor(options = {}) {
    this.docsDir = options.docsDir || path.join(__dirname, '..', 'docs');
    this.cacheDir = options.cacheDir || path.join(__dirname, 'cache');
    this.index = new Map(); // In-memory keyword → doc mapping
    this.fileCache = new Map(); // File content cache
    this.conversationMemory = []; // Last 3 conversations
    this.maxConversations = options.maxConversations || 3;
  }

  /**
   * Initialize and build the index
   */
  async initialize() {
    console.time('RAG Initialization');
    
    // Ensure cache directory exists
    await fs.mkdir(this.cacheDir, { recursive: true });
    
    // Try to load existing index
    const cached = await this.loadCachedIndex();
    if (cached && !await this.isIndexStale(cached)) {
      this.index = new Map(cached.index);
      this.conversationMemory = cached.conversations || [];
      console.log('✓ Loaded cached index');
      console.timeEnd('RAG Initialization');
      return;
    }
    
    // Build new index
    await this.buildIndex();
    await this.saveCachedIndex();
    
    console.timeEnd('RAG Initialization');
  }

  /**
   * Build the search index from docs
   */
  async buildIndex() {
    console.log('Building new index...');
    const files = await this.getAllMarkdownFiles(this.docsDir);
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const relativePath = path.relative(this.docsDir, file);
        
        // Cache file content
        this.fileCache.set(relativePath, {
          content,
          checksum: this.getChecksum(content),
          lastModified: (await fs.stat(file)).mtime
        });
        
        // Extract and index content
        await this.indexDocument(relativePath, content);
      } catch (error) {
        console.warn(`Failed to index ${file}:`, error.message);
      }
    }
    
    console.log(`✓ Indexed ${files.length} documents`);
  }

  /**
   * Index a single document
   */
  async indexDocument(filePath, content) {
    // Extract sections and metadata
    const sections = this.extractSections(content);
    const xmlTags = this.extractXMLTags(content);
    
    // Simple keyword extraction (can be enhanced)
    const keywords = this.extractKeywords(content);
    
    // Index by keywords
    keywords.forEach(keyword => {
      if (!this.index.has(keyword)) {
        this.index.set(keyword, []);
      }
      
      // Store with relevance info
      const entry = {
        file: filePath,
        sections: sections.map(s => s.title),
        xmlTags,
        preview: this.getPreview(content),
        relevance: this.calculateRelevance(keyword, content)
      };
      
      this.index.get(keyword).push(entry);
    });
    
    // Also index by XML tags
    xmlTags.forEach(tag => {
      const tagKey = `tag:${tag}`;
      if (!this.index.has(tagKey)) {
        this.index.set(tagKey, []);
      }
      this.index.get(tagKey).push({
        file: filePath,
        tag,
        preview: this.getPreview(content)
      });
    });
  }

  /**
   * Search for documents
   */
  search(query, options = {}) {
    const startTime = Date.now();
    const limit = options.limit || 10;
    const includeContent = options.includeContent || false;
    
    // Normalize query
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    
    // Collect all matching documents
    const results = new Map(); // file → score
    
    queryTerms.forEach(term => {
      // Direct keyword match
      const matches = this.index.get(term) || [];
      
      // Also check partial matches
      this.index.forEach((docs, keyword) => {
        if (keyword.includes(term) || term.includes(keyword)) {
          matches.push(...docs);
        }
      });
      
      // Score and aggregate
      matches.forEach(match => {
        const currentScore = results.get(match.file) || 0;
        results.set(match.file, currentScore + (match.relevance || 1));
      });
    });
    
    // Sort by score and limit
    const sorted = Array.from(results.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
    
    // Format results
    const formattedResults = sorted.map(([file, score]) => {
      const cached = this.fileCache.get(file);
      const result = {
        file,
        score,
        preview: cached ? this.getPreview(cached.content) : '',
        sections: this.getSectionsForFile(file)
      };
      
      if (includeContent && cached) {
        result.content = cached.content;
      }
      
      return result;
    });
    
    const searchTime = Date.now() - startTime;
    console.log(`Search completed in ${searchTime}ms`);
    
    return {
      query,
      results: formattedResults,
      count: formattedResults.length,
      searchTime
    };
  }

  /**
   * Get specific section from a document
   */
  async getSection(filePath, sectionName) {
    const cached = this.fileCache.get(filePath);
    if (!cached) {
      // Try to load file
      const fullPath = path.join(this.docsDir, filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      return this.extractSection(content, sectionName);
    }
    
    return this.extractSection(cached.content, sectionName);
  }

  /**
   * Save conversation for continuity
   */
  async saveConversation(summary) {
    const conversation = {
      timestamp: new Date().toISOString(),
      summary: summary.summary || '',
      keyTopics: summary.keyTopics || [],
      filesModified: summary.filesModified || [],
      nextSteps: summary.nextSteps || []
    };
    
    // Add to memory (FIFO)
    this.conversationMemory.push(conversation);
    if (this.conversationMemory.length > this.maxConversations) {
      this.conversationMemory.shift();
    }
    
    // Persist
    await this.saveConversationMemory();
    
    return conversation;
  }

  /**
   * Get conversation context for startup
   */
  getStartupContext() {
    if (this.conversationMemory.length === 0) {
      return null;
    }
    
    const lastSession = this.conversationMemory[this.conversationMemory.length - 1];
    return {
      lastSession,
      recentTopics: this.extractRecentTopics(),
      suggestedNextSteps: this.compileSuggestedSteps()
    };
  }

  // Helper methods
  
  async getAllMarkdownFiles(dir, files = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !['node_modules', '.git'].includes(entry.name)) {
        await this.getAllMarkdownFiles(fullPath, files);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  extractSections(content) {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;
    
    lines.forEach((line, index) => {
      const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2];
        sections.push({ level, title, line: index + 1 });
      }
    });
    
    return sections;
  }

  extractXMLTags(content) {
    const tags = new Set();
    const tagRegex = /<([a-z-]+)>/g;
    let match;
    
    while ((match = tagRegex.exec(content))) {
      tags.add(match[1]);
    }
    
    return Array.from(tags);
  }

  extractKeywords(content) {
    // Simple keyword extraction - can be enhanced with NLP
    const text = content.toLowerCase();
    const words = text.match(/\b[a-z]{3,}\b/g) || [];
    
    // Filter common words
    const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'this', 'that', 'are', 'was', 'were', 'been']);
    
    const keywords = new Set();
    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 3) {
        keywords.add(word);
      }
    });
    
    return Array.from(keywords);
  }

  getPreview(content, maxLength = 200) {
    // Get first paragraph or section
    const firstPara = content.split('\n\n')[0]
      .replace(/^#.*$/m, '')
      .replace(/<[^>]+>/g, '')
      .trim();
    
    return firstPara.length > maxLength 
      ? firstPara.substring(0, maxLength) + '...'
      : firstPara;
  }

  calculateRelevance(keyword, content) {
    const lowerContent = content.toLowerCase();
    const count = (lowerContent.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
    return Math.min(count, 10); // Cap at 10 for relevance
  }

  getSectionsForFile(file) {
    const sections = new Set();
    this.index.forEach((docs) => {
      docs.forEach(doc => {
        if (doc.file === file && doc.sections) {
          doc.sections.forEach(s => sections.add(s));
        }
      });
    });
    return Array.from(sections);
  }

  extractSection(content, sectionName) {
    const lines = content.split('\n');
    let inSection = false;
    let sectionContent = [];
    let sectionLevel = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
      
      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2];
        
        if (title.toLowerCase() === sectionName.toLowerCase()) {
          inSection = true;
          sectionLevel = level;
          sectionContent.push(line);
        } else if (inSection && level <= sectionLevel) {
          // End of section
          break;
        } else if (inSection) {
          sectionContent.push(line);
        }
      } else if (inSection) {
        sectionContent.push(line);
      }
    }
    
    return sectionContent.join('\n');
  }

  getChecksum(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  // Cache management
  
  async loadCachedIndex() {
    try {
      const indexPath = path.join(this.cacheDir, 'index.json');
      const data = await fs.readFile(indexPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  async saveCachedIndex() {
    const indexPath = path.join(this.cacheDir, 'index.json');
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      index: Array.from(this.index.entries()),
      fileCount: this.fileCache.size,
      conversations: this.conversationMemory
    };
    
    await fs.writeFile(indexPath, JSON.stringify(data, null, 2));
  }

  async isIndexStale(cached) {
    // Check if any files have changed
    const files = await this.getAllMarkdownFiles(this.docsDir);
    
    for (const file of files) {
      const stats = await fs.stat(file);
      const relativePath = path.relative(this.docsDir, file);
      const cachedFile = this.fileCache.get(relativePath);
      
      if (!cachedFile || stats.mtime > new Date(cachedFile.lastModified)) {
        return true;
      }
    }
    
    return false;
  }

  async saveConversationMemory() {
    const memoryPath = path.join(this.cacheDir, 'conversation-memory.json');
    await fs.writeFile(memoryPath, JSON.stringify(this.conversationMemory, null, 2));
  }

  extractRecentTopics() {
    const topics = new Set();
    this.conversationMemory.forEach(conv => {
      (conv.keyTopics || []).forEach(topic => topics.add(topic));
    });
    return Array.from(topics);
  }

  compileSuggestedSteps() {
    const steps = [];
    this.conversationMemory.forEach(conv => {
      (conv.nextSteps || []).forEach(step => {
        if (!steps.includes(step)) {
          steps.push(step);
        }
      });
    });
    return steps.slice(-5); // Last 5 unique steps
  }
}

// Export for use
module.exports = SimpleDocsRAG;

// CLI interface for testing
if (require.main === module) {
  const rag = new SimpleDocsRAG();
  
  async function cli() {
    await rag.initialize();
    
    const command = process.argv[2];
    const query = process.argv.slice(3).join(' ');
    
    switch (command) {
      case 'search':
        const results = rag.search(query);
        console.log('\nSearch Results:');
        results.results.forEach((r, i) => {
          console.log(`\n${i + 1}. ${r.file} (score: ${r.score})`);
          console.log(`   ${r.preview}`);
        });
        break;
        
      case 'index':
        await rag.buildIndex();
        await rag.saveCachedIndex();
        console.log('Index rebuilt successfully');
        break;
        
      case 'context':
        const context = rag.getStartupContext();
        console.log('\nStartup Context:', JSON.stringify(context, null, 2));
        break;
        
      default:
        console.log('Usage: node simple-rag.js [search|index|context] <query>');
    }
  }
  
  cli().catch(console.error);
}