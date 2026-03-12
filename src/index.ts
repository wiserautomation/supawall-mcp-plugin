import axios from 'axios';

interface AgentGateConfig {
  apiKey: string;
  apiUrl: string;
}

interface PolicyCheckRequest {
  agent_id: string;
  tool_name: string;
  parameters?: any;
}

interface ApprovalRequest {
  agent_id: string;
  action_description: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface AuditLogRequest {
  agent_id: string;
  action: string;
  outcome: 'allowed' | 'denied' | 'approved';
}

class AgentGateMCP {
  private config: AgentGateConfig;
  
  constructor(config: AgentGateConfig) {
    this.config = {
      apiUrl: config.apiUrl || 'https://api.agentgate.com',
      apiKey: config.apiKey
    };
  }
  
  async checkPolicy(request: PolicyCheckRequest) {
    try {
      const response = await axios.post(
        `${this.config.apiUrl}/v1/policy/check`,
        {
          agent_id: request.agent_id,
          tool_name: request.tool_name,
          parameters: request.parameters || {}
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        decision: response.data.decision,
        reason: response.data.reason,
        risk_score: response.data.risk_score,
        approval_required: response.data.decision === 'REQUIRE_APPROVAL'
      };
    } catch (error) {
      console.error('AgentGate policy check failed:', error);
      // Fail open - allow action if service is down
      return {
        decision: 'ALLOW',
        reason: 'Policy service unavailable',
        risk_score: 0,
        approval_required: false
      };
    }
  }
  
  async requestApproval(request: ApprovalRequest) {
    try {
      const response = await axios.post(
        `${this.config.apiUrl}/v1/approvals/request`,
        {
          agent_id: request.agent_id,
          action_description: request.action_description,
          risk_level: request.risk_level
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        approval_id: response.data.approval_id,
        status: response.data.status,
        dashboard_url: `${this.config.apiUrl.replace('api.', 'app.')}/approvals/${response.data.approval_id}`
      };
    } catch (error) {
      console.error('AgentGate approval request failed:', error);
      throw new Error('Failed to request approval');
    }
  }
  
  async logAction(request: AuditLogRequest) {
    try {
      await axios.post(
        `${this.config.apiUrl}/v1/audit/log`,
        {
          agent_id: request.agent_id,
          action: request.action,
          outcome: request.outcome,
          timestamp: new Date().toISOString()
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return { success: true };
    } catch (error) {
      console.error('AgentGate audit log failed:', error);
      // Don't throw - logging failures shouldn't block operations
      return { success: false };
    }
  }
}

// MCP Plugin exports
export default async function initialize(config: AgentGateConfig) {
  const agentgate = new AgentGateMCP(config);
  
  return {
    name: 'agentgate',
    version: '1.0.0',
    tools: {
      check_policy: agentgate.checkPolicy.bind(agentgate),
      request_approval: agentgate.requestApproval.bind(agentgate),
      log_action: agentgate.logAction.bind(agentgate)
    }
  };
}
