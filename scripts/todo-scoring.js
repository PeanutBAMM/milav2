#!/usr/bin/env node

/**
 * Todo Scoring - Backwards compatible wrapper
 * This script now uses the unified todo-manager.js
 */

const { execSync } = require('child_process');
const path = require('path');

// Get the todo-manager path
const todoManagerPath = path.join(__dirname, 'todo-manager.js');

// Export the old functions for compatibility
const TodoManager = require('./todo-manager');
const manager = new TodoManager();

module.exports = {
  scoreTodo: (story) => {
    const scores = manager.calculateScore(story);
    const area = manager.determineArea(story);
    const segment = scores.score >= 7.0 ? 'TOP' : 
                    scores.score >= 5.0 ? 'MEDIUM' : 'LAGE';
    
    return {
      segment,
      title: story,
      description: 'Als developer wil ik ' + story.toLowerCase(),
      ...scores,
      area
    };
  },
  calculateScore: manager.calculateScore.bind(manager),
  determineArea: manager.determineArea.bind(manager),
  generateMarkdownTable: manager.generateMarkdownTable.bind(manager),
  padString: manager.padString.bind(manager),
  createTableRow: manager.createTableRow.bind(manager)
};

// CLI usage - pass through to todo-manager
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--generate-table') {
    console.log('Usage: node todo-scoring.js "Your user story here"');
    console.log('       node todo-scoring.js --generate-table');
    console.log('\nNote: This is now a wrapper for todo-manager.js');
    process.exit(1);
  }
  
  // Pass through to todo-manager score command
  try {
    execSync(`node "${todoManagerPath}" score "${args.join(' ')}"`, { stdio: 'inherit' });
  } catch (error) {
    process.exit(1);
  }
}