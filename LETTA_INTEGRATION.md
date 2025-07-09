# Letta Integration for Claude Code MCP Server

This document describes the Letta integration features added to the Claude Code MCP server.

## Overview

The Claude Code MCP server now supports asynchronous execution with automatic callbacks to Letta agents. When Letta calls the `claude_code` tool with an `agentId`, the server will:

1. Immediately return an acknowledgment to Letta
2. Execute the Claude Code command in the background
3. Send the results back to the Letta agent via the Letta API

## Usage

### Synchronous Mode (default)

For immediate responses, call the tool without `agentId`:

```json
{
  "name": "claude_code",
  "arguments": {
    "prompt": "List files in the current directory",
    "workFolder": "/path/to/directory"
  }
}
```

### Asynchronous Mode

For async execution with Letta callback, include `agentId`:

```json
{
  "name": "claude_code",
  "arguments": {
    "prompt": "Research current events in Iran and provide a comprehensive summary",
    "agentId": "agent-1eacfc07-d8b6-4f25-a6ee-aab71934e07a",
    "workFolder": "/tmp"
  }
}
```

Optional: Override the default Letta URL:

```json
{
  "name": "claude_code",
  "arguments": {
    "prompt": "Generate a Python script",
    "agentId": "agent-1eacfc07-d8b6-4f25-a6ee-aab71934e07a",
    "callbackUrl": "https://custom-letta.example.com",
    "workFolder": "/workspace"
  }
}
```

## Configuration

### Default Letta Configuration

The server uses these defaults for Letta API:
- Base URL: `https://letta2.oculair.ca`
- Auth Token: `lettaSecurePass123`
- Bare Password: `password lettaSecurePass123`

### Environment Variables

You can override defaults using environment variables:
- `LETTA_BASE_URL`: Override the default Letta API URL
- `LETTA_AUTH_TOKEN`: Override the default authentication token
- `LETTA_BARE_PASSWORD`: Override the default bare password

## How It Works

1. **Letta sends request**: Letta calls the `claude_code` tool with an `agentId`
2. **Immediate acknowledgment**: The server returns "Request received and being processed asynchronously"
3. **Background execution**: Claude Code runs the command in a detached process
4. **Result callback**: When complete, the server calls Letta's API to send the result to the agent

## API Details

The server sends results to Letta using:
```
POST https://letta2.oculair.ca/v1/agents/{agentId}/messages/stream
```

With headers:
- `Authorization: Bearer {authToken}`
- `X-BARE-PASSWORD: {barePassword}`
- `Content-Type: application/json`
- `Accept: text/event-stream`

Body:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "<Claude Code execution result>"
    }
  ],
  "stream_steps": true,
  "stream_tokens": true
}
```

## Testing

Test the Letta API integration:
```bash
node dist/letta-api-client.js agent-1eacfc07-d8b6-4f25-a6ee-aab71934e07a "Test message"
```

## Server Endpoints

- SSE endpoint: `http://localhost:3456/sse`
- Messages endpoint: `http://localhost:3456/messages`
- Health check: `http://localhost:3456/health`

## MCP Tool Access for Spawned Claude Agents

As of v1.10.12, Claude agents spawned by the `claude_code` tool now have access to Letta MCP tools. This enables administrative tasks on the Letta framework.

### Configuration

The server automatically configures spawned Claude instances with:
- MCP config file: `letta-mcp-config.json`
- Letta MCP server URL: `http://192.168.50.90:3002/sse` (or set via `LETTA_MCP_URL`)

### Available Tools

Spawned Claude agents can use all Letta tools including:
- `list_agents` - List all Letta agents
- `create_agent` - Create new agents with memory blocks
- `prompt_agent` - Send messages to agents
- `list_memory_blocks` - Manage agent memory
- `attach_tool` - Add tools to agents
- `modify_agent` - Update agent configurations
- `bulk_attach_tool_to_agents` - Manage tools across multiple agents
- And many more administrative functions

### Example Usage

When you call `claude_code` with a prompt like:
```
"Use the list_agents tool to show all available Letta agents and summarize their purposes"
```

The spawned Claude agent will have direct access to query and manage the Letta system.

### Security Note

When running as root, the `--dangerously-skip-permissions` flag is automatically omitted to comply with Claude's security guardrails. The service typically runs as `mcp-user` to avoid this limitation.

## Bidirectional Communication via MCP Tools

As of v1.10.13, Claude agents can maintain bidirectional communication with Letta agents by leveraging existing MCP tools:

### How It Works

1. **Enhanced Instructions**: Async Claude tasks receive instructions to check for updates via `prompt_agent`
2. **Natural Communication**: Claude uses `prompt_agent` to send progress updates to the calling Letta agent
3. **Letta Responds**: The Letta agent can respond with new instructions, questions, or guidance
4. **Task Tracking**: The server tracks active tasks and their associated agents

### Example Flow

```
Claude: "Task abc-123 progress: Analyzed 50% of data. Found 3 key insights. Continue with full analysis?"
Letta: "Yes, continue. Also include competitor analysis in your report."
Claude: "Understood. Adding competitor analysis to the scope."
```

This approach leverages existing infrastructure without requiring new tools or complex polling mechanisms.

See [LEVERAGED_BIDIRECTIONAL.md](./LEVERAGED_BIDIRECTIONAL.md) for detailed documentation.