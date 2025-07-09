#!/usr/bin/env node
/**
 * Analyze the schema issue with Letta MCP tools
 */

// Based on the error message and code analysis, here's what's happening:
console.log("Schema Issue Analysis");
console.log("===================\n");

console.log("1. Claude Code MCP server is configured to pass Letta MCP tools to spawned Claude instances");
console.log("   - Config file: letta-mcp-config.json");
console.log("   - Letta MCP URL: http://192.168.50.90:3001/mcp (or :3002/sse)\n");

console.log("2. When Claude CLI is spawned with --mcp-config, it tries to load tools from Letta");
console.log("   - The Anthropic API validates all tool schemas");
console.log("   - Tools at indices 14 and 20 have problematic schemas\n");

console.log("3. The error indicates these tools have oneOf/allOf/anyOf at the top level");
console.log("   - This is not allowed by Anthropic's API");
console.log("   - Valid schemas must have 'type': 'object' at the top level\n");

console.log("4. Possible problematic schema patterns:");
console.log("   INVALID:");
console.log("   {");
console.log("     oneOf: [");
console.log("       { type: 'object', properties: {...} },");
console.log("       { type: 'object', properties: {...} }");
console.log("     ]");
console.log("   }\n");

console.log("   VALID:");
console.log("   {");
console.log("     type: 'object',");
console.log("     properties: {");
console.log("       // ... properties here");
console.log("     }");
console.log("   }\n");

console.log("5. Solutions:");
console.log("   a) Fix the Letta MCP server to provide valid schemas");
console.log("   b) Remove the MCP config when spawning Claude");
console.log("   c) Filter/transform the tools before passing to Claude");
console.log("   d) Create a proxy that fixes the schemas\n");

console.log("6. To identify the specific problematic tools:");
console.log("   - Need to connect to Letta MCP server directly");
console.log("   - List all tools and examine indices 14 and 20");
console.log("   - The server appears to be offline or at a different address\n");

console.log("Without access to the Letta server, we can infer that:");
console.log("- Tool 14 and Tool 20 likely have complex parameter validation");
console.log("- They might be using oneOf/anyOf for parameter polymorphism");
console.log("- Common in tools that accept multiple input formats\n");

console.log("Recommendation: Check with the Letta MCP server maintainers about these specific tools.");