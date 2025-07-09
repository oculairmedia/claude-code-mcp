#!/usr/bin/env python3
"""
Test client for the Claude Code MCP SSE server.
This demonstrates how to connect to the SSE-based MCP server.
"""

import json
import requests
import sseclient
from typing import Dict, Any, Optional
import uuid
import time

class MCPSSEClient:
    def __init__(self, base_url: str = "http://localhost:3456"):
        self.base_url = base_url
        self.session_id: Optional[str] = None
        self.sse_client: Optional[sseclient.SSEClient] = None
        self.request_id = 0
        
    def connect(self):
        """Establish SSE connection to the MCP server"""
        print(f"Connecting to {self.base_url}/sse...")
        
        # Create SSE connection
        response = requests.get(f"{self.base_url}/sse", stream=True)
        self.sse_client = sseclient.SSEClient(response)
        
        # Get the session ID from the endpoint event
        for event in self.sse_client:
            if event.event == 'endpoint':
                data = json.loads(event.data)
                self.session_id = data.get('sessionId')
                print(f"Connected! Session ID: {self.session_id}")
                print(f"Message endpoint: {data.get('endpoint')}")
                break
                
    def send_request(self, method: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Send a JSON-RPC request to the MCP server"""
        if not self.session_id:
            raise RuntimeError("Not connected to MCP server")
            
        self.request_id += 1
        request = {
            "jsonrpc": "2.0",
            "id": self.request_id,
            "method": method,
            "params": params or {}
        }
        
        # Send request to messages endpoint
        response = requests.post(
            f"{self.base_url}/messages?sessionId={self.session_id}",
            json=request,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code != 200:
            raise RuntimeError(f"Request failed: {response.status_code} - {response.text}")
            
        # Wait for response via SSE
        for event in self.sse_client:
            if event.event == 'message':
                data = json.loads(event.data)
                if data.get('id') == self.request_id:
                    return data
                    
    def initialize(self):
        """Initialize the MCP session"""
        print("\nInitializing MCP session...")
        response = self.send_request("initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "tools": {}
            },
            "clientInfo": {
                "name": "test-sse-client",
                "version": "1.0.0"
            }
        })
        print(f"Server info: {response['result']['serverInfo']}")
        return response
        
    def list_tools(self):
        """List available tools"""
        print("\nListing available tools...")
        response = self.send_request("tools/list")
        tools = response['result']['tools']
        for tool in tools:
            print(f"\nTool: {tool['name']}")
            print(f"Description: {tool['description'][:100]}...")
        return tools
        
    def call_tool(self, tool_name: str, arguments: Dict[str, Any]):
        """Call a tool"""
        print(f"\nCalling tool '{tool_name}' with arguments: {arguments}")
        response = self.send_request("tools/call", {
            "name": tool_name,
            "arguments": arguments
        })
        return response

def main():
    # Create client
    client = MCPSSEClient()
    
    try:
        # Connect to server
        client.connect()
        
        # Initialize session
        client.initialize()
        
        # List available tools
        tools = client.list_tools()
        
        # Example: Call claude_code tool
        print("\n" + "="*50)
        print("Testing claude_code tool...")
        print("="*50)
        
        result = client.call_tool("claude_code", {
            "prompt": "Create a simple hello.txt file with 'Hello from Claude Code MCP!' content",
            "workFolder": "/tmp"
        })
        
        print("\nTool response:")
        if 'result' in result:
            content = result['result'].get('content', [])
            for item in content:
                if item['type'] == 'text':
                    print(item['text'])
        else:
            print(f"Error: {result}")
            
    except Exception as e:
        print(f"\nError: {e}")
        
if __name__ == "__main__":
    main()