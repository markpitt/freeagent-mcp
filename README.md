# FreeAgent MCP Server

An MCP server to interact with the FreeAgent API for managing timeslips and timers.

## Setup

1. Create a new application in the [FreeAgent Developer Dashboard](https://dev.freeagent.com)
   - Set the OAuth redirect URL to: `http://localhost:3000/oauth/callback`

2. Get your OAuth tokens:
   ```bash
   # Set your FreeAgent credentials
   export FREEAGENT_CLIENT_ID="your_client_id"
   export FREEAGENT_CLIENT_SECRET="your_client_secret"

   # Run the OAuth setup script
   node scripts/get-oauth-tokens.js
   ```

3. Add the server to your MCP settings (`c:\Users\markj\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`):
   ```json
   {
     "mcpServers": {
       "freeagent": {
         "command": "node",
         "args": ["D:/Personal/MCP/freeagent-mcp/build/index.js"],
         "env": {
           "FREEAGENT_CLIENT_ID": "your_client_id",
           "FREEAGENT_CLIENT_SECRET": "your_client_secret", 
           "FREEAGENT_ACCESS_TOKEN": "your_access_token",
           "FREEAGENT_REFRESH_TOKEN": "your_refresh_token"
         },
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

## Available Tools

### List Timeslips
List timeslips with optional filtering:
```javascript
{
  "from_date": "2024-01-01",      // Start date (YYYY-MM-DD)
  "to_date": "2024-03-04",        // End date (YYYY-MM-DD)
  "updated_since": "2024-03-04T12:00:00Z",  // ISO datetime
  "view": "all",                  // "all", "unbilled", or "running"
  "user": "https://api.freeagent.com/v2/users/123",
  "task": "https://api.freeagent.com/v2/tasks/456",
  "project": "https://api.freeagent.com/v2/projects/789",
  "nested": true                  // Include nested resources
}
```

### Get Single Timeslip
Get details for a specific timeslip:
```javascript
{
  "id": "123" // Timeslip ID
}
```

### Create Timeslip
Create a new timeslip:
```javascript
{
  "task": "https://api.freeagent.com/v2/tasks/123",
  "user": "https://api.freeagent.com/v2/users/456",
  "project": "https://api.freeagent.com/v2/projects/789",
  "dated_on": "2024-03-04",
  "hours": "1.5",
  "comment": "Optional comment"
}
```

### Update Timeslip
Update an existing timeslip:
```javascript
{
  "id": "123",
  "hours": "2.5",
  "comment": "Updated comment"
}
```

### Delete Timeslip
Delete a timeslip:
```javascript
{
  "id": "123"
}
```

### Start Timer
Start a timer for a timeslip:
```javascript
{
  "id": "123"
}
```

### Stop Timer
Stop a running timer:
```javascript
{
  "id": "123"
}
```

## Error Handling
- The server includes automatic token refresh when expired
- Comprehensive error logging
- Tool responses include error details when failures occur

## Development
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch for changes during development
npm run watch
