#!/usr/bin/env node
import { spawn } from 'child_process';

console.log('Testing claude_code_stream real-time output behavior...\n');

// Test command that should produce streaming output
const prompt = `Create a test file /tmp/stream-test.txt with content "Line 1" through "Line 10", showing each line as you write it`;

const claudeProcess = spawn('sudo', [
  '-u', 'mcp-user',
  'claude', '--dangerously-skip-permissions', 
  '-p', prompt
], {
  cwd: '/tmp',
  env: process.env
});

let outputBuffer = '';
let lineCount = 0;

claudeProcess.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  outputBuffer += text;
  
  // Show real-time output
  const lines = text.split('\n').filter(l => l.trim());
  lines.forEach(line => {
    lineCount++;
    console.log(`[${new Date().toISOString()}] Line ${lineCount}: ${line}`);
  });
});

claudeProcess.stderr.on('data', (chunk) => {
  console.error('[STDERR]:', chunk.toString());
});

claudeProcess.on('close', (code) => {
  console.log(`\nProcess completed with code ${code}`);
  console.log(`Total output length: ${outputBuffer.length} characters`);
  console.log(`Total lines: ${lineCount}`);
});

claudeProcess.on('error', (error) => {
  console.error('Process error:', error);
});