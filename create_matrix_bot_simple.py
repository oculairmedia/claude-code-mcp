#!/usr/bin/env python3
"""
Simple script to create a Matrix bot account using the existing Matrix API service
"""

import requests
import json
import sys
import argparse
import getpass

def create_bot_via_api(api_url, username, password, display_name=None):
    """Create a Matrix bot using the Matrix API service"""
    
    # First, try to login with admin credentials to get a token
    print("Getting admin access token...")
    
    # Use the known admin credentials from the environment
    admin_login_data = {
        "username": "@matrixadmin:matrix.oculair.ca",
        "password": "admin123"
    }
    
    try:
        # Login as admin
        response = requests.post(f"{api_url}/login", json=admin_login_data)
        if response.status_code != 200:
            print(f"Failed to login as admin: {response.status_code}")
            print(response.json())
            return None
            
        admin_token = response.json().get("access_token")
        print("✓ Got admin access token")
        
        # Now create the bot user using admin token
        print(f"\nCreating bot account '{username}'...")
        
        create_user_url = f"{api_url}/admin/users/@{username}:matrix.oculair.ca"
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        user_data = {
            "password": password,
            "displayname": display_name or f"Bot {username}",
            "admin": False,
            "deactivated": False
        }
        
        response = requests.put(create_user_url, headers=headers, json=user_data)
        
        if response.status_code in [200, 201]:
            print(f"✓ Successfully created bot account: @{username}:matrix.oculair.ca")
            
            # Now login as the bot to get its access token
            bot_login_data = {
                "username": f"@{username}:matrix.oculair.ca",
                "password": password
            }
            
            response = requests.post(f"{api_url}/login", json=bot_login_data)
            if response.status_code == 200:
                bot_data = response.json()
                print(f"✓ Successfully logged in as bot!")
                
                return {
                    "user_id": f"@{username}:matrix.oculair.ca",
                    "access_token": bot_data.get("access_token"),
                    "homeserver": "matrix.oculair.ca"
                }
            else:
                print(f"Failed to login as bot: {response.status_code}")
                print(response.json())
                return None
        else:
            print(f"Failed to create bot account: {response.status_code}")
            print(response.json())
            return None
            
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Create a Matrix bot account via Matrix API service")
    parser.add_argument("--api-url", default="http://localhost:8004", 
                        help="Matrix API service URL (default: http://localhost:8004)")
    parser.add_argument("--username", required=True, help="Bot username (without @domain)")
    parser.add_argument("--password", help="Bot password (will prompt if not provided)")
    parser.add_argument("--display-name", help="Bot display name")
    
    args = parser.parse_args()
    
    # Get password if not provided
    if not args.password:
        args.password = getpass.getpass("Enter bot password: ")
    
    # Create the bot account
    result = create_bot_via_api(args.api_url, args.username, args.password, args.display_name)
    
    if result:
        print("\n=== Bot Account Created Successfully ===")
        print(f"User ID: {result['user_id']}")
        print(f"Access Token: {result['access_token']}")
        print(f"Homeserver: {result['homeserver']}")
        
        # Save to config file
        config = {
            "homeserver": "https://matrix.oculair.ca",
            "user_id": result['user_id'],
            "access_token": result['access_token'],
            "password": args.password
        }
        
        config_file = f"bot_{args.username}_config.json"
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"\nConfiguration saved to: {config_file}")
        print("\nYou can now use this access token to make API calls as the bot.")
        return 0
    else:
        print("\nFailed to create bot account.")
        return 1

if __name__ == "__main__":
    sys.exit(main())