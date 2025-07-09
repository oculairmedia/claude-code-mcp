#!/usr/bin/env node

import { spawn } from 'child_process';
import { join, resolve as pathResolve } from 'path';

console.log('Testing MCP passthrough to Claude agents...\n');

const claudePath = 'claude'; // Will use PATH lookup
const mcpConfigPath = join(pathResolve('.'), 'letta-mcp-config.json');

// Test prompt that should use Letta tools
const testPrompt = `Use the list_agents tool to show all available Letta agents, then summarize what you found.`;

const args = [
  '--dangerously-skip-permissions',
  '--mcp-config', mcpConfigPath,
  '-p', testPrompt
];

console.log(`Executing: ${claudePath} ${args.join(' ')}\n`);
console.log('MCP Config:', mcpConfigPath);
console.log('---\n');

const child = spawn(claudePath, args, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('error', (error) => {
  console.error('Failed to start Claude:', error);
});

child.on('exit', (code) => {
  console.log(`\nClaude exited with code ${code}`);
});