#!/bin/bash
# Test Claude Code memory integration via Letta

AGENT_ID="agent-1eacfc07-d8b6-4f25-a6ee-aab71934e07a"
LETTA_URL="https://letta2.oculair.ca"
AUTH_TOKEN="lettaSecurePass123"
BARE_PASSWORD="password lettaSecurePass123"

echo "Testing Claude Code memory integration via Letta..."
echo "Agent ID: $AGENT_ID"
echo ""

# Send a message to Letta asking it to use Claude Code
curl -X POST "$LETTA_URL/v1/agents/$AGENT_ID/messages/async" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-BARE-PASSWORD: $BARE_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": [{
        "type": "text",
        "text": "Use the claude_code tool to list the files in /opt/stacks/claude-code-mcp/src and summarize what each file does. Make sure to pass the agentId parameter so I can track the task status in memory blocks."
      }]
    }],
    "max_steps": 50
  }'

echo ""
echo "Request sent. Check the Letta UI to see if the agent uses claude_code tool."
echo ""
echo "After a few seconds, check the memory blocks:"
echo "Status: curl -H 'Authorization: Bearer $AUTH_TOKEN' -H 'X-BARE-PASSWORD: $BARE_PASSWORD' $LETTA_URL/v1/agents/$AGENT_ID/core-memory/blocks/claude_mcp_task_status"
echo "History: curl -H 'Authorization: Bearer $AUTH_TOKEN' -H 'X-BARE-PASSWORD: $BARE_PASSWORD' $LETTA_URL/v1/agents/$AGENT_ID/core-memory/blocks/claude_mcp_task_history"
echo "Errors: curl -H 'Authorization: Bearer $AUTH_TOKEN' -H 'X-BARE-PASSWORD: $BARE_PASSWORD' $LETTA_URL/v1/agents/$AGENT_ID/core-memory/blocks/claude_mcp_task_errors"