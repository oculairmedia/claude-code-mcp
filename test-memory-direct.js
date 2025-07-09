#!/usr/bin/env node
/**
 * Direct test of memory block creation
 */

import { LettaMemoryClient } from './dist/letta-memory-client.js';
import { randomUUID } from 'crypto';

const agentId = 'agent-1eacfc07-d8b6-4f25-a6ee-aab71934e07a';

async function testMemoryDirect() {
  console.log('Testing memory block creation directly...\n');
  
  const memoryClient = new LettaMemoryClient();
  const taskId = randomUUID();
  const startTime = new Date();
  
  // Create a test task status
  const taskStatus = {
    task_id: taskId,
    agent_id: agentId,
    status: 'in_progress',
    started_at: startTime.toISOString(),
    updated_at: startTime.toISOString(),
    estimated_completion: memoryClient.calculateEstimatedCompletion('Test task', startTime).toISOString(),
    progress: 'Testing memory block creation',
    steps_completed: 1,
    total_steps: 2,
    current_step: 'Creating memory blocks',
    prompt: 'Test memory block functionality',
    working_directory: '/opt/stacks/claude-code-mcp',
    errors: [],
    result: undefined
  };
  
  try {
    console.log(`Creating task status for task ${taskId}...`);
    await memoryClient.updateTaskStatus(agentId, taskStatus);
    console.log('✓ Task status created\n');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update to completed
    taskStatus.status = 'completed';
    taskStatus.updated_at = new Date().toISOString();
    taskStatus.progress = 'Task completed successfully';
    taskStatus.current_step = 'Completed';
    taskStatus.steps_completed = 2;
    taskStatus.result = 'Memory blocks successfully created and updated';
    
    console.log('Updating task to completed...');
    await memoryClient.updateTaskStatus(agentId, taskStatus);
    console.log('✓ Task marked as completed\n');
    
    console.log('✅ Test completed successfully!');
    console.log('\nNow check the memory blocks with: ./check-memory-blocks.sh');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testMemoryDirect();