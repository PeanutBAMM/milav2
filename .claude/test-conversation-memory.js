#!/usr/bin/env node

/**
 * Test Conversation Memory Feature
 * Demonstrates saving and retrieving conversation history
 */

const SimpleDocsRAG = require('./simple-rag');

async function testConversationMemory() {
  console.log('🧪 Testing Conversation Memory Feature\n');
  
  // Initialize RAG
  const rag = new SimpleDocsRAG();
  await rag.initialize();
  
  // Current conversation summary
  const currentConversation = {
    summary: `Implemented local RAG system with Supabase backup for private documentation. 
User (Maatje) wanted to continue from biometric auth but clarified it was a test feature to remove. 
Fixed documentation XML validation issues, calculated 589 hours/year performance savings. 
User revealed organization name "Apex Minds AI" and requested docs stay completely private (not on GitHub). 
Implemented simple local RAG with <10ms search, tar-based backup system, and CI/CD exclusions.`,
    
    keyTopics: [
      'Local RAG implementation',
      'Documentation privacy (no GitHub)',
      'XML validation fixes',
      'Performance optimization (96.7% faster)',
      'Supabase backup system',
      'CI/CD configuration',
      'Apex Minds AI organization',
      'Biometric auth removal'
    ],
    
    filesModified: [
      '.claude/simple-rag.js',
      'scripts/backup-docs-to-supabase.js',
      '.github/workflows/pr-docs-backup.yml',
      '.github/ci-exclude.yml',
      'docs/general/development/agent-usage-guidelines.md',
      'docs/general/development/documentation-standards.md'
    ],
    
    nextSteps: [
      'Integrate actual Supabase credentials',
      'Add RAG to Claude startup routine',
      'Create team documentation for RAG usage',
      'Remove biometric auth test feature',
      'Setup organization rename to Apex Minds AI'
    ]
  };
  
  // Save the conversation
  console.log('💾 Saving current conversation...');
  const saved = await rag.saveConversation(currentConversation);
  console.log('✅ Conversation saved:', saved.timestamp);
  
  // Test retrieval
  console.log('\n🔍 Testing startup context retrieval...');
  const context = rag.getStartupContext();
  
  if (context) {
    console.log('\n📋 Startup Context Retrieved:');
    console.log('\nLast Session:', context.lastSession.timestamp);
    console.log('Summary:', context.lastSession.summary.substring(0, 100) + '...');
    console.log('\nRecent Topics:', context.recentTopics);
    console.log('\nSuggested Next Steps:', context.suggestedNextSteps);
  } else {
    console.log('❌ No context found');
  }
  
  // Add a second conversation to test FIFO
  console.log('\n💾 Adding second test conversation...');
  await rag.saveConversation({
    summary: 'Test conversation 2 - Testing FIFO behavior',
    keyTopics: ['Testing', 'FIFO memory'],
    filesModified: ['test.js'],
    nextSteps: ['Verify FIFO works']
  });
  
  // Add a third
  console.log('💾 Adding third test conversation...');
  await rag.saveConversation({
    summary: 'Test conversation 3 - Should maintain last 3',
    keyTopics: ['Memory limit', 'Three conversations'],
    filesModified: ['memory.js'],
    nextSteps: ['Check memory limit']
  });
  
  // Check memory count
  console.log(`\n📊 Total conversations in memory: ${rag.conversationMemory.length}`);
  console.log('Conversation timestamps:');
  rag.conversationMemory.forEach((conv, i) => {
    console.log(`  ${i + 1}. ${conv.timestamp} - ${conv.summary.substring(0, 50)}...`);
  });
  
  // Test what happens with a 4th conversation (should remove oldest)
  console.log('\n💾 Adding fourth conversation (testing FIFO)...');
  await rag.saveConversation({
    summary: 'Test conversation 4 - This should remove the first one',
    keyTopics: ['FIFO test', 'Memory rotation'],
    filesModified: ['fifo.js'],
    nextSteps: ['Confirm oldest removed']
  });
  
  console.log(`\n📊 After FIFO rotation: ${rag.conversationMemory.length} conversations`);
  console.log('Remaining conversations:');
  rag.conversationMemory.forEach((conv, i) => {
    console.log(`  ${i + 1}. ${conv.timestamp} - ${conv.summary.substring(0, 50)}...`);
  });
  
  // Final context check
  const finalContext = rag.getStartupContext();
  console.log('\n🎯 Final startup context:');
  console.log('Recent topics:', finalContext.recentTopics.slice(0, 5));
  console.log('Latest next steps:', finalContext.suggestedNextSteps);
  
  console.log('\n✅ Conversation memory test complete!');
}

// Run the test
testConversationMemory().catch(console.error);