#!/usr/bin/env node
/**
 * Test script to fetch and analyze Letta MCP tool schemas
 */

import fetch from 'node-fetch';
import EventSource from 'eventsource';

async function connectAndListTools() {
  const baseUrl = 'http://192.168.50.90:3001';
  let sessionId;
  let messageEndpoint;

  // Connect via SSE
  console.log('Connecting to Letta MCP server...');
  
  try {
    const sseUrl = `${baseUrl}/sse`;
    const eventSource = new EventSource(sseUrl);
    
    await new Promise((resolve, reject) => {
      eventSource.addEventListener('endpoint', (event) => {
        const endpoint = event.data;
        const match = endpoint.match(/sessionId=([^&]+)/);
        if (match) {
          sessionId = match[1];
          messageEndpoint = `${baseUrl}${endpoint}`;
          console.log(`Connected with session ID: ${sessionId}`);
          eventSource.close();
          resolve();
        }
      });
      
      eventSource.addEventListener('error', (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
        reject(error);
      });
      
      setTimeout(() => {
        eventSource.close();
        reject(new Error('Connection timeout'));
      }, 10000);
    });

    // Send initialize request
    console.log('\nSending initialize request...');
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'schema-test-client',
          version: '1.0.0'
        }
      }
    };

    const initResponse = await fetch(messageEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initRequest)
    });

    const initResult = await initResponse.json();
    console.log('Initialize response:', JSON.stringify(initResult, null, 2));

    // List tools
    console.log('\nSending tools/list request...');
    const listRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };

    const listResponse = await fetch(messageEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listRequest)
    });

    const listResult = await listResponse.json();
    
    if (listResult.result && listResult.result.tools) {
      console.log(`\nFound ${listResult.result.tools.length} tools\n`);
      
      // Analyze each tool for problematic schemas
      listResult.result.tools.forEach((tool, index) => {
        console.log(`Tool ${index}: ${tool.name}`);
        
        if (tool.inputSchema) {
          const schemaStr = JSON.stringify(tool.inputSchema);
          
          // Check for problematic patterns at the top level
          const hasProblematicSchema = 
            (tool.inputSchema.oneOf && !tool.inputSchema.type) ||
            (tool.inputSchema.allOf && !tool.inputSchema.type) ||
            (tool.inputSchema.anyOf && !tool.inputSchema.type);
          
          if (hasProblematicSchema) {
            console.log(`  ⚠️  PROBLEMATIC SCHEMA DETECTED`);
            console.log(`  Has oneOf at top level: ${!!tool.inputSchema.oneOf}`);
            console.log(`  Has allOf at top level: ${!!tool.inputSchema.allOf}`);
            console.log(`  Has anyOf at top level: ${!!tool.inputSchema.anyOf}`);
            console.log(`  Schema:`, JSON.stringify(tool.inputSchema, null, 2));
          }
          
          // Special check for indices 14 and 20
          if (index === 14 || index === 20) {
            console.log(`  *** This is tool index ${index} ***`);
            console.log(`  Full schema:`, JSON.stringify(tool.inputSchema, null, 2));
          }
        }
        console.log('');
      });
    } else {
      console.log('No tools found or error in response:', JSON.stringify(listResult, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

connectAndListTools();