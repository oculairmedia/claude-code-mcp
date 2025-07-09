#!/usr/bin/env node
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

async function listTools() {
  console.log('Listing available MCP tools...\n');

  const transport = new StreamableHTTPClientTransport('http://192.168.50.90:3456/mcp');
  const client = new Client({
    name: 'test-client',
    version: '1.0.0'
  }, {
    capabilities: {
      tools: {}
    }
  });

  try {
    await client.connect(transport);
    console.log('Connected to server\n');

    const tools = await client.listTools();
    console.log(`Found ${tools.tools.length} tools:\n`);
    
    tools.tools.forEach(tool => {
      console.log(`Tool: ${tool.name}`);
      console.log(`Description: ${tool.description.substring(0, 100)}...`);
      console.log(`Input Schema:`, JSON.stringify(tool.inputSchema, null, 2));
      console.log('-'.repeat(80));
    });

    // Test regular claude_code tool
    console.log('\nTesting regular claude_code tool...');
    const result = await client.callTool('claude_code', {
      prompt: 'echo "Hello from claude_code"',
      workFolder: '/tmp'
    });
    
    console.log('Result:', result.content[0].text);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

listTools().catch(console.error);