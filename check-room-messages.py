#!/usr/bin/env python3
"""
Check messages in the test Matrix room
"""

import requests
import json

# Matrix server details
MATRIX_SERVER = "https://matrix.oculair.ca"
ADMIN_USER = "@matrixadmin:matrix.oculair.ca"
ADMIN_PASSWORD = "admin123"

def login(username, password):
    """Login to Matrix and get access token"""
    url = f"{MATRIX_SERVER}/_matrix/client/r0/login"
    data = {
        "type": "m.login.password",
        "user": username,
        "password": password
    }
    
    response = requests.post(url, json=data)
    if response.status_code == 200:
        return response.json()['access_token']
    else:
        raise Exception(f"Login failed: {response.text}")

def get_room_messages(access_token, room_id, limit=10):
    """Get recent messages from a room"""
    url = f"{MATRIX_SERVER}/_matrix/client/r0/rooms/{room_id}/messages"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {
        "dir": "b",  # backwards from most recent
        "limit": limit
    }
    
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to get messages: {response.text}")

def main():
    try:
        # Load room info
        with open('test-room-info.json', 'r') as f:
            room_info = json.load(f)
        room_id = room_info['room_id']
        
        # Login as admin
        print("Logging in as admin...")
        admin_token = login(ADMIN_USER, ADMIN_PASSWORD)
        
        # Get room messages
        print(f"\nGetting messages from room {room_id}...\n")
        messages = get_room_messages(admin_token, room_id)
        
        print("=== Recent Messages ===")
        for event in messages['chunk']:
            if event['type'] == 'm.room.message':
                sender = event['sender']
                content = event['content']
                print(f"\nFrom: {sender}")
                print(f"Type: {content.get('msgtype', 'unknown')}")
                print(f"Body: {content.get('body', 'No body')[:200]}...")
                if 'formatted_body' in content:
                    print("Has formatted body: Yes")
                print("-" * 50)
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()