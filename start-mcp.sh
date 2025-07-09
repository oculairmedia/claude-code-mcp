#!/bin/bash
# Start the Claude Code MCP server

# Export environment variables
export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-your_anthropic_api_key_here}"
export MCP_CLAUDE_DEBUG=true

# Change to the project directory
cd /opt/stacks/claude-code-mcp

# Start the server
exec node dist/server.js