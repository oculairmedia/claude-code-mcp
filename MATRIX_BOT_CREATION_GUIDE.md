# Matrix Bot Account Creation Guide

## Overview
This guide explains how to create a Matrix bot account on the `matrix.oculair.ca` server and obtain an access token for API operations.

## Matrix Server Details
- **Server**: matrix.oculair.ca
- **Internal URL**: http://localhost:8008 (from within Docker network)
- **External URL**: https://matrix.oculair.ca
- **Admin Accounts**: 
  - `@matrixadmin:matrix.oculair.ca` (password: admin123)
  - `@admin:matrix.oculair.ca`
  - `@letta:matrix.oculair.ca` (password: letta)

## Method 1: Using the Registration Script (Recommended)

This method uses the Synapse registration shared secret to create a bot account directly.

```bash
cd /opt/stacks/claude-code-mcp

# Create a bot account
./create_matrix_bot.py \
  --username mybot \
  --password "SecurePassword123!" \
  --display-name "My Bot"

# Create an admin bot (with admin privileges)
./create_matrix_bot.py \
  --username adminbot \
  --password "SecurePassword123!" \
  --display-name "Admin Bot" \
  --admin

# Login only (if account already exists)
./create_matrix_bot.py \
  --username existingbot \
  --password "password" \
  --login-only
```

## Method 2: Using the Matrix API Service

This method uses the running Matrix API service and admin credentials.

```bash
cd /opt/stacks/claude-code-mcp

# Create a bot account via API service
./create_matrix_bot_simple.py \
  --username mybot \
  --password "SecurePassword123!" \
  --display-name "My Bot"
```

## Method 3: Manual Creation via cURL

### Step 1: Get a nonce for registration
```bash
curl -X GET http://localhost:8008/_synapse/admin/v1/register
```

### Step 2: Calculate the MAC
Using the registration shared secret: `-XBDVT.:eZhMLVM_#Jt*@WQhehHQvIWf^4+7XSA2v;J6Mp:GK@`

You need to create an HMAC-SHA1 of: `{nonce}\0{username}\0{password}\0{admin_status}`

### Step 3: Register the user
```bash
curl -X POST http://localhost:8008/_synapse/admin/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "nonce": "YOUR_NONCE",
    "username": "mybot",
    "password": "SecurePassword123!",
    "admin": false,
    "mac": "YOUR_CALCULATED_MAC"
  }'
```

### Step 4: Login to get access token
```bash
curl -X POST http://localhost:8008/_matrix/client/r0/login \
  -H "Content-Type: application/json" \
  -d '{
    "type": "m.login.password",
    "identifier": {
      "type": "m.id.user",
      "user": "mybot"
    },
    "password": "SecurePassword123!",
    "device_id": "bot_device",
    "initial_device_display_name": "My Bot Device"
  }'
```

## Method 4: Using Element Web UI

1. Open https://matrix.oculair.ca in your browser
2. Click "Create Account"
3. Fill in the registration form
4. After account creation, go to Settings → Help & About → Advanced
5. Find your Access Token in the session information

## Using the Bot Access Token

Once you have the access token, you can use it for API calls:

### Send a message
```bash
ACCESS_TOKEN="YOUR_ACCESS_TOKEN"
ROOM_ID="!room:matrix.oculair.ca"

curl -X POST "http://localhost:8008/_matrix/client/r0/rooms/${ROOM_ID}/send/m.room.message" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "msgtype": "m.text",
    "body": "Hello from bot!"
  }'
```

### Join a room
```bash
curl -X POST "http://localhost:8008/_matrix/client/r0/rooms/${ROOM_ID}/join" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### List joined rooms
```bash
curl -X GET "http://localhost:8008/_matrix/client/r0/joined_rooms" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

## Bot Configuration File

After creating a bot, a configuration file is saved as `bot_{username}_config.json`:

```json
{
  "homeserver": "https://matrix.oculair.ca",
  "user_id": "@mybot:matrix.oculair.ca",
  "access_token": "syt_bXlib3Q_xxxxxxxxxxxxxxxxxxxxx_xxxxxx",
  "device_id": "bot_mybot",
  "password": "SecurePassword123!"
}
```

## Integration with Existing Services

### MCP Server Integration
The Matrix MCP server at port 8016 provides pre-authenticated tools:
- `matrix_send_message`
- `matrix_list_rooms`
- `matrix_read_room`
- `matrix_join_room`
- `matrix_create_room`

### Letta Agent Integration
Letta agents automatically get Matrix accounts created via the agent_user_manager.py service.

### GMMessages Bridge
The bot can interact with SMS/RCS messages through the mautrix-gmessages bridge.

## Troubleshooting

### Check if Matrix services are running
```bash
cd /opt/stacks/matrix-synapse-deployment
docker-compose ps
```

### View Matrix API logs
```bash
docker logs matrix-synapse-deployment-matrix-api-1
```

### Test bot login
```bash
curl -X POST http://localhost:8004/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "@mybot:matrix.oculair.ca",
    "password": "password"
  }'
```

### Common Issues

1. **"User already exists"**: The username is taken. Choose a different one.
2. **"Invalid MAC"**: The registration shared secret might be wrong or the MAC calculation is incorrect.
3. **"Connection refused"**: Make sure the Matrix services are running.
4. **"Unauthorized"**: The access token has expired or is invalid. Login again to get a new token.

## Security Notes

- Store bot credentials securely
- Use strong, unique passwords
- Rotate access tokens periodically
- Limit bot permissions to only what's necessary
- Consider using encrypted storage for configuration files

## Next Steps

1. Create your bot account using one of the methods above
2. Save the access token securely
3. Test the bot by sending a message to a room
4. Integrate the bot into your application using the access token
5. Set up proper error handling and token refresh logic