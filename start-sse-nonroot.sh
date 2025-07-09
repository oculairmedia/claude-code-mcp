#!/bin/bash
# Start the Claude Code MCP server in SSE mode as non-root user

# Export environment variables
export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-your_anthropic_api_key_here}"
export MCP_CLAUDE_DEBUG=true
export MCP_TRANSPORT=sse
export PORT=3456

# Change to the project directory
cd /opt/stacks/claude-code-mcp

# Run as mcp-user
exec su -c "node dist/server-sse.js --sse" mcp-user