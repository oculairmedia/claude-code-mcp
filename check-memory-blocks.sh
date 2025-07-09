#!/bin/bash
# Check Claude MCP memory blocks

AGENT_ID="agent-1eacfc07-d8b6-4f25-a6ee-aab71934e07a"
LETTA_URL="https://letta2.oculair.ca"
AUTH_TOKEN="lettaSecurePass123"
BARE_PASSWORD="password lettaSecurePass123"

echo "Checking memory blocks for agent: $AGENT_ID"
echo "==========================================="
echo ""

echo "1. Task Status Block (claude_mcp_task_status):"
curl -s -H "Authorization: Bearer $AUTH_TOKEN" -H "X-BARE-PASSWORD: $BARE_PASSWORD" \
  "$LETTA_URL/v1/agents/$AGENT_ID/core-memory/blocks/claude_mcp_task_status" 2>/dev/null | \
  python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2))" 2>/dev/null || echo "Not found"

echo ""
echo "2. Task History Block (claude_mcp_task_history):"
curl -s -H "Authorization: Bearer $AUTH_TOKEN" -H "X-BARE-PASSWORD: $BARE_PASSWORD" \
  "$LETTA_URL/v1/agents/$AGENT_ID/core-memory/blocks/claude_mcp_task_history" 2>/dev/null | \
  python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2))" 2>/dev/null || echo "Not found"

echo ""
echo "3. Task Errors Block (claude_mcp_task_errors):"
curl -s -H "Authorization: Bearer $AUTH_TOKEN" -H "X-BARE-PASSWORD: $BARE_PASSWORD" \
  "$LETTA_URL/v1/agents/$AGENT_ID/core-memory/blocks/claude_mcp_task_errors" 2>/dev/null | \
  python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2))" 2>/dev/null || echo "Not found"

echo ""
echo "==========================================="
echo "Service logs (last 5 memory-related entries):"
sudo journalctl -u claude-mcp --no-pager | grep -i "memory" | tail -5