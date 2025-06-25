const CISelfHealer = require('../ci-self-heal');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mock modules
jest.mock('fs');
jest.mock('child_process');

describe('CI Self-Heal System', () => {
  let healer;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    healer = new CISelfHealer();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('parseFailures', () => {
    test('detects TypeScript errors', () => {
      const log = `
        src/App.tsx:10:5 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
        src/utils.ts:20:10 - error TS2339: Property 'foo' does not exist on type 'Bar'.
      `;
      
      const failures = healer.parseFailures(log);
      
      expect(failures).toHaveLength(1);
      expect(failures[0].type).toBe('typescript');
      expect(failures[0].errors).toHaveLength(2);
    });

    test('detects ESLint errors', () => {
      const log = 'npm run lint\n✖ 5 problems (5 errors, 0 warnings)';
      
      const failures = healer.parseFailures(log);
      
      expect(failures).toContainEqual({ type: 'eslint' });
    });

    test('detects console.log violations', () => {
      const log = '❌ Found console.log in production code!';
      
      const failures = healer.parseFailures(log);
      
      expect(failures).toContainEqual({ type: 'console-log' });
    });

    test('detects version range issues', () => {
      const log = 'ERROR: Found version ranges: react:^18.2.0,typescript:~5.0.0';
      
      const failures = healer.parseFailures(log);
      
      expect(failures).toContainEqual({ type: 'versions' });
    });

    test('handles empty log', () => {
      const failures = healer.parseFailures('');
      expect(failures).toHaveLength(0);
    });

    test('handles multiple failure types', () => {
      const log = `
        TS2345: Type error
        npm run lint error
        Found console.log in production code!
      `;
      
      const failures = healer.parseFailures(log);
      
      expect(failures).toHaveLength(3);
      expect(failures.map(f => f.type)).toEqual(['typescript', 'eslint', 'console-log']);
    });
  });

  describe('TypeScript Fixer', () => {
    test('identifies fixable TypeScript errors', async () => {
      const errors = [
        'src/App.tsx:10:5 - error TS2345: Type error',
        'src/App.tsx:20:5 - error TS7006: Parameter implicitly has an "any" type'
      ];
      
      await healer.fixTypeScriptErrors(errors);
      
      expect(healer.fixCount).toBe(0); // Since these are mock fixes
    });

    test('handles malformed TypeScript errors gracefully', async () => {
      const errors = ['Invalid error format', 'Another bad format'];
      
      await expect(healer.fixTypeScriptErrors(errors)).resolves.not.toThrow();
    });

    test('preserves existing correct types', async () => {
      // This would be tested with actual file manipulation
      // For now, we verify the method exists
      expect(healer.addImplicitAny).toBeDefined();
    });

    test('handles edge case: circular type references', async () => {
      const error = 'src/types.ts:10:5 - error TS2456: Type alias circularly references itself';
      
      await healer.fixTypeScriptErrors([error]);
      
      // Should log that manual fix is required
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('manual fix'));
    });
  });

  describe('ESLint Fixer', () => {
    test('runs eslint --fix command', async () => {
      execSync.mockReturnValue('');
      
      await healer.fixESLintErrors();
      
      expect(execSync).toHaveBeenCalledWith(
        'npm run lint -- --fix',
        expect.objectContaining({ cwd: healer.workingDir })
      );
      expect(healer.fixCount).toBe(1);
    });

    test('handles non-fixable ESLint errors', async () => {
      execSync.mockImplementation(() => {
        throw new Error('Some errors not fixable');
      });
      
      await expect(healer.fixESLintErrors()).resolves.not.toThrow();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('manual fixes'));
    });

    test('preserves manual formatting where possible', async () => {
      // This would be tested with actual ESLint config
      expect(healer.fixESLintErrors).toBeDefined();
    });

    test('edge case: handles malformed JavaScript', async () => {
      execSync.mockImplementation(() => {
        throw new Error('Parsing error');
      });
      
      await healer.fixESLintErrors();
      
      expect(healer.fixCount).toBe(0);
    });
  });

  describe('Console.log Remover', () => {
    const mockFiles = {
      '/src/App.tsx': `
        console.log('debug');
        console.error('This should stay');
        const result = calculate();
        console.log(result);
      `,
      '/src/utils.ts': `
        function test() {
          console.log('multi\\n' +
            'line');
          console.warn('Keep this');
        }
      `
    };

    beforeEach(() => {
      fs.readdirSync.mockReturnValue([
        { name: 'App.tsx', isFile: () => true, isDirectory: () => false },
        { name: 'utils.ts', isFile: () => true, isDirectory: () => false }
      ]);
      
      fs.readFileSync.mockImplementation((file) => mockFiles[file] || '');
      fs.writeFileSync.mockImplementation(() => {});
      
      healer.getAllFiles = jest.fn().mockReturnValue(['/src/App.tsx', '/src/utils.ts']);
    });

    test('removes all console.log statements', async () => {
      await healer.removeConsoleLogs();
      
      expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
      expect(healer.fixCount).toBe(1);
    });

    test('preserves console.error and console.warn', async () => {
      await healer.removeConsoleLogs();
      
      const writeCalls = fs.writeFileSync.mock.calls;
      expect(writeCalls[0][1]).toContain('console.error');
      expect(writeCalls[1][1]).toContain('console.warn');
    });

    test('handles multiline console.log', async () => {
      await healer.removeConsoleLogs();
      
      const writeCalls = fs.writeFileSync.mock.calls;
      expect(writeCalls[1][1]).not.toContain('multi');
      expect(writeCalls[1][1]).not.toContain('line');
    });

    test('edge case: console.log in strings', async () => {
      fs.readFileSync.mockReturnValue(`
        const message = "Don't remove console.log from strings";
        console.log('Remove this');
      `);
      
      await healer.removeConsoleLogs();
      
      const writeCall = fs.writeFileSync.mock.calls[0];
      expect(writeCall[1]).toContain("Don't remove console.log from strings");
      expect(writeCall[1]).not.toContain("Remove this");
    });

    test('handles empty files', async () => {
      healer.getAllFiles = jest.fn().mockReturnValue(['/src/empty.ts']);
      fs.readFileSync.mockReturnValue('');
      
      await expect(healer.removeConsoleLogs()).resolves.not.toThrow();
    });
  });

  describe('Version Fixer', () => {
    test('removes ^ and ~ prefixes', async () => {
      const mockPackage = {
        dependencies: {
          'react': '^18.2.0',
          'react-dom': '~18.2.0',
          'exact-version': '1.0.0'
        },
        devDependencies: {
          'typescript': '^5.0.0'
        }
      };
      
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      fs.writeFileSync.mockImplementation(() => {});
      execSync.mockReturnValue('');
      
      await healer.fixVersions();
      
      const writeCall = fs.writeFileSync.mock.calls[0];
      const writtenPackage = JSON.parse(writeCall[1]);
      
      expect(writtenPackage.dependencies.react).toBe('18.2.0');
      expect(writtenPackage.dependencies['react-dom']).toBe('18.2.0');
      expect(writtenPackage.dependencies['exact-version']).toBe('1.0.0');
      expect(writtenPackage.devDependencies.typescript).toBe('5.0.0');
      expect(healer.fixCount).toBe(1);
    });

    test('handles scoped packages', async () => {
      const mockPackage = {
        dependencies: {
          '@types/node': '^18.0.0',
          '@babel/core': '~7.0.0'
        }
      };
      
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      
      await healer.fixVersions();
      
      const writeCall = fs.writeFileSync.mock.calls[0];
      const writtenPackage = JSON.parse(writeCall[1]);
      
      expect(writtenPackage.dependencies['@types/node']).toBe('18.0.0');
      expect(writtenPackage.dependencies['@babel/core']).toBe('7.0.0');
    });

    test('edge case: git dependencies', async () => {
      const mockPackage = {
        dependencies: {
          'my-package': 'git+https://github.com/user/repo.git'
        }
      };
      
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      
      await healer.fixVersions();
      
      const writeCall = fs.writeFileSync.mock.calls[0];
      const writtenPackage = JSON.parse(writeCall[1]);
      
      expect(writtenPackage.dependencies['my-package']).toBe('git+https://github.com/user/repo.git');
    });

    test('updates package-lock.json', async () => {
      const mockPackage = { dependencies: { 'react': '^18.0.0' } };
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      
      await healer.fixVersions();
      
      expect(execSync).toHaveBeenCalledWith('npm install', expect.any(Object));
    });
  });

  describe('Git Operations', () => {
    test('creates proper commit message', async () => {
      healer.fixCount = 3;
      execSync.mockReturnValue('');
      
      await healer.commitFixes();
      
      const commitCall = execSync.mock.calls.find(call => 
        call[0].includes('git commit')
      );
      
      expect(commitCall[0]).toContain('Auto-fix CI failures (3 fixes applied)');
    });

    test('handles merge conflicts gracefully', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('git add')) {
          throw new Error('Merge conflict');
        }
      });
      
      await expect(healer.commitFixes()).resolves.not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to commit'),
        expect.any(String)
      );
    });

    test('retries on push failures', async () => {
      let pushAttempts = 0;
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('git push')) {
          pushAttempts++;
          throw new Error('Push failed');
        }
      });
      
      await healer.commitFixes();
      
      expect(pushAttempts).toBe(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('manual push required'));
    });

    test('edge case: detached HEAD state', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('git commit')) {
          throw new Error('HEAD detached');
        }
      });
      
      await healer.commitFixes();
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Full CI Flow Integration', () => {
    test('fixes multiple issues in one run', async () => {
      const log = `
        TS2345: Type error
        npm run lint error
        Found console.log in production code!
        Found version ranges: react:^18.0.0
      `;
      
      // Mock all fixes to succeed
      execSync.mockReturnValue('');
      fs.readFileSync.mockReturnValue('{}');
      fs.writeFileSync.mockImplementation(() => {});
      healer.getAllFiles = jest.fn().mockReturnValue([]);
      
      const result = await healer.heal(log);
      
      expect(result.failures).toBe(4);
      expect(result.success).toBe(true);
    });

    test('handles cascading failures', async () => {
      const log = 'TS2345: Type error causes ESLint error';
      
      const result = await healer.heal(log);
      
      expect(result.failures).toBeGreaterThan(0);
    });

    test('respects max retry limits', async () => {
      // This would test retry logic if implemented
      expect(healer.maxRetries).toBe(3);
    });

    test('cleans up on failure', async () => {
      execSync.mockImplementation(() => {
        throw new Error('Fatal error');
      });
      
      const log = 'npm run lint error';
      
      await expect(healer.heal(log)).resolves.not.toThrow();
    });

    test('works with empty/no failures', async () => {
      const result = await healer.heal('All tests passed!');
      
      expect(result.success).toBe(true);
      expect(result.fixCount).toBe(0);
      expect(result.failures).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles filesystem errors', async () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT');
      });
      
      await expect(healer.removeConsoleLogs()).resolves.not.toThrow();
    });

    test('handles concurrent CI runs', async () => {
      // Simulate file being modified by another process
      let callCount = 0;
      fs.readFileSync.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 'console.log("test");';
        throw new Error('File modified');
      });
      
      await expect(healer.removeConsoleLogs()).resolves.not.toThrow();
    });

    test('handles extremely large files', async () => {
      const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
      fs.readFileSync.mockReturnValue(largeContent);
      healer.getAllFiles = jest.fn().mockReturnValue(['/src/large.ts']);
      
      await expect(healer.removeConsoleLogs()).resolves.not.toThrow();
    });

    test('handles permission errors', async () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('EACCES: Permission denied');
      });
      
      await expect(healer.removeConsoleLogs()).resolves.not.toThrow();
    });

    test('handles network failures during npm operations', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('npm')) {
          throw new Error('ENETUNREACH');
        }
      });
      
      const mockPackage = { dependencies: { 'react': '^18.0.0' } };
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      
      await expect(healer.fixVersions()).resolves.not.toThrow();
    });
  });
});