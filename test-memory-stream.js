#!/usr/bin/env node
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

async function testMemoryStreaming() {
  console.log('Testing claude_code_stream_to_memory tool...\n');

  const transport = new StreamableHTTPClientTransport('http://192.168.50.90:3456/mcp');
  const client = new Client({
    name: 'test-memory-stream',
    version: '1.0.0'
  }, {
    capabilities: {
      tools: {}
    }
  });

  try {
    await client.connect(transport);
    console.log('Connected to server\n');

    // Test the memory streaming tool
    console.log('Testing claude_code_stream_to_memory...');
    const result = await client.callTool('claude_code_stream_to_memory', {
      prompt: 'Count from 1 to 10, showing each number on a new line',
      workFolder: '/tmp',
      agentId: 'agent-e54fc601-4773-4116-9c6c-cf45da2e269e',
      blockLabel: 'test_stream_count'
    });
    
    console.log('\nResult:');
    console.log(result.content[0].text);
    
    // Test with longer operation
    console.log('\n\nTesting with file listing...');
    const fileResult = await client.callTool('claude_code_stream_to_memory', {
      prompt: 'List all TypeScript files in this project with their sizes',
      workFolder: '/opt/stacks/claude-code-mcp',
      blockLabel: 'test_stream_files'
    });
    
    console.log('\nResult:');
    console.log(fileResult.content[0].text);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

testMemoryStreaming().catch(console.error);