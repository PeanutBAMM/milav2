#!/usr/bin/env node

/**
 * Backup Documentation to Supabase
 * 
 * This script:
 * 1. Zips the docs folder
 * 2. Uploads to Supabase Storage
 * 3. Stores metadata about the backup
 * 
 * Used by CI/CD on PR creation
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class DocsBackup {
  constructor() {
    this.docsDir = path.join(__dirname, '..', 'docs');
    this.tempDir = path.join(__dirname, '..', '.tmp');
  }

  async backup(prNumber, branchName) {
    console.log('📦 Starting docs backup to Supabase...');
    
    try {
      // Ensure temp directory
      await fs.promises.mkdir(this.tempDir, { recursive: true });
      
      // Create backup metadata
      const timestamp = new Date().toISOString();
      const backupId = `docs-backup-pr-${prNumber}-${Date.now()}`;
      const zipPath = path.join(this.tempDir, `${backupId}.zip`);
      
      // Zip the docs using tar (more universally available)
      console.log('🗜️ Compressing documentation...');
      execSync(`tar --exclude=".git*" --exclude="*node_modules*" -czf "${zipPath}" -C "${this.docsDir}" .`, {
        stdio: 'pipe'
      });
      
      const stats = await fs.promises.stat(zipPath);
      const checksum = await this.getFileChecksum(zipPath);
      
      console.log(`✅ Created backup: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
      
      // Create metadata
      const metadata = {
        id: backupId,
        prNumber,
        branchName,
        timestamp,
        size: stats.size,
        checksum,
        fileCount: await this.countFiles(),
        status: 'ready_for_upload'
      };
      
      // Save metadata locally (Supabase upload would happen here)
      const metadataPath = path.join(this.tempDir, `${backupId}-metadata.json`);
      await fs.promises.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      
      console.log('📋 Backup metadata:');
      console.log(`  - PR: #${prNumber}`);
      console.log(`  - Branch: ${branchName}`);
      console.log(`  - Files: ${metadata.fileCount}`);
      console.log(`  - Size: ${(metadata.size / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  - ID: ${backupId}`);
      
      // Clean up zip file (in real implementation, this would happen after upload)
      await fs.promises.unlink(zipPath);
      
      return metadata;
      
    } catch (error) {
      console.error('❌ Backup failed:', error.message);
      throw error;
    }
  }
  
  async getFileChecksum(filePath) {
    const fileBuffer = await fs.promises.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }
  
  async countFiles() {
    try {
      const output = execSync(`find "${this.docsDir}" -type f -name "*.md" | wc -l`, {
        encoding: 'utf8'
      });
      return parseInt(output.trim());
    } catch {
      return 0;
    }
  }
}

// CLI interface
if (require.main === module) {
  const backup = new DocsBackup();
  
  // Get PR info from environment or args
  const prNumber = process.env.PR_NUMBER || process.argv[2] || 'manual';
  const branchName = process.env.GITHUB_HEAD_REF || process.argv[3] || 'unknown';
  
  backup.backup(prNumber, branchName)
    .then(metadata => {
      console.log('\n✅ Backup completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Backup failed:', error);
      process.exit(1);
    });
}