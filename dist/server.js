import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.SUPRAWALL_API_KEY;
const API_URL = process.env.SUPRAWALL_API_URL || 'https://www.supra-wall.com/api/v1';
if (!API_KEY) {
    console.error('Error: SUPRAWALL_API_KEY environment variable is required.');
    process.exit(1);
}
const server = new Server({
    name: 'suprawall',
    version: '1.1.0',
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'check_policy',
                description: 'Check if an action is allowed by security policies',
                inputSchema: {
                    type: 'object',
                    properties: {
                        toolName: { type: 'string', description: 'Name of the tool/action to check' },
                        args: { type: 'object', description: 'Parameters for the action' },
                        agentRole: { type: 'string', description: 'Role of the agent' },
                        sessionId: { type: 'string', description: 'Unique session identifier' },
                    },
                    required: ['toolName', 'args'],
                },
            },
            {
                name: 'request_approval',
                description: 'Request human approval for a high-risk action',
                inputSchema: {
                    type: 'object',
                    properties: {
                        toolName: { type: 'string', description: 'Name of the tool requiring approval' },
                        args: { type: 'object', description: 'Arguments of the tool' },
                        reason: { type: 'string', description: 'Reason for requesting approval' },
                    },
                    required: ['toolName', 'args', 'reason'],
                },
            },
            {
                name: 'log_action',
                description: 'Log an agent action to the audit trail',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: { type: 'string', description: 'Action performed' },
                        toolName: { type: 'string', description: 'Tool used (optional)' },
                        args: { type: 'object', description: 'Arguments used (optional)' },
                        outcome: { type: 'string', enum: ['allowed', 'denied', 'approved'], description: 'Outcome of the action' },
                    },
                    required: ['action', 'outcome'],
                },
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'check_policy': {
                const response = await axios.post(`${API_URL}/evaluateAction`, {
                    apiKey: API_KEY,
                    ...args
                });
                return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
            }
            case 'request_approval': {
                const response = await axios.post(`${API_URL}/evaluateAction`, {
                    apiKey: API_KEY,
                    forceApproval: true,
                    ...args
                });
                return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
            }
            case 'log_action': {
                const response = await axios.post(`${API_URL}/evaluateAction`, {
                    apiKey: API_KEY,
                    logOnly: true,
                    ...args
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
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('SupraWall MCP server running on stdio');
}
main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
