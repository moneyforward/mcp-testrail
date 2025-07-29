# Configuration Examples

## Environment Variables

Create a `.env` file in the root directory:

```env
TESTRAIL_URL=https://your-company.testrail.io
TESTRAIL_USERNAME=your-email@company.com
TESTRAIL_API_KEY=your-api-key
DEFAULT_PROJECT_ID=1
```

## Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "testrail": {
      "command": "node",
      "args": ["/path/to/mcp-testrail/dist/index.js"],
      "env": {
        "TESTRAIL_URL": "https://your-company.testrail.io",
        "TESTRAIL_USERNAME": "your-email@company.com",
        "TESTRAIL_API_KEY": "your-api-key",
        "DEFAULT_PROJECT_ID": "1"
      }
    }
  }
}
```

## VS Code MCP Extension Configuration

Add to your VS Code settings:

```json
{
  "mcp": {
    "servers": {
      "testrail": {
        "command": "node",
        "args": ["/path/to/mcp-testrail/dist/index.js"],
        "env": {
          "TESTRAIL_URL": "https://your-company.testrail.io",
          "TESTRAIL_USERNAME": "your-email@company.com",
          "TESTRAIL_API_KEY": "your-api-key"
        }
      }
    }
  }
}
```

## Global Installation

To make the server available globally:

1. Build the project:
   ```bash
   npm run build
   ```

2. Link globally:
   ```bash
   npm link
   ```

3. Use in Claude Desktop:
   ```json
   {
     "mcpServers": {
       "testrail": {
         "command": "mcp-testrail"
       }
     }
   }
   ``` 