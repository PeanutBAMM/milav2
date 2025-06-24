// Global configuration for Apps workspace
// This file is loaded before any other scripts

// Increase MaxListeners limit to prevent warnings with multiple async operations
if (typeof process !== 'undefined' && process.setMaxListeners) {
  process.setMaxListeners(20);
}

// Set for Node.js EventEmitter
if (typeof require !== 'undefined') {
  try {
    const events = require('events');
    events.EventEmitter.defaultMaxListeners = 20;
  } catch (e) {
    // EventEmitter not available in this environment
  }
}

// Export for use in other scripts
module.exports = {
  maxListeners: 20
};