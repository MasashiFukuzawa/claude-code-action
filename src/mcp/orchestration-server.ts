import { OrchestrationTools } from "./orchestration-tools";
import { MCPToolRegistry } from "./tool-registry";
import { modeManager } from "../modes/mode-manager";
import type { MCPTool, MCPToolInfo } from "./orchestration-types";

export class MCPOrchestrationServer {
  private toolRegistry: MCPToolRegistry;
  private orchestrationTools: OrchestrationTools;

  constructor() {
    this.toolRegistry = new MCPToolRegistry();
    this.orchestrationTools = new OrchestrationTools();
  }

  registerOrchestrationTools(): void {
    // Register analyze_task tool
    this.toolRegistry.registerTool({
      name: "analyze_task",
      description: "Analyze task complexity and determine required modes",
      inputSchema: {
        type: "object",
        properties: {
          task: { type: "string", description: "Task description to analyze" },
          context: {
            type: "object",
            description: "Optional context information",
          },
        },
        required: ["task"],
        additionalProperties: false,
      },
      handler: async (args) => this.orchestrationTools.analyzeTask(args),
    });

    // Register switch_mode tool
    this.toolRegistry.registerTool({
      name: "switch_mode",
      description: "Switch to a different AI mode",
      inputSchema: {
        type: "object",
        properties: {
          mode: { type: "string", description: "Target mode slug" },
          preserveContext: {
            type: "boolean",
            description: "Preserve current context",
          },
        },
        required: ["mode"],
        additionalProperties: false,
      },
      handler: async (args) => this.orchestrationTools.switchMode(args),
    });

    // Register optimize_context tool
    this.toolRegistry.registerTool({
      name: "optimize_context",
      description: "Optimize context to fit within token limits",
      inputSchema: {
        type: "object",
        properties: {
          context: { type: "object", description: "Context to optimize" },
          maxTokens: { type: "number", description: "Maximum token limit" },
          priorityKeys: {
            type: "array",
            items: { type: "string" },
            description: "Keys to prioritize",
          },
        },
        required: ["context", "maxTokens"],
        additionalProperties: false,
      },
      handler: async (args) => this.orchestrationTools.optimizeContext(args),
    });

    // Register decompose_task tool
    this.toolRegistry.registerTool({
      name: "decompose_task",
      description: "Decompose a complex task into subtasks",
      inputSchema: {
        type: "object",
        properties: {
          task: { type: "string", description: "Task to decompose" },
          maxSubtasks: {
            type: "number",
            description: "Maximum number of subtasks",
          },
          autoAssignModes: {
            type: "boolean",
            description: "Auto-assign modes to subtasks",
          },
        },
        required: ["task"],
        additionalProperties: false,
      },
      handler: async (args) => this.orchestrationTools.decomposeTask(args),
    });

    // Register boomerang tool
    this.toolRegistry.registerTool({
      name: "boomerang",
      description: "Delegate task to specific mode and return",
      inputSchema: {
        type: "object",
        properties: {
          task: { type: "string", description: "Task to delegate" },
          targetMode: {
            type: "string",
            description: "Target mode for delegation",
          },
          returnContext: {
            type: "boolean",
            description: "Return to original mode after",
          },
        },
        required: ["task", "targetMode"],
        additionalProperties: false,
      },
      handler: async (args) => this.orchestrationTools.boomerang(args),
    });

    // Register list_modes tool
    this.toolRegistry.registerTool({
      name: "list_modes",
      description: "List all available AI modes",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      handler: async () => {
        return modeManager.getAllModes();
      },
    });

    // Register get_context_usage tool
    this.toolRegistry.registerTool({
      name: "get_context_usage",
      description: "Get current context token usage",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      handler: async () => {
        // Simulate context usage tracking
        return {
          current: 2500,
          max: 4000,
          percentage: 62.5,
        };
      },
    });
  }

  async handleToolCall(toolName: string, args: any): Promise<any> {
    const tool = this.toolRegistry.getTool(toolName);

    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    // Validate arguments
    this.validateArguments(tool, args);

    // Execute tool handler
    return await tool.handler(args);
  }

  listTools(): MCPToolInfo[] {
    return this.toolRegistry.listTools();
  }

  private validateArguments(tool: MCPTool, args: any): void {
    const schema = tool.inputSchema;

    // Check required properties
    if (schema.required) {
      for (const required of schema.required) {
        if (!(required in args)) {
          throw new Error(`Missing required argument: ${required}`);
        }
      }
    }

    // Type validation
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (key in args) {
          const value = args[key];
          const expectedType = (prop as any).type;

          if (expectedType === "string" && typeof value !== "string") {
            throw new Error(`Invalid type for ${key}: expected string`);
          } else if (expectedType === "number" && typeof value !== "number") {
            throw new Error(`Invalid type for ${key}: expected number`);
          } else if (expectedType === "boolean" && typeof value !== "boolean") {
            throw new Error(`Invalid type for ${key}: expected boolean`);
          } else if (
            expectedType === "object" &&
            (typeof value !== "object" || value === null)
          ) {
            throw new Error(`Invalid type for ${key}: expected object`);
          } else if (expectedType === "array" && !Array.isArray(value)) {
            throw new Error(`Invalid type for ${key}: expected array`);
          }
        }
      }
    }
  }
}
