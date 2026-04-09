"use strict";
// Copyright 2026 SupraWall Contributors
// SPDX-License-Identifier: Apache-2.0
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const API_KEY = process.env.SUPRAWALL_API_KEY;
const API_URL = process.env.SUPRAWALL_API_URL || 'https://www.supra-wall.com/api/v1';
if (!API_KEY) {
    console.error('Error: SUPRAWALL_API_KEY environment variable is required.');
    process.exit(1);
}
const server = new index_js_1.Server({
    name: 'suprawall-mcp',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'check_policy',
                description: 'Check if an AI action complies with configured compliance policies',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: { type: 'string', description: 'The action to evaluate for compliance' },
                        context: { type: 'object', description: 'Additional context about the action' },
                    },
                    required: ['action'],
                },
            },
            {
                name: 'request_approval',
                description: 'Request human approval for a potentially sensitive action',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: { type: 'string', description: 'The action requesting approval' },
                        reason: { type: 'string', description: 'Why human approval is needed' },
                        urgency: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Urgency level for approval' },
                    },
                    required: ['action', 'reason'],
                },
            },
        ],
    };
});
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'check_policy': {
                const response = await axios_1.default.post(`${API_URL}/evaluate`, {
                    apiKey: API_KEY,
                    toolName: args?.action,
                    args: args?.context || {},
                    source: "mcp-claude"
                });
                return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
            }
            case 'request_approval': {
                const response = await axios_1.default.post(`${API_URL}/evaluate`, {
                    apiKey: API_KEY,
                    forceApproval: true,
                    toolName: args?.action,
                    args: {
                        ...(args?.context || {}),
                        reason: args?.reason,
                        urgency: args?.urgency
                    },
                    source: "mcp-claude"
                });
                return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        const errorDetail = error.response?.data || error.message;
        return {
            isError: true,
            content: [{ type: 'text', text: JSON.stringify(errorDetail, null, 2) }],
        };
    }
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('SupraWall MCP server running on stdio');
}
main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
