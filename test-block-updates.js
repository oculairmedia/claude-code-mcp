#!/usr/bin/env node

import { LettaMemoryClient } from './dist/letta-memory-client.js';
import { randomUUID } from 'crypto';

const agentId = 'agent-1eacfc07-d8b6-4f25-a6ee-aab71934e07a';
const client = new LettaMemoryClient();

async function testBlockUpdates() {
  console.log('Testing memory block update functionality...\n');
  
  try {
    const taskId = randomUUID();
    
    // Initial status: pending
    const pendingStatus = {
      task_id: taskId,
      agent_id: agentId,
      status: 'pending',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      progress: 'Task queued for processing',
      steps_completed: 0,
      total_steps: 3,
      current_step: 'Waiting to start',
      prompt: 'Test block update functionality',
      working_directory: '/tmp',
      errors: []
    };
    
    console.log(`Creating initial block for task ${taskId} (pending)...`);
    await client.updateTaskStatus(agentId, pendingStatus);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    // Update to in_progress
    const inProgressStatus = {
      ...pendingStatus,
      status: 'in_progress',
      updated_at: new Date().toISOString(),
      progress: 'Processing task',
      steps_completed: 1,
      current_step: 'Executing commands'
    };
    
    console.log('Updating block to in_progress...');
    await client.updateTaskStatus(agentId, inProgressStatus);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    // Update to completed
    const completedStatus = {
      ...inProgressStatus,
      status: 'completed',
      updated_at: new Date().toISOString(),
      progress: 'Task completed successfully',
      steps_completed: 3,
      current_step: 'Finished',
      result: 'Successfully tested block updates'
    };
    
    console.log('Updating block to completed...');
    await client.updateTaskStatus(agentId, completedStatus);
    
    // Check the final block
    console.log('\nFetching final block state...');
    const blocks = await client.listMemoryBlocks(agentId);
    const taskBlock = blocks.find(b => b.label === `claude_task_${taskId}`);
    
    if (taskBlock) {
      console.log(`\nFinal block state:`);
      console.log(`  ID: ${taskBlock.id}`);
      console.log(`  Label: ${taskBlock.label}`);
      console.log(`  Description: ${taskBlock.description}`);
      console.log(`  Metadata status: ${taskBlock.metadata?.status}`);
      console.log(`  Metadata updated_at: ${taskBlock.metadata?.updated_at}`);
      
      // Parse and display the value
      const value = typeof taskBlock.value === 'string' ? JSON.parse(taskBlock.value) : taskBlock.value;
      console.log(`  Value status: ${value.status}`);
      console.log(`  Value progress: ${value.progress}`);
      console.log(`  Value steps: ${value.steps_completed}/${value.total_steps}`);
    } else {
      console.log('❌ Task block not found!');
    }
    
    console.log('\n✅ Test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testBlockUpdates();