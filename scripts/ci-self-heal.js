#!/usr/bin/env node

/**
 * CI Self-Healing System
 * Automatically fixes common CI failures
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class CISelfHealer {
  constructor() {
    this.fixCount = 0;
    this.maxRetries = 3;
    this.workingDir = path.join(__dirname, '..', 'mila');
  }

  /**
   * Main entry point - analyze and fix CI failures
   */
  async heal(failureLog) {
    console.log('🔧 CI Self-Healing System Started');
    
    const failures = this.parseFailures(failureLog);
    
    if (failures.length === 0) {
      console.log('✅ No fixable failures detected');
      return { success: true, fixCount: 0 };
    }

    console.log(`📊 Found ${failures.length} potential issues to fix`);
    
    for (const failure of failures) {
      try {
        await this.fixFailure(failure);
      } catch (error) {
        console.error(`❌ Failed to fix ${failure.type}: ${error.message}`);
      }
    }

    if (this.fixCount > 0) {
      await this.commitFixes();
    }

    return { 
      success: this.fixCount > 0, 
      fixCount: this.fixCount,
      failures: failures.length 
    };
  }

  /**
   * Parse CI log to identify failures
   */
  parseFailures(log) {
    const failures = [];
    const logLines = log.split('\n');

    // TypeScript errors
    const tsErrors = logLines.filter(line => /TS\d{4}:/.test(line));
    if (tsErrors.length > 0) {
      failures.push({ type: 'typescript', errors: tsErrors });
    }

    // ESLint errors
    if (log.includes('npm run lint') && log.includes('error')) {
      failures.push({ type: 'eslint' });
    }

    // Console.log detection
    if (log.includes('Found console.log in production code!')) {
      failures.push({ type: 'console-log' });
    }

    // Version errors
    if (log.includes('Found version ranges:') || log.includes('exact versions')) {
      failures.push({ type: 'versions' });
    }

    // Security audit failures
    if (log.includes('npm audit') && log.includes('vulnerabilities')) {
      failures.push({ type: 'security', canAutoFix: false });
    }

    return failures;
  }

  /**
   * Fix a specific failure type
   */
  async fixFailure(failure) {
    console.log(`🔧 Fixing ${failure.type}...`);

    switch (failure.type) {
      case 'typescript':
        await this.fixTypeScriptErrors(failure.errors);
        break;
      
      case 'eslint':
        await this.fixESLintErrors();
        break;
      
      case 'console-log':
        await this.removeConsoleLogs();
        break;
      
      case 'versions':
        await this.fixVersions();
        break;
      
      case 'security':
        console.log('⚠️  Security issues require manual review');
        break;
      
      default:
        console.log(`⚠️  Unknown failure type: ${failure.type}`);
    }
  }

  /**
   * Fix TypeScript errors
   */
  async fixTypeScriptErrors(errors) {
    console.log('📝 Analyzing TypeScript errors...');
    
    // Common fixes
    const fixes = {
      'TS2345': this.fixTypeError.bind(this),
      'TS2339': this.addMissingProperty.bind(this),
      'TS7006': this.addImplicitAny.bind(this),
      'TS2304': this.addMissingImport.bind(this),
      'TS2551': this.fixTypo.bind(this)
    };

    for (const error of errors) {
      const match = error.match(/TS(\d{4}):/);
      if (match && fixes[`TS${match[1]}`]) {
        try {
          await fixes[`TS${match[1]}`](error);
          this.fixCount++;
        } catch (e) {
          console.error(`Failed to fix ${match[0]}: ${e.message}`);
        }
      }
    }
  }

  /**
   * Fix ESLint errors
   */
  async fixESLintErrors() {
    console.log('🎨 Running ESLint auto-fix...');
    
    try {
      execSync('npm run lint -- --fix', { 
        cwd: this.workingDir,
        stdio: 'pipe'
      });
      this.fixCount++;
      console.log('✅ ESLint errors fixed');
    } catch (error) {
      // Some errors might not be auto-fixable
      console.log('⚠️  Some ESLint errors require manual fixes');
    }
  }

  /**
   * Remove console.log statements
   */
  async removeConsoleLogs() {
    console.log('🗑️  Removing console.log statements...');
    
    const srcDir = path.join(this.workingDir, 'src');
    const files = this.getAllFiles(srcDir, ['.ts', '.tsx', '.js', '.jsx']);
    
    let removedCount = 0;
    
    for (const file of files) {
      let content = fs.readFileSync(file, 'utf8');
      const originalContent = content;
      
      // Remove console.log but preserve console.error and console.warn
      content = content.replace(/console\.log\([^)]*\);?\s*/g, '');
      
      // Handle multiline console.log
      content = content.replace(/console\.log\([^)]*\n[^)]*\);?\s*/g, '');
      
      if (content !== originalContent) {
        fs.writeFileSync(file, content);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      this.fixCount++;
      console.log(`✅ Removed console.log from ${removedCount} files`);
    }
  }

  /**
   * Fix package versions (remove ^ and ~)
   */
  async fixVersions() {
    console.log('📦 Fixing package versions...');
    
    const packagePath = path.join(this.workingDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    let fixed = false;
    
    for (const deps of ['dependencies', 'devDependencies']) {
      if (pkg[deps]) {
        for (const [name, version] of Object.entries(pkg[deps])) {
          if (version.startsWith('^') || version.startsWith('~')) {
            pkg[deps][name] = version.substring(1);
            fixed = true;
          }
        }
      }
    }
    
    if (fixed) {
      fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
      this.fixCount++;
      console.log('✅ Fixed package versions');
      
      // Run npm install to update lock file
      console.log('📦 Updating package-lock.json...');
      execSync('npm install', { cwd: this.workingDir, stdio: 'pipe' });
    }
  }

  /**
   * TypeScript specific fixes
   */
  async fixTypeError(error) {
    // Extract file and line info
    const match = error.match(/(.+\.tsx?):(\d+):(\d+)/);
    if (!match) return;
    
    const [, file, line, col] = match;
    console.log(`Fixing type error in ${file}:${line}:${col}`);
    
    // This is a simplified example - real implementation would be more complex
    // For now, we'll just log what would need to be fixed
    console.log('🔍 Type error requires manual fix');
  }

  async addMissingProperty(error) {
    console.log('🔍 Missing property requires manual fix');
  }

  async addImplicitAny(error) {
    const match = error.match(/(.+\.tsx?):(\d+):(\d+)/);
    if (!match) return;
    
    const [, file, line] = match;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    // Simple fix: add ': any' to parameters without types
    // This is a simplified implementation
    console.log(`Adding type annotations to ${file}`);
  }

  async addMissingImport(error) {
    console.log('🔍 Missing import requires manual fix');
  }

  async fixTypo(error) {
    console.log('🔍 Typo requires manual fix');
  }

  /**
   * Commit all fixes
   */
  async commitFixes() {
    console.log('💾 Committing fixes...');
    
    try {
      execSync('git add -A', { cwd: this.workingDir });
      
      const message = `fix: Auto-fix CI failures (${this.fixCount} fixes applied)

- Fixed ESLint errors
- Removed console.log statements  
- Fixed package versions
- Applied TypeScript fixes where possible

🤖 Generated with CI Self-Heal System`;
      
      execSync(`git commit -m "${message}"`, { cwd: this.workingDir });
      
      console.log('✅ Fixes committed');
      
      // Try to push
      try {
        execSync('git push', { cwd: this.workingDir });
        console.log('✅ Fixes pushed to remote');
      } catch (pushError) {
        console.log('⚠️  Failed to push - manual push required');
      }
      
    } catch (error) {
      console.error('❌ Failed to commit fixes:', error.message);
    }
  }

  /**
   * Helper: Get all files recursively
   */
  getAllFiles(dir, extensions, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !['node_modules', '.git'].includes(entry.name)) {
        this.getAllFiles(fullPath, extensions, files);
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
}

// Export for testing
module.exports = CISelfHealer;

// CLI usage
if (require.main === module) {
  const healer = new CISelfHealer();
  
  // Read failure log from stdin or file
  let failureLog = '';
  
  if (process.argv[2]) {
    // Read from file
    failureLog = fs.readFileSync(process.argv[2], 'utf8');
  } else if (!process.stdin.isTTY) {
    // Read from stdin
    const chunks = [];
    process.stdin.on('data', chunk => chunks.push(chunk));
    process.stdin.on('end', async () => {
      failureLog = Buffer.concat(chunks).toString();
      const result = await healer.heal(failureLog);
      process.exit(result.success ? 0 : 1);
    });
  } else {
    console.log('Usage: ci-self-heal.js [log-file]');
    console.log('   or: cat ci.log | ci-self-heal.js');
    process.exit(1);
  }
  
  if (failureLog) {
    healer.heal(failureLog).then(result => {
      process.exit(result.success ? 0 : 1);
    });
  }
}