#!/usr/bin/env node
import { spawn } from 'child_process';

console.log('Testing Claude Code MCP server (should be quiet now)...\n');

const child = spawn('node', ['dist/server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Send a list tools request
child.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  method: 'tools/list',
  id: 1
}) + '\n');

let output = '';
let errorOutput = '';

child.stdout.on('data', (data) => {
  output += data.toString();
});

child.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

setTimeout(() => {
  child.kill();
  
  console.log('STDOUT output:');
  console.log(output || '(empty)');
  console.log('\nSTDERR output:');
  console.log(errorOutput || '(empty)');
  
  if (errorOutput.includes('[Warning]') || errorOutput.includes('[Setup]') || errorOutput.includes('MCP server running')) {
    console.log('\n❌ Test failed: Still seeing startup messages in stderr');
    process.exit(1);
  } else {
    console.log('\n✅ Test passed: No startup messages in stderr');
  }
}, 1000);