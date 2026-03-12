# AgentGate MCP Plugin

Add enterprise-grade security to your Claude Desktop agents.

## What it does

- ✅ **Block dangerous actions** - Prevent agents from executing risky operations
- ✅ **Require human approval** - Get Slack notifications for high-risk actions
- ✅ **Audit everything** - Compliance-ready logs for SOC2/GDPR
- ✅ **Zero config** - Works out of the box with sensible defaults

## Installation

### 1. Install the plugin

```bash
# In Claude Desktop, run:
/plugin marketplace add agentgate/agentgate-mcp-plugin
```

### 2. Get your API key
1. Sign up at [app.agentgate.com](https://app.agentgate.com)
2. Create an agent identity
3. Copy your API key

### 3. Configure the plugin
```bash
/plugin configure agentgate
# Enter your API key when prompted
```

## Usage
AgentGate automatically secures your Claude Desktop agents. No code changes needed!

### Example: Block dangerous commands
**You:** Delete all files in /production
**Claude:** I'll check with AgentGate first...
        🛡️ AgentGate blocked this action
        Reason: Destructive operation requires approval

### Example: Require approval for high-value actions
**You:** Process a $5,000 refund for order #12345
**Claude:** AgentGate requires approval for this action
        📧 Notification sent to admin@yourcompany.com
        ⏳ Waiting for approval...
        
        [Admin clicks "Approve" in Slack]
        
        ✅ Approved! Processing refund...

## Available Tools

### check_policy
Check if an action is allowed:

```typescript
{
  "agent_id": "agent_abc123",
  "tool_name": "delete_database",
  "parameters": { "database": "production" }
}
```

Returns:
```json
{
  "decision": "DENY",
  "reason": "Destructive actions require approval",
  "risk_score": 95
}
```

### request_approval
Request human approval:

```typescript
{
  "agent_id": "agent_abc123",
  "action_description": "Delete production database",
  "risk_level": "critical"
}
```

Returns:
```json
{
  "approval_id": "apr_xyz789",
  "status": "pending",
  "dashboard_url": "https://app.agentgate.com/approvals/apr_xyz789"
}
```

### log_action
Log to audit trail:

```typescript
{
  "agent_id": "agent_abc123",
  "action": "sent_email",
  "outcome": "allowed"
}
```

## Configuration
Configure via environment variables or Claude Desktop settings:
- `AGENTGATE_API_KEY` - Your API key (required)
- `AGENTGATE_API_URL` - API endpoint (default: `https://api.agentgate.com`)

## Pricing
- **Free**: 10,000 policy checks/month
- **Pro ($99/mo)**: 100,000 policy checks/month
- **Enterprise**: Custom

[View pricing →](https://agentgate.com/pricing)

## Support
- 📧 Email: support@agentgate.com
- 💬 Slack: [Join our community](https://join.slack.com/agentgate)
- 📚 Docs: [agentgate.com/docs](https://agentgate.com/docs)

## License
MIT

Made by **AgentGate** - The Stripe of AI Agent Security
