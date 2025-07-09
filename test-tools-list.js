#!/usr/bin/env node

import fetch from 'node-fetch';

async function testMCP() {
  try {
    // Initialize session
    const initResponse = await fetch('http://192.168.50.90:3456/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0'
          }
        },
        id: 1
      })
    });

    console.log('Init response status:', initResponse.status);
    console.log('Init response headers:', [...initResponse.headers.entries()]);
    
    const initText = await initResponse.text();
    console.log('Init response body:', initText);
    
    let initResult;
    try {
      initResult = JSON.parse(initText);
    } catch (e) {
      console.error('Failed to parse init response:', e);
      return;
    }
    
    const sessionId = initResponse.headers.get('mcp-session-id');
    console.log('Session initialized:', sessionId);
    
    if (!sessionId) {
      console.error('No session ID received');
      return;
    }

    // List tools
    const toolsResponse = await fetch('http://192.168.50.90:3456/mcp', {
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

    const toolsResult = await toolsResponse.json();
    console.log('\nTools available:');
    if (toolsResult.result && toolsResult.result.tools) {
      toolsResult.result.tools.forEach(tool => {
        console.log(`\n- ${tool.name}`);
        console.log(`  Description: ${tool.description.substring(0, 100)}...`);
      });
    } else {
      console.log('Raw response:', JSON.stringify(toolsResult, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testMCP();