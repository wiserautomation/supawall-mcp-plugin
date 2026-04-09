"use strict";
// Copyright 2026 SupraWall Contributors
// SPDX-License-Identifier: Apache-2.0
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = initialize;
const axios_1 = __importDefault(require("axios"));
class SupraWallMCP {
    config;
    DEFAULT_API_URL = 'https://www.supra-wall.com/api/v1/evaluate';
    DEFAULT_DASHBOARD_URL = 'https://www.supra-wall.com';
    constructor(config) {
        this.config = {
            apiUrl: config.apiUrl || this.DEFAULT_API_URL,
            apiKey: config.apiKey
        };
    }
    async checkPolicy(request) {
        try {
            const response = await axios_1.default.post(this.config.apiUrl, {
                apiKey: this.config.apiKey,
                toolName: request.toolName,
                args: request.args,
                sessionId: request.sessionId,
                agentRole: request.agentRole
            });
            return {
                decision: response.data.decision,
                reason: response.data.reason,
                risk_score: response.data.risk_score || 0,
                requestId: response.data.requestId,
                approval_required: response.data.decision === 'REQUIRE_APPROVAL',
                branding: response.data.branding
            };
        }
        catch (error) {
            console.error('SupraWall policy check failed:', error instanceof Error ? error.message : String(error));
            // Security: Default to DENY on API failure (Fail-Closed)
            return {
                decision: 'DENY',
                reason: 'SupraWall Safety Layer unreachable (Fail-Closed for Security)',
                risk_score: 100,
                approval_required: false
            };
        }
    }
    async requestApproval(request) {
        try {
            // Note: In the current backend, approvals are primarily triggered via evaluateAction
            // returning REQUIRE_APPROVAL. This manual trigger uses evaluateAction with a flag.
            const response = await axios_1.default.post(this.config.apiUrl, {
                apiKey: this.config.apiKey,
                toolName: request.toolName,
                args: request.args,
                forceApproval: true,
                reason: request.reason
            });
            const requestId = response.data.requestId;
            return {
                requestId: requestId,
                status: response.data.decision === 'REQUIRE_APPROVAL' ? 'pending' : 'decided',
                dashboard_url: `${this.DEFAULT_DASHBOARD_URL}/dashboard/approvals`
            };
        }
        catch (error) {
            console.error('SupraWall approval request failed:', error instanceof Error ? error.message : String(error));
            throw new Error('Failed to request approval');
        }
    }
    async logAction(request) {
        try {
            await axios_1.default.post(this.config.apiUrl, {
                apiKey: this.config.apiKey,
                toolName: request.toolName || request.action,
                args: request.args ?? {},
                logOnly: true,
                outcome: request.outcome
            });
            return { success: true };
        }
        catch (error) {
            console.error('SupraWall audit log failed:', error instanceof Error ? error.message : String(error));
            return { success: false };
        }
    }
}
// MCP Plugin exports
async function initialize(config) {
    const suprawall = new SupraWallMCP(config);
    return {
        name: 'suprawall',
        version: '1.1.0',
        tools: {
            check_policy: suprawall.checkPolicy.bind(suprawall),
            request_approval: suprawall.requestApproval.bind(suprawall),
            log_action: suprawall.logAction.bind(suprawall)
        }
    };
}
