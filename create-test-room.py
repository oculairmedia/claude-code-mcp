#!/usr/bin/env python3
"""
Create a test Matrix room and invite the Claude Code bot
"""

import requests
import json
import sys

# Matrix server details
MATRIX_SERVER = "https://matrix.oculair.ca"
ADMIN_USER = "@matrixadmin:matrix.oculair.ca"
ADMIN_PASSWORD = "admin123"
BOT_USER_ID = "@claudecode:matrix.oculair.ca"

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

def create_room(access_token, room_name, room_alias):
    """Create a new Matrix room"""
    url = f"{MATRIX_SERVER}/_matrix/client/r0/createRoom"
    headers = {"Authorization": f"Bearer {access_token}"}
    data = {
        "name": room_name,
        "room_alias_name": room_alias,
        "topic": "Test room for Claude Code MCP Matrix integration",
        "preset": "private_chat",
        "invite": [BOT_USER_ID]  # Invite the bot immediately
    }
    
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()['room_id']
    else:
        raise Exception(f"Room creation failed: {response.text}")

def main():
    try:
        # Login as admin
        print("Logging in as admin...")
        admin_token = login(ADMIN_USER, ADMIN_PASSWORD)
        print("✅ Logged in successfully")
        
        # Create test room
        room_alias = "claude-code-test"
        room_name = "Claude Code Test Room"
        
        print(f"\nCreating room '{room_name}'...")
        room_id = create_room(admin_token, room_name, room_alias)
        print(f"✅ Room created: {room_id}")
        print(f"✅ Room alias: #{room_alias}:matrix.oculair.ca")
        print(f"✅ Bot invited: {BOT_USER_ID}")
        
        print("\n=== Test Room Details ===")
        print(f"Room ID: {room_id}")
        print(f"Room Alias: #{room_alias}:matrix.oculair.ca")
        print(f"Bot User: {BOT_USER_ID}")
        print("\nThe bot should auto-join the room shortly.")
        print("\nYou can now use this room ID in your tests!")
        
        # Save room info for later use
        with open('test-room-info.json', 'w') as f:
            json.dump({
                'room_id': room_id,
                'room_alias': f"#{room_alias}:matrix.oculair.ca",
                'bot_user_id': BOT_USER_ID
            }, f, indent=2)
        print("\nRoom info saved to test-room-info.json")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()