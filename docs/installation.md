# Installation Guide

## Direct Installation
To install the AgentGate MCP plugin directly into your Claude Desktop environment:

1. Open Claude Desktop.
2. Enter the following command in the input field:
   ```bash
   /plugin marketplace add agentgate/agentgate-mcp-plugin
   ```

## Configuration
After installation, you must provide your API key to authenticate with the AgentGate platform.

1. Run the configuration command:
   ```bash
   /plugin configure agentgate
   ```
2. When prompted, paste your API key from the [AgentGate Dashboard](https://app.agentgate.com).

## Manual Configuration
If you prefer manual configuration, you can add the following to your `mcp_config.json`:

```json
{
  "mcpServers": {
    "agentgate": {
      "command": "node",
      "args": ["path/to/agentgate-mcp-plugin/dist/index.js"],
      "env": {
        "AGENTGATE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```
