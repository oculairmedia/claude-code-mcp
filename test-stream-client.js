#!/usr/bin/env node
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

async function testStreamingTool() {
  console.log('Testing claude_code_stream with MCP client...\n');

  // Create transport and client
  const transport = new StreamableHTTPClientTransport('http://192.168.50.90:3456/mcp');

  const client = new Client({
    name: 'test-stream-client',
    version: '1.0.0'
  }, {
    capabilities: {
      tools: {}
    }
  });

  try {
    // Connect client to transport
    console.log('1. Connecting to server...');
    await client.connect(transport);
    console.log('Connected successfully!\n');

    // List available tools
    console.log('2. Listing tools...');
    const tools = await client.listTools();
    console.log(`Found ${tools.tools.length} tools:`);
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}`);
    });

    // Find claude_code_stream
    const streamTool = tools.tools.find(t => t.name === 'claude_code_stream');
    if (!streamTool) {
      console.error('\nERROR: claude_code_stream tool not found!');
      return;
    }

    console.log('\n3. Testing claude_code_stream...');
    console.log('Executing: List files in current directory\n');

    const startTime = Date.now();
    
    // Call the streaming tool
    const result = await client.callTool('claude_code_stream', {
      prompt: 'List all files in the current directory with their sizes',
      workFolder: '/opt/stacks/claude-code-mcp'
    });

    const elapsed = Date.now() - startTime;
    
    console.log('Result received in', elapsed, 'ms:');
    console.log('-'.repeat(60));
    
    if (result.content && result.content[0]) {
      console.log(result.content[0].text);
    }
    
    console.log('-'.repeat(60));

    // Test with a longer operation
    console.log('\n4. Testing with longer operation...');
    console.log('Executing: Count TypeScript lines\n');

    const longStart = Date.now();
    
    const longResult = await client.callTool('claude_code_stream', {
      prompt: 'Find all TypeScript files and count the total number of lines',
      workFolder: '/opt/stacks/claude-code-mcp'
    });

    const longElapsed = Date.now() - longStart;
    
    console.log('Result received in', longElapsed, 'ms:');
    console.log('-'.repeat(60));
    
    if (longResult.content && longResult.content[0]) {
      const text = longResult.content[0].text;
      console.log(text.substring(0, 500) + (text.length > 500 ? '\n...' : ''));
      console.log(`\nTotal output: ${text.length} characters`);
    }
    
    console.log('-'.repeat(60));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Disconnect
    console.log('\nDisconnecting...');
    await client.close();
  }
}

testStreamingTool().catch(console.error);