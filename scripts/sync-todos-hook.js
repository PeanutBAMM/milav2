#!/usr/bin/env node

/**
 * Sync Todos Hook - Backwards compatible wrapper
 * This script now uses the unified todo-manager.js
 */

const { execSync } = require('child_process');
const path = require('path');

// Get the todo-manager path
const todoManagerPath = path.join(__dirname, 'todo-manager.js');

// Export for compatibility
const TodoManager = require('./todo-manager');
const manager = new TodoManager();

async function syncTodos() {
  // Pass through to todo-manager sync command
  try {
    const args = process.argv.slice(2);
    if (args.length > 0) {
      execSync(`node "${todoManagerPath}" sync '${args[0]}'`, { stdio: 'inherit' });
    } else {
      execSync(`node "${todoManagerPath}" sync`, { stdio: 'inherit' });
    }
  } catch (error) {
    process.exit(1);
  }
}

module.exports = { 
  syncTodos,
  generateTodoTrackerContent: manager.generateTodoTrackerContent.bind(manager)
};

// Run sync if called directly
if (require.main === module) {
  syncTodos();
}