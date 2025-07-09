#!/usr/bin/env node
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

// Test the memory streaming tool via stdio
const testScript = `#!/bin/bash
cd /opt/stacks/claude-code-mcp

echo "Testing claude_code_stream_to_memory tool..." >&2
node dist/server.js << 'EOF'
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
    "name": "claude_code_stream_to_memory",
    "arguments": {
      "prompt": "Count from 1 to 5 slowly",
      "workFolder": "/tmp",
      "agentId": "agent-e54fc601-4773-4116-9c6c-cf45da2e269e",
      "blockLabel": "test_count_stream"
    }
  },
  "id": 2
}
EOF
`;

// Write and execute the test script
writeFileSync('/tmp/test-memory-stream-stdio.sh', testScript, { mode: 0o755 });

// Run the test
const child = spawn('sudo', ['-u', 'mcp-user', '/tmp/test-memory-stream-stdio.sh'], {
  stdio: 'inherit'
});

child.on('exit', (code) => {
  console.log(`\nTest completed with code ${code}`);
});