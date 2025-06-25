#!/usr/bin/env node

/**
 * Setup Branch Protection Rules
 * Configures GitHub branch protection for the main branch
 */

const { execSync } = require('child_process');

async function setupBranchProtection() {
  console.log('🛡️  Setting up branch protection for main branch...\n');

  const owner = 'PeanutBAMM';
  const repo = 'milav2';
  const branch = 'main';

  // Branch protection settings
  const protection = {
    // Required status checks
    required_status_checks: {
      strict: true, // Require branches to be up to date before merging
      contexts: [
        'check',        // CI Checks must pass
        'backup-docs'   // Documentation backup (after we fix permissions)
      ]
    },
    
    // Enforce admins
    enforce_admins: false, // Allow admins to merge in emergencies
    
    // Required pull request reviews
    required_pull_request_reviews: {
      required_approving_review_count: 1,
      dismiss_stale_reviews: true,
      require_code_owner_reviews: false,
      require_last_push_approval: false
    },
    
    // Restrictions
    restrictions: null, // No restrictions on who can push
    
    // Other settings
    allow_force_pushes: false,
    allow_deletions: false,
    block_creations: false,
    required_conversation_resolution: true,
    lock_branch: false,
    allow_fork_syncing: true
  };

  try {
    // Create the protection rules
    console.log('📝 Creating protection rules...');
    
    const command = `gh api -X PUT repos/${owner}/${repo}/branches/${branch}/protection \
      --input - << 'EOF'
${JSON.stringify(protection, null, 2)}
EOF`;

    execSync(command, { stdio: 'inherit' });
    
    console.log('\n✅ Branch protection enabled successfully!\n');
    
    // Verify the settings
    console.log('🔍 Verifying settings...\n');
    
    const verifyCommand = `gh api repos/${owner}/${repo}/branches/${branch}/protection`;
    const result = execSync(verifyCommand, { encoding: 'utf8' });
    const settings = JSON.parse(result);
    
    console.log('Current protection settings:');
    console.log('- Required status checks:', settings.required_status_checks.contexts);
    console.log('- Require up-to-date branches:', settings.required_status_checks.strict);
    console.log('- Required reviews:', settings.required_pull_request_reviews?.required_approving_review_count || 0);
    console.log('- Dismiss stale reviews:', settings.required_pull_request_reviews?.dismiss_stale_reviews || false);
    console.log('- Enforce for admins:', settings.enforce_admins.enabled);
    console.log('- Allow force pushes:', settings.allow_force_pushes.enabled);
    
    console.log('\n🎉 Branch protection is now active!');
    console.log('\nNext steps:');
    console.log('1. Fix the PR documentation backup workflow permissions');
    console.log('2. All future PRs will require passing CI checks');
    console.log('3. PRs will need at least 1 approval before merging');
    
  } catch (error) {
    console.error('\n❌ Failed to set up branch protection:');
    console.error(error.message);
    
    if (error.message.includes('403')) {
      console.error('\n⚠️  You may need admin permissions to set branch protection rules.');
      console.error('Please check your GitHub permissions or ask an admin to run this script.');
    }
    
    process.exit(1);
  }
}

// Add option to remove protection (for testing)
if (process.argv[2] === '--remove') {
  console.log('🗑️  Removing branch protection...');
  
  try {
    execSync('gh api -X DELETE repos/PeanutBAMM/milav2/branches/main/protection', { stdio: 'inherit' });
    console.log('✅ Branch protection removed');
  } catch (error) {
    console.error('❌ Failed to remove protection:', error.message);
  }
  
  process.exit(0);
}

// Run the setup
setupBranchProtection();