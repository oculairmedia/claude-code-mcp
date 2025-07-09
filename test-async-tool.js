#!/usr/bin/env node

import fetch from 'node-fetch';

async function testAsyncTool() {
  const mcpUrl = 'http://192.168.50.90:3456/mcp';
  
  try {
    // 1. Initialize session
    console.log('1. Initializing MCP session...');
    const initResponse = await fetch(mcpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-async-client',
            version: '1.0.0'
          }
        },
        id: 1
      })
    });
    
    const initResult = await initResponse.json();
    const sessionId = initResponse.headers.get('mcp-session-id');
    console.log('Session ID:', sessionId);
    console.log('Init result:', JSON.stringify(initResult, null, 2));
    
    // 2. List tools to verify async tool exists
    console.log('\n2. Listing available tools...');
    const listResponse = await fetch(mcpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Mcp-Session-Id': sessionId
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 2
      })
    });
    
    const listResult = await listResponse.json();
    const asyncTool = listResult.result.tools.find(t => t.name === 'claude_code_async');
    console.log('Found async tool:', asyncTool ? 'Yes' : 'No');
    
    if (asyncTool) {
      console.log('Async tool description:', asyncTool.description.substring(0, 200) + '...');
    }
    
    // 3. Call the async tool
    console.log('\n3. Calling claude_code_async tool...');
    const toolResponse = await fetch(mcpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Mcp-Session-Id': sessionId
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'claude_code_async',
          arguments: {
            prompt: 'List the files in the current directory and count how many there are',
            agentId: 'test_agent_123',
            workFolder: '/opt/stacks/claude-code-mcp'
          }
        },
        id: 3
      })
    });
    
    const toolResult = await toolResponse.json();
    console.log('Tool response:', JSON.stringify(toolResult, null, 2));
    
    // Extract task ID if available
    if (toolResult.result && toolResult.result.content && toolResult.result.content[0]) {
      const responseData = JSON.parse(toolResult.result.content[0].text);
      console.log('\nTask ID:', responseData.taskId);
      console.log('Status:', responseData.status);
      console.log('Message:', responseData.message);
    }
    
    // 4. Clean up session
    console.log('\n4. Cleaning up session...');
    await fetch(mcpUrl, {
      method: 'DELETE',
      headers: {
        'Mcp-Session-Id': sessionId
      }
    });
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testAsyncTool();