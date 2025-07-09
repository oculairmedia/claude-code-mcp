#!/bin/bash

echo "Moving Matrix client files to src directory..."

# Move matrix-client.ts
if [ -f "/opt/stacks/claude-code-mcp/matrix-client.ts" ]; then
    mv /opt/stacks/claude-code-mcp/matrix-client.ts /opt/stacks/claude-code-mcp/src/
    echo "Moved matrix-client.ts to src/"
else
    echo "ERROR: matrix-client.ts not found in parent directory"
    exit 1
fi

# Move agent-room-mapping-client.ts
if [ -f "/opt/stacks/claude-code-mcp/agent-room-mapping-client.ts" ]; then
    mv /opt/stacks/claude-code-mcp/agent-room-mapping-client.ts /opt/stacks/claude-code-mcp/src/
    echo "Moved agent-room-mapping-client.ts to src/"
else
    echo "ERROR: agent-room-mapping-client.ts not found in parent directory"
    exit 1
fi

# Move and rename letta-callback-matrix.ts to letta-callback.ts
if [ -f "/opt/stacks/claude-code-mcp/letta-callback-matrix.ts" ]; then
    mv /opt/stacks/claude-code-mcp/letta-callback-matrix.ts /opt/stacks/claude-code-mcp/src/letta-callback.ts
    echo "Moved letta-callback-matrix.ts to src/letta-callback.ts (replacing existing file)"
else
    echo "ERROR: letta-callback-matrix.ts not found in parent directory"
    exit 1
fi

# Set appropriate permissions
echo "Setting permissions..."
chown root:root /opt/stacks/claude-code-mcp/src/matrix-client.ts
chown root:root /opt/stacks/claude-code-mcp/src/agent-room-mapping-client.ts
chown root:root /opt/stacks/claude-code-mcp/src/letta-callback.ts
chmod 644 /opt/stacks/claude-code-mcp/src/matrix-client.ts
chmod 644 /opt/stacks/claude-code-mcp/src/agent-room-mapping-client.ts
chmod 644 /opt/stacks/claude-code-mcp/src/letta-callback.ts

echo "All files moved successfully to src/ with proper permissions!"
echo "Files now in place:"
ls -la /opt/stacks/claude-code-mcp/src/matrix-client.ts
ls -la /opt/stacks/claude-code-mcp/src/agent-room-mapping-client.ts
ls -la /opt/stacks/claude-code-mcp/src/letta-callback.ts