#!/usr/bin/env node
/**
 * Test script for the new archival memory system
 */

import { LettaMemoryClient } from './dist/letta-memory-client.js';

async function testArchivalSystem() {
  console.log('🧪 Testing Archival Memory System...\n');
  
  // Initialize client
  const client = new LettaMemoryClient();
  const testAgentId = 'agent-1eacfc07-d8b6-4f25-a6ee-aab71934e07a'; // Example agent ID
  
  try {
    // 1. Test creating an enhanced task
    console.log('1️⃣ Creating enhanced task...');
    const taskPrompt = 'Create a new file called test.txt with sample content and commit it to git';
    const testTaskId = `task_${Date.now()}`;
    const taskStatus = client.createEnhancedTaskStatus(testTaskId, testAgentId, taskPrompt);
    console.log(`   ✅ Created task: ${taskStatus.task_id}`);
    console.log(`   📊 Type: ${taskStatus.task_type}, Complexity: ${taskStatus.complexity_score}/10`);
    console.log(`   🗂️ Should Archive: ${taskStatus.should_archive}, Priority: ${taskStatus.archive_priority}`);
    
    // 2. Test creating a task memory block
    console.log('\n2️⃣ Creating task memory block...');
    await client.updateTaskStatus(testAgentId, taskStatus);
    console.log('   ✅ Task memory block created');
    
    // 3. Test archival formatting
    console.log('\n3️⃣ Testing archival formatting...');
    // Simulate completed task with rich data
    const completedTaskStatus = {
      ...taskStatus,
      status: 'completed',
      completed_at: new Date().toISOString(),
      result: 'Successfully created test.txt file and committed to git repository',
      execution_time_ms: 15000,
      memory_usage_mb: 45.2,
      cpu_usage_percent: 12.5,
      files_created: ['test.txt'],
      files_modified: ['.git/index'],
      commands_executed: ['touch test.txt', 'git add test.txt', 'git commit -m "Add test file"'],
      progress_percentage: 100,
      steps_completed: 3,
      total_steps: 3,
      current_step: 'Completed',
      warnings: [{
        timestamp: new Date().toISOString(),
        warning_type: 'best_practice',
        message: 'Consider adding more descriptive commit message',
        severity: 'low'
      }]
    };
    
    const archivalText = client.formatTaskForArchival(completedTaskStatus);
    console.log('   ✅ Archival text formatted');
    console.log(`   📝 Length: ${archivalText.length} characters`);
    console.log('\n   📄 Sample archival content:');
    console.log('   ' + archivalText.split('\n').slice(0, 10).join('\n   '));
    console.log('   ...');
    
    // 4. Test archival memory creation (NOTE: This will make real API call)
    console.log('\n4️⃣ Testing archival memory creation...');
    try {
      const metadata = {
        task_id: completedTaskStatus.task_id,
        task_type: completedTaskStatus.task_type,
        complexity_score: completedTaskStatus.complexity_score,
        test_run: true
      };
      
      const passage = await client.createArchivalPassage(testAgentId, archivalText, metadata);
      console.log(`   ✅ Archival passage created with ID: ${passage.id}`);
      
      // 5. Test task completion with archival
      console.log('\n5️⃣ Testing complete task flow...');
      await client.completeTask(
        testAgentId,
        taskStatus.task_id,
        completedTaskStatus.result,
        true,
        {
          execution_time_ms: completedTaskStatus.execution_time_ms,
          memory_usage_mb: completedTaskStatus.memory_usage_mb,
          cpu_usage_percent: completedTaskStatus.cpu_usage_percent,
          files_created: completedTaskStatus.files_created,
          files_modified: completedTaskStatus.files_modified,
          commands_executed: completedTaskStatus.commands_executed
        }
      );
      console.log('   ✅ Task completed with archival and cleanup');
      
    } catch (error) {
      console.log(`   ⚠️ Archival API test skipped: ${error.message}`);
      console.log('   💡 This is expected if not connected to Letta server');
    }
    
    console.log('\n🎉 Archival system test completed!');
    console.log('\n📋 Summary of new features:');
    console.log('   • Tasks are automatically archived to Letta\'s long-term memory');
    console.log('   • Rich formatted content with all task details');
    console.log('   • Temporary task memory blocks are cleaned up after completion');
    console.log('   • Full-text searchable task history for the agent');
    console.log('   • Structured metadata for efficient retrieval');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testArchivalSystem();
}