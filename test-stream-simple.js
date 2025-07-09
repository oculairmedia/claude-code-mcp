#!/usr/bin/env node
import fetch from 'node-fetch';

async function testStreamingTool() {
  console.log('Testing claude_code_stream tool with simple approach...\n');

  // First, initialize without session (let server create one)
  console.log('1. Making initial request...');
  const response = await fetch('http://192.168.50.90:3456/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        }
      }
    })
  });

  // Get session ID from response headers
  const sessionId = response.headers.get('mcp-session-id');
  console.log('Session ID:', sessionId);

  // Parse SSE response
  const responseText = await response.text();
  console.log('Raw response:', responseText.substring(0, 200) + '...');

  // Now call the streaming tool
  console.log('\n2. Calling claude_code_stream tool...');
  const toolResponse = await fetch('http://192.168.50.90:3456/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Mcp-Session-Id': sessionId
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'claude_code_stream',
        arguments: {
          prompt: 'echo "Hello from streaming test"',
          workFolder: '/tmp'
        }
      }
    })
  });

  const toolResult = await toolResponse.text();
  console.log('\nTool response:');
  console.log(toolResult);

  // Extract JSON from SSE response
  const match = toolResult.match(/data: ({.*})/);
  if (match) {
    try {
      const jsonData = JSON.parse(match[1]);
      console.log('\nParsed result:');
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.error('Failed to parse JSON from SSE:', e);
    }
  }
}

testStreamingTool().catch(console.error);