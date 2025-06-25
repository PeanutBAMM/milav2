// Jest setup file
// Configure test environment

// Suppress console output during tests unless debugging
if (!process.env.DEBUG) {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
}

// Global test utilities
global.testUtils = {
  // Create mock CI log
  createMockLog: (errors = []) => {
    return errors.join('\n');
  },
  
  // Create mock file system
  createMockFS: () => {
    const files = new Map();
    return {
      readFileSync: jest.fn((path) => files.get(path) || ''),
      writeFileSync: jest.fn((path, content) => files.set(path, content)),
      existsSync: jest.fn((path) => files.has(path)),
      _files: files
    };
  }
};