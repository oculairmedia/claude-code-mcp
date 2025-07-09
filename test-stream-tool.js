#!/usr/bin/env node
import fetch from 'node-fetch';

async function testStreamingTool() {
  console.log('Testing claude_code_stream tool...\n');

  // Initialize session
  console.log('1. Initializing session...');
  const initResponse = await fetch('http://192.168.50.90:3456/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'test-stream-client',
          version: '1.0.0'
        }
      }
    })
  });

  const initText = await initResponse.text();
  console.log('Raw response:', initText);
  
  let initResult;
  try {
    initResult = JSON.parse(initText);
    console.log('Session initialized:', initResult);
  } catch (e) {
    console.error('Failed to parse response as JSON:', e.message);
    return;
  }
  
  const sessionId = initResponse.headers.get('mcp-session-id');
  console.log('Session ID:', sessionId);

  // List tools to verify claude_code_stream is available
  console.log('\n2. Listing available tools...');
  const listResponse = await fetch('http://192.168.50.90:3456/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Mcp-Session-Id': sessionId
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    })
  });

  const tools = await listResponse.json();
  const streamTool = tools.result.tools.find(t => t.name === 'claude_code_stream');
  console.log('\nFound claude_code_stream tool:', streamTool ? 'YES' : 'NO');
  
  if (streamTool) {
    console.log('Tool description preview:', streamTool.description.substring(0, 100) + '...');
  }

  // Test the streaming tool
  console.log('\n3. Testing claude_code_stream...');
  const streamResponse = await fetch('http://192.168.50.90:3456/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Mcp-Session-Id': sessionId
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'claude_code_stream',
        arguments: {
          prompt: 'List the files in the current directory and show their sizes',
          workFolder: '/opt/stacks/claude-code-mcp',
          progressToken: 'test-progress-123'
        }
      }
    })
  });

  const streamResult = await streamResponse.json();
  console.log('\nStreaming result:');
  console.log(JSON.stringify(streamResult, null, 2));

  // Test with a longer operation
  console.log('\n4. Testing with longer operation...');
  const longResponse = await fetch('http://192.168.50.90:3456/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Mcp-Session-Id': sessionId
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'claude_code_stream',
        arguments: {
          prompt: 'Search for all TypeScript files in this project and count the lines in each file',
          workFolder: '/opt/stacks/claude-code-mcp'
        }
      }
    })
  });

  const longResult = await longResponse.json();
  console.log('\nLong operation result preview:');
  if (longResult.result?.content?.[0]?.text) {
    const text = longResult.result.content[0].text;
    console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
    console.log(`\nTotal output length: ${text.length} characters`);
  }
}

testStreamingTool().catch(console.error);