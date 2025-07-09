#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

// Create a test directory and switch to mcp-user
const testDir = '/tmp/claude-code-mcp-test';
const testPrompt = 'Use the list_agents tool to show available Letta agents, then tell me how many there are.';

console.log('Testing Claude Code MCP integration...\n');

// Create test script that will run as mcp-user
const testScript = `#!/bin/bash
cd ${testDir}
export PATH=/usr/local/bin:$PATH
/opt/stacks/claude-code-mcp/dist/server.js << 'EOF'
{
  "jsonrpc": "2.0",
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {}
  },
  "id": 1
}
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "claude_code",
    "arguments": {
      "prompt": "${testPrompt}",
      "workFolder": "${testDir}"
    }
  },
  "id": 2
}
EOF
`;

// Write and execute the test script
writeFileSync('/tmp/test-mcp.sh', testScript, { mode: 0o755 });

// Run as mcp-user to avoid root issues
const child = spawn('sudo', ['-u', 'mcp-user', '/tmp/test-mcp.sh'], {
  stdio: 'inherit'
});

child.on('exit', (code) => {
  console.log(`\nTest completed with code ${code}`);
});