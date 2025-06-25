#!/usr/bin/env node

/**
 * Display Todos - Backwards compatible wrapper
 * This script now uses the unified todo-manager.js
 */

const { execSync } = require('child_process');
const path = require('path');

// Get the todo-manager path
const todoManagerPath = path.join(__dirname, 'todo-manager.js');

async function displayTodos() {
  // Pass through to todo-manager display command
  try {
    const args = process.argv.slice(2);
    if (args.length > 0) {
      execSync(`node "${todoManagerPath}" display '${args[0]}'`, { stdio: 'inherit' });
    } else {
      execSync(`node "${todoManagerPath}" display`, { stdio: 'inherit' });
    }
  } catch (error) {
    process.exit(1);
  }
}

// Helper function for Claude to use
function getDisplayCommand(todos) {
  const todosJson = JSON.stringify(todos);
  return `echo '${todosJson}' | node scripts/todo-manager.js display`;
}

// Export for use in other scripts
module.exports = { displayTodos, getDisplayCommand };

// Run if called directly
if (require.main === module) {
  displayTodos();
}