#!/usr/bin/env python3
import requests
import json

# Test the info endpoint
print("Testing info endpoint...")
resp = requests.get("http://localhost:3456/")
print(f"Info: {resp.json()}")

# Test the health endpoint
print("\nTesting health endpoint...")
resp = requests.get("http://localhost:3456/health")
print(f"Health: {resp.json()}")

# Test SSE connection
print("\nTesting SSE connection...")
resp = requests.get("http://localhost:3456/sse", stream=True, headers={'Accept': 'text/event-stream'})
print(f"SSE Response status: {resp.status_code}")
print(f"SSE Response headers: {dict(resp.headers)}")

# Read first few events
print("\nFirst few SSE events:")
for i, line in enumerate(resp.iter_lines()):
    if i > 10:  # Only show first few lines
        break
    if line:
        print(f"Line {i}: {line.decode('utf-8')}")