#!/usr/bin/env node
/**
 * Test memory integration with real agent
 */

import fetch from 'node-fetch';

const agentId = 'agent-1eacfc07-d8b6-4f25-a6ee-aab71934e07a';
const baseUrl = 'http://127.0.0.1:3456';

async function testWithRealAgent() {
  console.log(`Testing with agent: ${agentId}\n`);
  
  try {
    // Send an async request to Claude Code
    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'claude_code',
          arguments: {
            prompt: 'List the files in /opt/stacks/claude-code-mcp/src and tell me what each one does',
            workFolder: '/opt/stacks/claude-code-mcp',
            agentId: agentId
          }
        }
      })
    });
    
    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    
    // Wait a moment for the task to start
    console.log('\nWaiting 2 seconds for task to start...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check memory status
    console.log('\nChecking memory status...');
    const memoryUrl = `https://letta2.oculair.ca/v1/agents/${agentId}/core-memory/blocks/claude_code_status`;
    const memoryResponse = await fetch(memoryUrl, {
      headers: {
        'Authorization': 'Bearer lettaSecurePass123',
        'X-BARE-PASSWORD': 'password lettaSecurePass123'
      }
    });
    
    if (memoryResponse.ok) {
      const memoryBlock = await memoryResponse.json();
      console.log('Memory block found:', JSON.stringify(memoryBlock, null, 2));
    } else {
      console.log('Memory block not found or error:', memoryResponse.status);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testWithRealAgent();