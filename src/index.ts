#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { TestRailClient } from './testrail-client.js';
import { TestRailConfig } from './types.js';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration schema
const ConfigSchema = z.object({
  url: z.string().url(),
  username: z.string().email(),
  apiKey: z.string().min(1),
  defaultProjectId: z.number().optional(),
});

// Initialize configuration
function getConfig(): TestRailConfig {
  const config = {
    url: process.env.TESTRAIL_URL || '',
    username: process.env.TESTRAIL_USERNAME || '',
    apiKey: process.env.TESTRAIL_API_KEY || '',
    defaultProjectId: process.env.DEFAULT_PROJECT_ID ? parseInt(process.env.DEFAULT_PROJECT_ID) : undefined,
  };

  try {
    return ConfigSchema.parse(config);
  } catch (error) {
    console.error('Invalid configuration:', error);
    console.error('Please set TESTRAIL_URL, TESTRAIL_USERNAME, and TESTRAIL_API_KEY environment variables');
    process.exit(1);
  }
}

const config = getConfig();
const testRailClient = new TestRailClient(config);

// Create MCP server
const server = new Server(
  {
    name: 'testrail-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_projects',
        description: 'Get all TestRail projects',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_project',
        description: 'Get a specific TestRail project by ID',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: 'The ID of the project (optional: uses DEFAULT_PROJECT_ID if not provided)',
            },
          },
          required: [],
        },
      },
      {
        name: 'get_test_cases',
        description: 'Get test cases from a project, optionally filtered by suite or section',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: 'The ID of the project (optional: uses DEFAULT_PROJECT_ID if not provided)',
            },
            suiteId: {
              type: 'number',
              description: 'Optional: Filter by suite ID',
            },
            sectionId: {
              type: 'number',
              description: 'Optional: Filter by section ID',
            },
          },
          required: [],
        },
      },
      {
        name: 'create_test_case',
        description: 'Create a new test case',
        inputSchema: {
          type: 'object',
          properties: {
            sectionId: {
              type: 'number',
              description: 'The ID of the section to create the test case in',
            },
            title: {
              type: 'string',
              description: 'The title of the test case',
            },
            type_id: {
              type: 'number',
              description: 'Optional: The type ID (default: 1)',
            },
            priority_id: {
              type: 'number',
              description: 'Optional: The priority ID (1=Low, 2=Medium, 3=High, 4=Critical)',
            },
            estimate: {
              type: 'string',
              description: 'Optional: Time estimate',
            },
            refs: {
              type: 'string',
              description: 'Optional: References (e.g., requirements)',
            },
            custom_steps_separated: {
              type: 'array',
              description: 'Optional: Test steps',
            },
          },
          required: ['sectionId', 'title'],
        },
      },
      {
        name: 'get_test_runs',
        description: 'Get test runs for a project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: 'The ID of the project (optional: uses DEFAULT_PROJECT_ID if not provided)',
            },
          },
          required: [],
        },
      },
      {
        name: 'create_test_run',
        description: 'Create a new test run',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'number',
              description: 'The ID of the project (optional: uses DEFAULT_PROJECT_ID if not provided)',
            },
            name: {
              type: 'string',
              description: 'The name of the test run',
            },
            description: {
              type: 'string',
              description: 'Optional: Description of the test run',
            },
            suiteId: {
              type: 'number',
              description: 'Optional: The suite ID',
            },
            milestoneId: {
              type: 'number',
              description: 'Optional: The milestone ID',
            },
            assignedtoId: {
              type: 'number',
              description: 'Optional: User ID to assign the run to',
            },
            include_all: {
              type: 'boolean',
              description: 'Whether to include all test cases (default: true)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'add_test_result',
        description: 'Add a test result',
        inputSchema: {
          type: 'object',
          properties: {
            runId: {
              type: 'number',
              description: 'The ID of the test run',
            },
            caseId: {
              type: 'number',
              description: 'The ID of the test case',
            },
            status_id: {
              type: 'number',
              description: 'Status ID (1=Passed, 2=Blocked, 3=Untested, 4=Retest, 5=Failed)',
            },
            comment: {
              type: 'string',
              description: 'Optional: Comment about the result',
            },
            version: {
              type: 'string',
              description: 'Optional: Version tested',
            },
            elapsed: {
              type: 'string',
              description: 'Optional: Time elapsed (e.g., "5m" or "1h 30m")',
            },
            defects: {
              type: 'string',
              description: 'Optional: Bug/defect references',
            },
          },
          required: ['runId', 'caseId', 'status_id'],
        },
      },
      {
        name: 'get_users',
        description: 'Get all TestRail users',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'test_connection',
        description: 'Test the connection to TestRail',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'parse_testrail_url',
        description: 'Parse a TestRail URL and automatically call the appropriate tool',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The TestRail URL to parse (e.g., test case, test run, project URLs)',
            },
          },
          required: ['url'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_projects': {
        const projects = await testRailClient.getProjects();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(projects, null, 2),
            },
          ],
        };
      }

      case 'get_project': {
        const { projectId } = args as { projectId?: number };
        const finalProjectId = projectId || testRailClient.getDefaultProjectId();
        
        if (!finalProjectId) {
          throw new Error('No projectId provided and no DEFAULT_PROJECT_ID configured');
        }
        
        const project = await testRailClient.getProject(finalProjectId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(project, null, 2),
            },
          ],
        };
      }

      case 'get_test_cases': {
        const { projectId, suiteId, sectionId } = args as {
          projectId?: number;
          suiteId?: number;
          sectionId?: number;
        };
        const finalProjectId = projectId || testRailClient.getDefaultProjectId();
        
        if (!finalProjectId) {
          throw new Error('No projectId provided and no DEFAULT_PROJECT_ID configured');
        }
        
        const testCases = await testRailClient.getTestCases(finalProjectId, suiteId, sectionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(testCases, null, 2),
            },
          ],
        };
      }

      case 'create_test_case': {
        const { sectionId, ...caseData } = args as any;
        const testCase = await testRailClient.createTestCase(sectionId, caseData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(testCase, null, 2),
            },
          ],
        };
      }

      case 'get_test_runs': {
        const { projectId } = args as { projectId?: number };
        const finalProjectId = projectId || testRailClient.getDefaultProjectId();
        
        if (!finalProjectId) {
          throw new Error('No projectId provided and no DEFAULT_PROJECT_ID configured');
        }
        
        const testRuns = await testRailClient.getTestRuns(finalProjectId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(testRuns, null, 2),
            },
          ],
        };
      }

      case 'create_test_run': {
        const { projectId, ...runData } = args as any;
        const finalProjectId = projectId || testRailClient.getDefaultProjectId();
        
        if (!finalProjectId) {
          throw new Error('No projectId provided and no DEFAULT_PROJECT_ID configured');
        }
        
        const testRun = await testRailClient.createTestRun(finalProjectId, {
          include_all: true,
          ...runData,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(testRun, null, 2),
            },
          ],
        };
      }

      case 'add_test_result': {
        const { runId, caseId, ...resultData } = args as any;
        const result = await testRailClient.addTestResultForCase(runId, caseId, resultData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_users': {
        const users = await testRailClient.getUsers();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(users, null, 2),
            },
          ],
        };
      }

      case 'test_connection': {
        const isConnected = await testRailClient.testConnection();
        const defaultProjectId = testRailClient.getDefaultProjectId();
        
        let message = isConnected 
          ? 'Connection to TestRail successful!' 
          : 'Failed to connect to TestRail. Please check your configuration.';
          
        if (isConnected && defaultProjectId) {
          message += `\nDefault Project ID: ${defaultProjectId}`;
        } else if (isConnected) {
          message += '\nNo default project ID configured.';
        }
        
        return {
          content: [
            {
              type: 'text',
              text: message,
            },
          ],
        };
      }

      case 'parse_testrail_url': {
        const { url } = args as { url: string };
        
        try {
          const urlObj = new URL(url);
          const path = urlObj.pathname + urlObj.search;
          
          // Parse different TestRail URL patterns
          
          // Test Case View: /cases/view/{case_id}
          const caseViewMatch = path.match(/\/cases\/view\/(\d+)/);
          if (caseViewMatch) {
            const caseId = parseInt(caseViewMatch[1]);
            const testCase = await testRailClient.getTestCase(caseId);
            return {
              content: [
                {
                  type: 'text',
                  text: `Detected TestRail test case URL. Retrieved case ID ${caseId}:\n\n${JSON.stringify(testCase, null, 2)}`,
                },
              ],
            };
          }
          
          // Test Run View: /runs/view/{run_id}
          const runViewMatch = path.match(/\/runs\/view\/(\d+)/);
          if (runViewMatch) {
            const runId = parseInt(runViewMatch[1]);
            const testRun = await testRailClient.getTestRun(runId);
            return {
              content: [
                {
                  type: 'text',
                  text: `Detected TestRail test run URL. Retrieved run ID ${runId}:\n\n${JSON.stringify(testRun, null, 2)}`,
                },
              ],
            };
          }
          
          // Project View: /projects/overview/{project_id}
          const projectViewMatch = path.match(/\/projects\/overview\/(\d+)/);
          if (projectViewMatch) {
            const projectId = parseInt(projectViewMatch[1]);
            const project = await testRailClient.getProject(projectId);
            return {
              content: [
                {
                  type: 'text',
                  text: `Detected TestRail project URL. Retrieved project ID ${projectId}:\n\n${JSON.stringify(project, null, 2)}`,
                },
              ],
            };
          }
          
          // Test Cases List: /cases/{project_id}
          const casesListMatch = path.match(/\/cases\/(\d+)/);
          if (casesListMatch) {
            const projectId = parseInt(casesListMatch[1]);
            
            // Extract suite_id and section_id from query parameters if present
            const suiteId = urlObj.searchParams.get('suite_id') ? parseInt(urlObj.searchParams.get('suite_id')!) : undefined;
            const sectionId = urlObj.searchParams.get('section_id') ? parseInt(urlObj.searchParams.get('section_id')!) : undefined;
            
            const testCases = await testRailClient.getTestCases(projectId, suiteId, sectionId);
            let message = `Detected TestRail test cases list URL. Retrieved test cases for project ID ${projectId}`;
            if (suiteId) message += `, suite ID ${suiteId}`;
            if (sectionId) message += `, section ID ${sectionId}`;
            
            return {
              content: [
                {
                  type: 'text',
                  text: `${message}:\n\n${JSON.stringify(testCases, null, 2)}`,
                },
              ],
            };
          }
          
          // Test Runs List: /runs/{project_id}
          const runsListMatch = path.match(/\/runs\/(\d+)/);
          if (runsListMatch) {
            const projectId = parseInt(runsListMatch[1]);
            const testRuns = await testRailClient.getTestRuns(projectId);
            return {
              content: [
                {
                  type: 'text',
                  text: `Detected TestRail test runs list URL. Retrieved test runs for project ID ${projectId}:\n\n${JSON.stringify(testRuns, null, 2)}`,
                },
              ],
            };
          }
          
          // If no pattern matches, provide helpful message
          return {
            content: [
              {
                type: 'text',
                text: `URL parsed but no matching TestRail pattern found. Supported patterns:
- Test Case: /cases/view/{case_id}
- Test Run: /runs/view/{run_id}  
- Project: /projects/overview/{project_id}
- Test Cases List: /cases/{project_id}
- Test Runs List: /runs/{project_id}

Provided URL path: ${path}`,
              },
            ],
          };
          
        } catch (error) {
          throw new Error(`Failed to parse URL: ${error instanceof Error ? error.message : 'Invalid URL format'}`);
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'testrail://projects',
        name: 'TestRail Projects',
        description: 'List of all TestRail projects',
        mimeType: 'application/json',
      },
      {
        uri: 'testrail://users',
        name: 'TestRail Users',
        description: 'List of all TestRail users',
        mimeType: 'application/json',
      },
    ],
  };
});

// Handle resource requests
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    switch (uri) {
      case 'testrail://projects': {
        const projects = await testRailClient.getProjects();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(projects, null, 2),
            },
          ],
        };
      }

      case 'testrail://users': {
        const users = await testRailClient.getUsers();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(users, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to read resource ${uri}: ${errorMessage}`);
  }
});

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'test_case_template',
        description: 'Generate a test case template',
        arguments: [
          {
            name: 'feature',
            description: 'The feature being tested',
            required: true,
          },
          {
            name: 'priority',
            description: 'Priority level (Low, Medium, High, Critical)',
            required: false,
          },
        ],
      },
      {
        name: 'test_run_summary',
        description: 'Generate a test run summary report',
        arguments: [
          {
            name: 'projectId',
            description: 'The project ID',
            required: true,
          },
          {
            name: 'runId',
            description: 'The test run ID',
            required: true,
          },
        ],
      },
    ],
  };
});

// Handle prompt requests
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'test_case_template': {
      const feature = args?.feature || 'Feature Name';
      const priority = args?.priority || 'Medium';
      
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Create a comprehensive test case for the following feature: ${feature}
              
Priority: ${priority}

Please include:
1. Test Case Title
2. Description
3. Preconditions
4. Test Steps (numbered)
5. Expected Results
6. Post-conditions (if any)

Format the test case in a clear, structured way that follows testing best practices.`,
            },
          },
        ],
      };
    }

    case 'test_run_summary': {
      const projectId = args?.projectId;
      const runId = args?.runId;
      
      if (!projectId || !runId) {
        throw new Error('Both projectId and runId are required');
      }

      try {
        const testRun = await testRailClient.getTestRun(Number(runId));
        const project = await testRailClient.getProject(Number(projectId));
        
        const totalTests = testRun.passed_count + testRun.failed_count + testRun.blocked_count + testRun.untested_count + testRun.retest_count;
        const passRate = totalTests > 0 ? ((testRun.passed_count / totalTests) * 100).toFixed(1) : '0';
        
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Generate a comprehensive test run summary report for:

Project: ${project.name}
Test Run: ${testRun.name}
Status: ${testRun.is_completed ? 'Completed' : 'In Progress'}

Test Results:
- Total Tests: ${totalTests}
- Passed: ${testRun.passed_count}
- Failed: ${testRun.failed_count}
- Blocked: ${testRun.blocked_count}
- Untested: ${testRun.untested_count}
- Retest: ${testRun.retest_count}
- Pass Rate: ${passRate}%

Please create a detailed summary report that includes:
1. Executive Summary
2. Test Execution Overview
3. Results Analysis
4. Key Findings
5. Recommendations
6. Next Steps

Make the report professional and suitable for stakeholders.`,
              },
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to generate test run summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

// Start the server
async function main() {
  // Test connection on startup
  console.error('Testing connection to TestRail...');
  const isConnected = await testRailClient.testConnection();
  if (!isConnected) {
    console.error('Failed to connect to TestRail. Please check your configuration.');
    process.exit(1);
  }
  console.error('Connected to TestRail successfully!');

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('TestRail MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
}); 