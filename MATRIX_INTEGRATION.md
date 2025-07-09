# Matrix Integration for Claude Code MCP

This document describes the Matrix notification system implementation for Claude Code MCP async jobs.

## Overview

The Claude Code MCP server now supports sending async job results to Matrix rooms instead of directly back to Letta agents. This creates a transparent, collaborative workflow where async jobs become visible participants in Matrix conversations.

## Architecture

### Components

1. **Matrix Bot Service** (`src/matrix-client.ts`)
   - Handles Matrix authentication and room operations
   - Sends formatted job results to Matrix rooms
   - Auto-joins rooms when invited

2. **Agent Room Mapping Client** (`src/agent-room-mapping-client.ts`)
   - Queries the agent-to-room mapping service
   - Finds the primary Matrix room for each agent
   - Falls back gracefully if service is unavailable

3. **Letta Callback Handler** (`src/letta-callback.ts`)
   - Modified to use Matrix notifications as primary method
   - Falls back to direct Letta callbacks if Matrix fails
   - Provides unified interface for result delivery

## Configuration

### Environment Variables

```bash
# Matrix Bot Configuration
MATRIX_HOMESERVER_URL=https://matrix.oculair.ca
MATRIX_ACCESS_TOKEN=your_matrix_bot_access_token_here
MATRIX_USER_ID=@claude-code:matrix.oculair.ca
MATRIX_AUTO_JOIN_ROOMS=true

# Agent Room Mapping Service
AGENT_ROOM_MAPPING_URL=http://192.168.50.90:3002
```

### Matrix Bot Setup

1. Create a Matrix bot account on your homeserver
2. Obtain an access token for the bot
3. Set the environment variables above
4. The bot will auto-join rooms when invited

## Workflow

1. **User** sends request to Letta agent
2. **Letta Agent** triggers Claude Code async job
3. **Claude Code** executes the task
4. **Claude Code** queries agent-to-room mapping service
5. **Claude Code** joins Matrix room (if needed)
6. **Claude Code** posts formatted results to Matrix room
7. **User** and **Letta Agent** both see results in Matrix

## Message Format

Matrix messages include:
- 🔧 Async job completion notification
- 📊 Task ID and metadata
- 📝 The actual Claude Code results
- ✅ Status and completion information

### Success Message Example
```
🔧 Claude Code Async Job Complete

📊 Task ID: task_1234567890_abc123
🤖 Agent ID: agent-4bea3f4e-ecf7-40d3-871d-4c52595d60a1
📈 Status: ✅ Success
🕒 Time: 2024-01-15T10:30:00.000Z

📝 Result:
[Claude Code execution results here]
```

### Error Message Example
```
🔧 Claude Code Async Job Complete

📊 Task ID: task_1234567890_abc123
🤖 Agent ID: agent-4bea3f4e-ecf7-40d3-871d-4c52595d60a1
📈 Status: ❌ Failed
🕒 Time: 2024-01-15T10:30:00.000Z

💥 Error: [Error details here]
```

## Error Handling

The system includes multiple layers of error handling:

1. **Matrix Connection Errors**: Falls back to direct Letta callback
2. **Room Not Found**: Falls back to direct Letta callback
3. **Permission Errors**: Logs error and falls back
4. **Network Issues**: Retries with exponential backoff

## Testing

To test the Matrix integration:

1. Set up environment variables
2. Start the Claude Code MCP server
3. Trigger an async job from a Letta agent
4. Verify the result appears in the Matrix room

### Manual Test
```bash
# Test the callback directly
node dist/letta-callback.js agent-123 https://letta.oculair.ca "Test result" task_456
```

## Fallback Behavior

If Matrix notification fails, the system automatically falls back to:
1. Direct Letta API callback (HTTP POST)
2. SSE/MCP callback (if configured)

This ensures async jobs always complete successfully even if Matrix is unavailable.

## Security Considerations

- Matrix bot access token should be kept secure
- Bot should only join authorized rooms
- Agent-to-room mappings should be properly authenticated
- Sensitive data in results should be handled appropriately

## Future Enhancements

- Rich message formatting with markdown/HTML
- File attachments for large results
- Interactive buttons for follow-up actions
- Thread support for organizing conversations