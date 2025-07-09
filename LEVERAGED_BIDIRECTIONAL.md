# Leveraged Bidirectional Communication

This document explains how we leverage the existing Letta-Claude communication infrastructure for bidirectional messaging.

## The Approach

Instead of building a separate polling mechanism, we leverage the fact that:
1. Claude agents spawned by `claude_code` have access to Letta MCP tools
2. They can use `prompt_agent` to communicate with the Letta agent that called them
3. This creates a natural bidirectional conversation flow

## How It Works

### 1. Initial Task with Instructions

When an async task is started, Claude receives enhanced instructions:

```
[Original prompt from Letta]

[System: This is an async task with ID abc-123. The Letta agent that called you may send follow-up messages. To check for updates, use the prompt_agent tool to send a status update to agent agent-123 - they will respond with any new instructions or questions they have.]
```

### 2. Claude Can Send Progress Updates

During execution, Claude can check for updates by sending progress reports:

```python
# Claude sends a progress update
response = prompt_agent(
    agent_id="agent-123",
    message="Task abc-123: Completed initial analysis. Found 3 key trends. Should I proceed with detailed breakdown?"
)

# Letta responds with guidance
# Response might be: "Yes, please provide detailed breakdown. Also analyze impact on European markets."
```

### 3. Natural Conversation Flow

This creates a conversation pattern:
- Claude: "I've completed X, should I do Y?"
- Letta: "Yes, and also do Z"
- Claude: "Understood, working on Y and Z now"
- Letta: "Actually, prioritize Z first"
- Claude: "Switching to Z first"

## Benefits

1. **No New Infrastructure**: Uses existing MCP tools
2. **Natural Flow**: Mimics human collaboration
3. **Flexible**: Letta can provide guidance at any time
4. **Simple**: No polling, no complex state management

## Message Storage (Optional)

The system still includes a message queue and REST endpoint (`/messages/task/:taskId`) that Letta can use to store messages for a task. While Claude doesn't poll these directly, they can be useful for:
- Audit trails
- Debugging
- Future enhancements

## Example Workflow

1. Letta calls `claude_code` with a research task
2. Claude starts working and receives the task ID
3. After initial analysis, Claude uses `prompt_agent` to report progress
4. Letta responds with additional requirements
5. Claude adjusts approach based on feedback
6. Process continues until task completion

This approach is simpler, more reliable, and leverages the existing infrastructure effectively.