interface SupraWallConfig {
    apiKey: string;
    apiUrl?: string;
}
interface PolicyCheckRequest {
    agentRole?: string;
    toolName: string;
    args: Record<string, unknown>;
    sessionId?: string;
}
interface ApprovalRequest {
    toolName: string;
    args: Record<string, unknown>;
    reason: string;
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}
interface AuditLogRequest {
    action: string;
    toolName?: string;
    args?: Record<string, unknown>;
    outcome: 'allowed' | 'denied' | 'approved';
}
export default function initialize(config: SupraWallConfig): Promise<{
    name: string;
    version: string;
    tools: {
        check_policy: (request: PolicyCheckRequest) => Promise<{
            decision: any;
            reason: any;
            risk_score: any;
            requestId: any;
            approval_required: boolean;
            branding: any;
        } | {
            decision: string;
            reason: string;
            risk_score: number;
            approval_required: boolean;
            requestId?: undefined;
            branding?: undefined;
        }>;
        request_approval: (request: ApprovalRequest) => Promise<{
            requestId: any;
            status: string;
            dashboard_url: string;
        }>;
        log_action: (request: AuditLogRequest) => Promise<{
            success: boolean;
        }>;
    };
}>;
export {};
