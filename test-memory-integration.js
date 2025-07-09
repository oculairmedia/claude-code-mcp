#!/usr/bin/env node
/**
 * Test script to verify memory block integration
 */

import { LettaMemoryClient } from './dist/letta-memory-client.js';

const testAgentId = 'test-agent-' + Date.now();

async function testMemoryIntegration() {
  console.log('Testing memory block integration...\n');
  
  const memoryClient = new LettaMemoryClient();
  
  // Create a test task status
  const taskStatus = {
    task_id: 'test-task-123',
    agent_id: testAgentId,
    status: 'in_progress',
    started_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    estimated_completion: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    progress: 'Running test task',
    steps_completed: 1,
    total_steps: 3,
    current_step: 'Testing memory integration',
    prompt: 'Test the memory block functionality',
    working_directory: '/opt/stacks/claude-code-mcp',
    errors: [],
    result: undefined
  };
  
  try {
    // Test 1: Update task status
    console.log('Test 1: Updating task status...');
    await memoryClient.updateTaskStatus(testAgentId, taskStatus);
    console.log('✓ Task status updated successfully\n');
    
    // Test 2: Get memory block
    console.log('Test 2: Reading memory block...');
    const block = await memoryClient.getMemoryBlock(testAgentId, 'claude_code_status');
    if (block) {
      console.log('✓ Memory block retrieved:');
      console.log(JSON.stringify(block, null, 2));
    } else {
      console.log('✗ Memory block not found');
    }
    
    // Test 3: Update with completion
    console.log('\nTest 3: Updating task to completed...');
    taskStatus.status = 'completed';
    taskStatus.updated_at = new Date().toISOString();
    taskStatus.progress = 'Task completed successfully';
    taskStatus.current_step = 'Completed';
    taskStatus.steps_completed = 3;
    taskStatus.result = 'Test completed successfully!';
    
    await memoryClient.updateTaskStatus(testAgentId, taskStatus);
    console.log('✓ Task marked as completed\n');
    
    // Test 4: Check history
    console.log('Test 4: Checking task history...');
    const historyBlock = await memoryClient.getMemoryBlock(testAgentId, 'claude_code_history');
    if (historyBlock) {
      console.log('✓ History block found');
    } else {
      console.log('✗ History block not found');
    }
    
    // Test 5: Log an error
    console.log('\nTest 5: Logging an error...');
    await memoryClient.logError(testAgentId, 'test-task-123', 'This is a test error');
    console.log('✓ Error logged successfully');
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testMemoryIntegration();