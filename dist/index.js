#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { DatastoreClient } from './datastore.js';
const server = new Server({
    name: 'mcp-datastore-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const datastoreClient = new DatastoreClient();
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'datastore_list_kinds',
                description: 'List all available entity kinds (tables) in the Datastore',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'datastore_get',
                description: 'Get an entity by its key',
                inputSchema: {
                    type: 'object',
                    properties: {
                        kind: {
                            type: 'string',
                            description: 'The entity kind',
                        },
                        key: {
                            type: 'string',
                            description: 'The entity key (name or ID)',
                        },
                        parent: {
                            type: 'string',
                            description: 'Parent key if the entity has a parent (optional)',
                        },
                    },
                    required: ['kind', 'key'],
                },
            },
            {
                name: 'datastore_query',
                description: 'Execute a query on entities with optional filters',
                inputSchema: {
                    type: 'object',
                    properties: {
                        kind: {
                            type: 'string',
                            description: 'The entity kind to query',
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of results to return (default: 100)',
                        },
                        offset: {
                            type: 'number',
                            description: 'Number of results to skip (default: 0)',
                        },
                    },
                    required: ['kind'],
                },
            },
            {
                name: 'datastore_filter',
                description: 'Query entities with a simple equality filter on any field',
                inputSchema: {
                    type: 'object',
                    properties: {
                        kind: {
                            type: 'string',
                            description: 'The entity kind to query',
                        },
                        field: {
                            type: 'string',
                            description: 'The field name to filter on (can be key field or property)',
                        },
                        value: {
                            type: 'string',
                            description: 'The value to match exactly',
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of results to return (default: 100)',
                        },
                    },
                    required: ['kind', 'field', 'value'],
                },
            },
            {
                name: 'datastore_count',
                description: 'Count entities in a kind, optionally with a filter',
                inputSchema: {
                    type: 'object',
                    properties: {
                        kind: {
                            type: 'string',
                            description: 'The entity kind to count',
                        },
                        field: {
                            type: 'string',
                            description: 'The field name to filter on (optional)',
                        },
                        value: {
                            type: 'string',
                            description: 'The value to match exactly (required if field is provided)',
                        },
                    },
                    required: ['kind'],
                },
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;
        if (!args) {
            throw new Error('No arguments provided');
        }
        switch (name) {
            case 'datastore_list_kinds':
                const kinds = await datastoreClient.listKinds();
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Available entity kinds:\n${kinds.map((k) => `- ${k}`).join('\n')}`,
                        },
                    ],
                };
            case 'datastore_get':
                const entity = await datastoreClient.getEntity(args.kind, args.key, args.parent);
                return {
                    content: [
                        {
                            type: 'text',
                            text: entity ? JSON.stringify(entity, null, 2) : 'Entity not found',
                        },
                    ],
                };
            case 'datastore_query':
                const results = await datastoreClient.queryEntities(args.kind, args.limit, args.offset);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(results, null, 2),
                        },
                    ],
                };
            case 'datastore_filter':
                const filteredResults = await datastoreClient.filterEntities(args.kind, args.field, args.value, args.limit);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(filteredResults, null, 2),
                        },
                    ],
                };
            case 'datastore_count':
                const count = await datastoreClient.countEntities(args.kind, args.field, args.value);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Count: ${count}`,
                        },
                    ],
                };
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                },
            ],
            isError: true,
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('MCP Datastore server running on stdio');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
