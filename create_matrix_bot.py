#!/usr/bin/env python3
"""
Create a Matrix bot account and obtain access token
"""

import requests
import hashlib
import hmac
import json
import sys
import argparse
import getpass

def create_bot_account(homeserver_url, username, password, display_name=None, admin=False, registration_secret=None):
    """Create a Matrix bot account using the Synapse admin API"""
    
    # Method 1: Try using registration shared secret if provided
    if registration_secret:
        print(f"Creating bot account '{username}' using registration shared secret...")
        
        try:
            # Get nonce
            nonce_response = requests.get(f"{homeserver_url}/_synapse/admin/v1/register")
            if nonce_response.status_code != 200:
                print(f"Failed to get nonce: {nonce_response.status_code}")
                return None
                
            nonce = nonce_response.json()["nonce"]
            
            # Create MAC
            mac_content = f"{nonce}\0{username}\0{password}\0{'admin' if admin else 'notadmin'}"
            mac = hmac.new(
                registration_secret.encode('utf8'),
                mac_content.encode('utf8'),
                hashlib.sha1
            ).hexdigest()
            
            # Register user
            register_data = {
                "nonce": nonce,
                "username": username,
                "password": password,
                "admin": admin,
                "mac": mac
            }
            
            response = requests.post(
                f"{homeserver_url}/_synapse/admin/v1/register",
                json=register_data
            )
            
            if response.status_code == 200:
                print(f"✓ Successfully created bot account: @{username}:matrix.oculair.ca")
                user_data = response.json()
                
                # Now login to get access token
                return login_and_get_token(homeserver_url, username, password, display_name)
            else:
                print(f"Failed to create account: {response.status_code}")
                print(response.json())
                return None
                
        except Exception as e:
            print(f"Error creating account with shared secret: {e}")
            return None
    
    # Method 2: Try using admin token
    print("No registration secret provided. Account creation requires admin privileges.")
    print("Please use an existing admin account to create the bot account.")
    return None

def login_and_get_token(homeserver_url, username, password, display_name=None):
    """Login to Matrix and get access token"""
    
    print(f"\nLogging in as '{username}'...")
    
    # Prepare login data
    login_data = {
        "type": "m.login.password",
        "identifier": {
            "type": "m.id.user",
            "user": username
        },
        "password": password,
        "device_id": f"bot_{username}",
        "initial_device_display_name": display_name or f"Bot {username}"
    }
    
    try:
        response = requests.post(
            f"{homeserver_url}/_matrix/client/r0/login",
            json=login_data
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Successfully logged in!")
            print(f"\n=== Bot Account Details ===")
            print(f"User ID: {data.get('user_id')}")
            print(f"Access Token: {data.get('access_token')}")
            print(f"Device ID: {data.get('device_id')}")
            print(f"Home Server: {data.get('home_server')}")
            
            # Set display name if provided
            if display_name and data.get('access_token'):
                set_display_name(homeserver_url, data.get('user_id'), display_name, data.get('access_token'))
            
            return data
        else:
            print(f"Login failed: {response.status_code}")
            print(response.json())
            return None
            
    except Exception as e:
        print(f"Error during login: {e}")
        return None

def set_display_name(homeserver_url, user_id, display_name, access_token):
    """Set display name for the bot account"""
    
    try:
        response = requests.put(
            f"{homeserver_url}/_matrix/client/r0/profile/{user_id}/displayname",
            headers={"Authorization": f"Bearer {access_token}"},
            json={"displayname": display_name}
        )
        
        if response.status_code == 200:
            print(f"✓ Set display name to: {display_name}")
        else:
            print(f"Failed to set display name: {response.status_code}")
            
    except Exception as e:
        print(f"Error setting display name: {e}")

def main():
    parser = argparse.ArgumentParser(description="Create a Matrix bot account and obtain access token")
    parser.add_argument("--homeserver", default="http://localhost:8008", 
                        help="Matrix homeserver URL (default: http://localhost:8008)")
    parser.add_argument("--username", required=True, help="Bot username (without domain)")
    parser.add_argument("--password", help="Bot password (will prompt if not provided)")
    parser.add_argument("--display-name", help="Bot display name")
    parser.add_argument("--admin", action="store_true", help="Create as admin user")
    parser.add_argument("--registration-secret", help="Registration shared secret from homeserver.yaml")
    parser.add_argument("--login-only", action="store_true", 
                        help="Only login with existing account, don't create new one")
    
    args = parser.parse_args()
    
    # Get password if not provided
    if not args.password:
        args.password = getpass.getpass("Enter bot password: ")
    
    # Known registration secret from the create_admin.py file
    # You should replace this with the actual secret from your homeserver.yaml
    default_secret = "-XBDVT.:eZhMLVM_#Jt*@WQhehHQvIWf^4+7XSA2v;J6Mp:GK@"
    
    if args.login_only:
        # Just login with existing account
        result = login_and_get_token(args.homeserver, args.username, args.password, args.display_name)
    else:
        # Try to create account first
        registration_secret = args.registration_secret or default_secret
        result = create_bot_account(
            args.homeserver, 
            args.username, 
            args.password,
            args.display_name,
            args.admin,
            registration_secret
        )
    
    if result:
        print("\n=== Save these credentials ===")
        print(f"Username: @{args.username}:matrix.oculair.ca")
        print(f"Password: {args.password}")
        print(f"Access Token: {result.get('access_token')}")
        print("\nYou can use the access token for bot API calls without needing to login each time.")
        
        # Save to file
        bot_config = {
            "homeserver": args.homeserver,
            "user_id": result.get('user_id'),
            "access_token": result.get('access_token'),
            "device_id": result.get('device_id'),
            "password": args.password
        }
        
        config_file = f"bot_{args.username}_config.json"
        with open(config_file, 'w') as f:
            json.dump(bot_config, f, indent=2)
        print(f"\nConfiguration saved to: {config_file}")
        
        return 0
    else:
        return 1

if __name__ == "__main__":
    sys.exit(main())