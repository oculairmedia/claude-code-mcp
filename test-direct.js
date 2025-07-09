#!/usr/bin/env node

// Direct test of the server
import { ClaudeCodeServer } from './dist/server.js';

async function testDirect() {
  const server = new ClaudeCodeServer();
  
  // Get the tools list handler
  const handlers = server.server._requestHandlers;
  const toolsListHandler = handlers.get('tools/list');
  
  if (toolsListHandler) {
    const request = {
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
      id: 1
    };
    const result = await toolsListHandler(request, {});
    console.log('Tools available:');
    result.tools.forEach(tool => {
      console.log(`\n- ${tool.name}`);
      console.log(`  Description: ${tool.description.substring(0, 100)}...`);
    });
  } else {
    console.log('No tools/list handler found');
  }
}

testDirect().catch(console.error);