#!/usr/bin/env node

import { LettaMemoryClient } from './dist/letta-memory-client.js';
import { randomUUID } from 'crypto';

const agentId = 'agent-1eacfc07-d8b6-4f25-a6ee-aab71934e07a';
const client = new LettaMemoryClient();

async function testMemoryBlocks() {
  console.log('Testing memory block functionality...\n');
  
  try {
    // Create a test task status
    const taskId = randomUUID();
    const status = {
      task_id: taskId,
      agent_id: agentId,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      progress: 'Testing memory blocks',
      steps_completed: 1,
      total_steps: 3,
      current_step: 'Creating test block',
      prompt: 'Test memory block creation',
      working_directory: '/opt/stacks/claude-code-mcp',
      errors: []
    };
    
    console.log(`Creating task block for task ${taskId}...`);
    await client.updateTaskStatus(agentId, status);
    console.log('✓ Task block created and attached\n');
    
    // Update status to completed
    status.status = 'completed';
    status.steps_completed = 3;
    status.current_step = 'Task completed';
    status.result = 'Memory blocks working correctly';
    status.updated_at = new Date().toISOString();
    
    console.log('Updating task to completed...');
    await client.updateTaskStatus(agentId, status);
    console.log('✓ Task status updated\n');
    
    // List all blocks
    console.log('Listing all memory blocks for agent...');
    const blocks = await client.listMemoryBlocks(agentId);
    const taskBlocks = blocks.filter(b => b.label?.startsWith('claude_task_'));
    console.log(`Found ${taskBlocks.length} task blocks:`);
    taskBlocks.forEach(block => {
      console.log(`  - ${block.label} (${block.metadata?.status || 'unknown'})`);
    });
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testMemoryBlocks();