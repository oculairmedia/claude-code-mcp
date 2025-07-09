#!/usr/bin/env node
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

// Test the streaming tool via stdio
const testScript = `#!/bin/bash
cd /opt/stacks/claude-code-mcp

# First test regular claude_code
echo "Testing regular claude_code tool..." >&2
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
    "name": "claude_code",
    "arguments": {
      "prompt": "echo 'Hello from regular claude_code'",
      "workFolder": "/tmp"
    }
  },
  "id": 2
}
EOF

echo -e "\n\nTesting claude_code_stream tool..." >&2
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
    "name": "claude_code_stream",
    "arguments": {
      "prompt": "List files in the current directory",
      "workFolder": "/opt/stacks/claude-code-mcp"
    }
  },
  "id": 2
}
EOF
`;

// Write and execute the test script
writeFileSync('/tmp/test-stream-stdio.sh', testScript, { mode: 0o755 });

// Run the test
const child = spawn('sudo', ['-u', 'mcp-user', '/tmp/test-stream-stdio.sh'], {
  stdio: 'inherit'
});

child.on('exit', (code) => {
  console.log(`\nTest completed with code ${code}`);
});