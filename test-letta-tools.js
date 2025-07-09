#!/usr/bin/env node
/**
 * Test script to discover and test Letta MCP tools
 */

import { LettaMCPClient } from './dist/letta-mcp-client.js';

async function testLetta() {
  const client = new LettaMCPClient('http://192.168.50.90:3001');
  
  try {
    console.log('Connecting to Letta MCP server...');
    await client.connect();
    
    console.log('\nInitializing session...');
    await client.initialize();
    
    console.log('\nListing available tools...');
    const tools = await client.listTools();
    
    console.log('\n=== Available Letta Tools ===');
    for (const tool of tools) {
      console.log(`\nTool: ${tool.name}`);
      if (tool.description) {
        console.log(`Description: ${tool.description}`);
      }
      if (tool.inputSchema) {
        console.log(`Input Schema:`, JSON.stringify(tool.inputSchema, null, 2));
      }
    }
    
    console.log('\n=== Testing Message Send ===');
    if (process.argv[2] && process.argv[3]) {
      const agentId = process.argv[2];
      const message = process.argv[3];
      console.log(`Sending message to agent ${agentId}: "${message}"`);
      
      try {
        const result = await client.sendMessageToAgent(agentId, message);
        console.log('Result:', result);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.log('To test sending a message, run with: node test-letta-tools.js <agentId> <message>');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.disconnect();
  }
}

testLetta();