# FreeAgent MCP Server

A Claude MCP (Model Context Protocol) server for managing FreeAgent timeslips and timers. This server allows Claude to interact with your FreeAgent account to track time, manage timers, and handle timeslip operations.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- List and filter timeslips with nested data
- Create new timeslips
- Update existing timeslips
- Start and stop timers
- Delete timeslips
- Automatic OAuth token refresh
- Comprehensive error handling

## Prerequisites

- Node.js 18+
- A FreeAgent account with API access
- OAuth credentials from the [FreeAgent Developer Dashboard](https://dev.freeagent.com)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/freeagent-mcp.git
cd freeagent-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Get your OAuth tokens:
```bash
# Set your FreeAgent credentials
export FREEAGENT_CLIENT_ID="your_client_id"
export FREEAGENT_CLIENT_SECRET="your_client_secret"

# Run the OAuth setup script
node scripts/get-oauth-tokens.js
```

4. Add the server to your MCP settings (typically in `%APPDATA%/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`):
```json
{
  "mcpServers": {
    "freeagent": {
      "command": "node",
      "args": ["path/to/freeagent-mcp/build/index.js"],
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

## Usage

Once configured, Claude can use the following tools:

### List Timeslips
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

### Create Timeslip
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

### Timer Controls
```javascript
// Start timer
{
  "id": "123"
}

// Stop timer
{
  "id": "123"
}
```

## Development

```bash
# Build the project
npm run build

# Watch for changes
npm run watch

# Run tests (when implemented)
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -am 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- FreeAgent for their excellent API documentation
- The Claude team for the MCP SDK
