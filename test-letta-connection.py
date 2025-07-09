#!/usr/bin/env python3
"""
Test connection to Letta MCP server to see what tools are available
"""

import requests
import json
import sseclient

def test_letta_mcp():
    base_url = "http://192.168.50.90:3001"
    
    print(f"Testing connection to Letta MCP at {base_url}")
    
    # Test basic connectivity
    try:
        resp = requests.get(base_url, timeout=5)
        print(f"Base URL response: {resp.status_code}")
        if resp.headers.get('content-type', '').startswith('application/json'):
            print(f"Server info: {resp.json()}")
    except Exception as e:
        print(f"Error connecting to base URL: {e}")
    
    # Try to establish SSE connection
    try:
        print("\nAttempting SSE connection...")
        sse_url = "http://192.168.50.90:3001/sse"
        resp = requests.get(sse_url, stream=True, headers={'Accept': 'text/event-stream'})
        print(f"SSE Response status: {resp.status_code}")
        
        client = sseclient.SSEClient(resp)
        
        # Look for endpoint event
        for event in client.events():
            print(f"Event type: {event.event}, Data: {event.data}")
            if event.event == 'endpoint':
                endpoint_data = json.loads(event.data)
                print(f"Got endpoint: {endpoint_data}")
                
                # Now we can try to initialize and list tools
                session_id = endpoint_data.get('sessionId')
                if session_id:
                    print(f"\nSession ID: {session_id}")
                    # Would continue with MCP protocol here
                    break
                
            # Only read first few events
            break
            
    except Exception as e:
        print(f"Error with SSE connection: {e}")

if __name__ == "__main__":
    test_letta_mcp()