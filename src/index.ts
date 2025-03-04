#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { FreeAgentClient } from './freeagent-client.js';
import { TimeslipAttributes } from './types.js';

const CLIENT_ID = process.env.FREEAGENT_CLIENT_ID as string;
const CLIENT_SECRET = process.env.FREEAGENT_CLIENT_SECRET as string;
const ACCESS_TOKEN = process.env.FREEAGENT_ACCESS_TOKEN as string;
const REFRESH_TOKEN = process.env.FREEAGENT_REFRESH_TOKEN as string;

if (!CLIENT_ID || !CLIENT_SECRET || !ACCESS_TOKEN || !REFRESH_TOKEN) {
  throw new Error('Missing required environment variables for FreeAgent authentication');
}

function validateTimeslipAttributes(data: unknown): TimeslipAttributes {
  if (typeof data !== 'object' || !data) {
    throw new Error('Invalid timeslip data: must be an object');
  }

  const attrs = data as Record<string, unknown>;

  if (typeof attrs.task !== 'string' ||
    typeof attrs.user !== 'string' ||
    typeof attrs.project !== 'string' ||
    typeof attrs.dated_on !== 'string' ||
    typeof attrs.hours !== 'string') {
    throw new Error('Invalid timeslip data: missing required fields');
  }

  return {
    task: attrs.task,
    user: attrs.user,
    project: attrs.project,
    dated_on: attrs.dated_on,
    hours: attrs.hours,
    comment: attrs.comment as string | undefined
  };
}

class FreeAgentServer {
  private server: Server;
  private client: FreeAgentClient;

  constructor() {
    console.error('[Setup] Initializing FreeAgent MCP server...');

    this.client = new FreeAgentClient({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      accessToken: ACCESS_TOKEN,
      refreshToken: REFRESH_TOKEN
    });

    this.server = new Server(
      {
        name: 'freeagent-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();

    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_timeslips',
          description: 'List timeslips with optional filtering',
          inputSchema: {
            type: 'object',
            properties: {
              from_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
              to_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
              updated_since: { type: 'string', description: 'ISO datetime' },
              view: {
                type: 'string',
                enum: ['all', 'unbilled', 'running'],
                description: 'Filter view type'
              },
              user: { type: 'string', description: 'Filter by user URL' },
              task: { type: 'string', description: 'Filter by task URL' },
              project: { type: 'string', description: 'Filter by project URL' },
              nested: { type: 'boolean', description: 'Include nested resources' }
            }
          }
        },
        {
          name: 'get_timeslip',
          description: 'Get a single timeslip by ID',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Timeslip ID' }
            },
            required: ['id']
          }
        },
        {
          name: 'create_timeslip',
          description: 'Create a new timeslip',
          inputSchema: {
            type: 'object',
            properties: {
              task: { type: 'string', description: 'Task URL' },
              user: { type: 'string', description: 'User URL' },
              project: { type: 'string', description: 'Project URL' },
              dated_on: { type: 'string', description: 'Date (YYYY-MM-DD)' },
              hours: { type: 'string', description: 'Hours worked (e.g. "1.5")' },
              comment: { type: 'string', description: 'Optional comment' }
            },
            required: ['task', 'user', 'project', 'dated_on', 'hours']
          }
        },
        {
          name: 'update_timeslip',
          description: 'Update an existing timeslip',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Timeslip ID' },
              task: { type: 'string', description: 'Task URL' },
              user: { type: 'string', description: 'User URL' },
              project: { type: 'string', description: 'Project URL' },
              dated_on: { type: 'string', description: 'Date (YYYY-MM-DD)' },
              hours: { type: 'string', description: 'Hours worked (e.g. "1.5")' },
              comment: { type: 'string', description: 'Optional comment' }
            },
            required: ['id']
          }
        },
        {
          name: 'delete_timeslip',
          description: 'Delete a timeslip',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Timeslip ID' }
            },
            required: ['id']
          }
        },
        {
          name: 'start_timer',
          description: 'Start a timer for a timeslip',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Timeslip ID' }
            },
            required: ['id']
          }
        },
        {
          name: 'stop_timer',
          description: 'Stop a running timer for a timeslip',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Timeslip ID' }
            },
            required: ['id']
          }
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      console.error(`[Tool] Executing ${request.params.name}:`, request.params.arguments);

      try {
        switch (request.params.name) {
          case 'list_timeslips': {
            const timeslips = await this.client.listTimeslips(request.params.arguments);
            return {
              content: [{ type: 'text', text: JSON.stringify(timeslips, null, 2) }]
            };
          }

          case 'get_timeslip': {
            const { id } = request.params.arguments as { id: string };
            const timeslip = await this.client.getTimeslip(id);
            return {
              content: [{ type: 'text', text: JSON.stringify(timeslip, null, 2) }]
            };
          }

          case 'create_timeslip': {
            const attributes = validateTimeslipAttributes(request.params.arguments);
            const timeslip = await this.client.createTimeslip(attributes);
            return {
              content: [{ type: 'text', text: JSON.stringify(timeslip, null, 2) }]
            };
          }

          case 'update_timeslip': {
            const { id, ...updates } = request.params.arguments as { id: string } & Record<string, unknown>;
            // Only include valid update fields
            const validUpdates: Partial<TimeslipAttributes> = {};
            if (typeof updates.task === 'string') validUpdates.task = updates.task;
            if (typeof updates.user === 'string') validUpdates.user = updates.user;
            if (typeof updates.project === 'string') validUpdates.project = updates.project;
            if (typeof updates.dated_on === 'string') validUpdates.dated_on = updates.dated_on;
            if (typeof updates.hours === 'string') validUpdates.hours = updates.hours;
            if (typeof updates.comment === 'string') validUpdates.comment = updates.comment;

            const timeslip = await this.client.updateTimeslip(id, validUpdates);
            return {
              content: [{ type: 'text', text: JSON.stringify(timeslip, null, 2) }]
            };
          }

          case 'delete_timeslip': {
            const { id } = request.params.arguments as { id: string };
            await this.client.deleteTimeslip(id);
            return {
              content: [{ type: 'text', text: 'Timeslip deleted successfully' }]
            };
          }

          case 'start_timer': {
            const { id } = request.params.arguments as { id: string };
            const timeslip = await this.client.startTimer(id);
            return {
              content: [{ type: 'text', text: JSON.stringify(timeslip, null, 2) }]
            };
          }

          case 'stop_timer': {
            const { id } = request.params.arguments as { id: string };
            const timeslip = await this.client.stopTimer(id);
            return {
              content: [{ type: 'text', text: JSON.stringify(timeslip, null, 2) }]
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error: any) {
        console.error(`[Error] Tool ${request.params.name} failed:`, error);
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('FreeAgent MCP server running on stdio');
  }
}

const server = new FreeAgentServer();
server.run().catch(console.error);
