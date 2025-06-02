import { describe, test, expect } from "bun:test";
import type {
  MCPTool,
  AnalyzeTaskArgs,
  SwitchModeArgs,
  OptimizeContextArgs,
  DecomposeTaskArgs,
  BoomerangArgs,
  OptimizedContext,
  BoomerangResult,
  TokenUsage,
  ContextItem,
  MCPToolInfo,
} from "../../src/mcp/orchestration-types";

describe("MCP Orchestration Types", () => {
  test("should define MCPTool correctly", () => {
    const tool: MCPTool = {
      name: "test_tool",
      description: "Test tool for validation",
      inputSchema: {
        type: "object",
        properties: {
          input: { type: "string" },
        },
        required: ["input"],
        additionalProperties: false,
      },
      handler: async (args: any) => Promise.resolve({ result: args.input }),
    };

    expect(tool.name).toBe("test_tool");
    expect(tool.inputSchema.type).toBe("object");
    expect(tool.inputSchema.required).toContain("input");
  });

  test("should define AnalyzeTaskArgs correctly", () => {
    const args: AnalyzeTaskArgs = {
      task: "Implement user authentication",
      context: { framework: "React" },
    };

    expect(args.task).toBe("Implement user authentication");
    expect(args.context?.framework).toBe("React");
  });

  test("should define SwitchModeArgs correctly", () => {
    const args: SwitchModeArgs = {
      mode: "architect",
      preserveContext: true,
    };

    expect(args.mode).toBe("architect");
    expect(args.preserveContext).toBe(true);
  });

  test("should define OptimizeContextArgs correctly", () => {
    const args: OptimizeContextArgs = {
      context: { data: "large context data" },
      maxTokens: 1000,
      priorityKeys: ["data"],
    };

    expect(args.maxTokens).toBe(1000);
    expect(args.priorityKeys).toContain("data");
  });

  test("should define DecomposeTaskArgs correctly", () => {
    const args: DecomposeTaskArgs = {
      task: "Build e-commerce platform",
      maxSubtasks: 5,
      autoAssignModes: true,
    };

    expect(args.task).toBe("Build e-commerce platform");
    expect(args.maxSubtasks).toBe(5);
    expect(args.autoAssignModes).toBe(true);
  });

  test("should define BoomerangArgs correctly", () => {
    const args: BoomerangArgs = {
      task: "Debug memory leak",
      targetMode: "debug",
      returnContext: true,
    };

    expect(args.targetMode).toBe("debug");
    expect(args.returnContext).toBe(true);
  });

  test("should define OptimizedContext correctly", () => {
    const context: OptimizedContext = {
      context: { optimized: "data" },
      tokensUsed: 500,
      removedKeys: ["unnecessary"],
      compressionRatio: 0.75,
    };

    expect(context.tokensUsed).toBe(500);
    expect(context.compressionRatio).toBe(0.75);
    expect(context.removedKeys).toContain("unnecessary");
  });

  test("should define BoomerangResult correctly", () => {
    const result: BoomerangResult = {
      result: "Memory leak fixed in payment processor",
      mode: "debug",
      tokensUsed: 250,
      duration: 1500,
    };

    expect(result.mode).toBe("debug");
    expect(result.duration).toBe(1500);
    expect(result.result).toContain("Memory leak");
  });

  test("should define TokenUsage correctly", () => {
    const usage: TokenUsage = {
      current: 2500,
      max: 4000,
      percentage: 62.5,
    };

    expect(usage.percentage).toBe(62.5);
    expect(usage.current).toBeLessThan(usage.max);
  });

  test("should define ContextItem correctly", () => {
    const item: ContextItem = {
      key: "fileContents",
      value: "function main() {}",
      tokens: 150,
      priority: 8,
      timestamp: new Date(),
    };

    expect(item.key).toBe("fileContents");
    expect(item.priority).toBe(8);
    expect(item.timestamp).toBeInstanceOf(Date);
  });

  test("should define MCPToolInfo correctly", () => {
    const info: MCPToolInfo = {
      name: "analyze_task",
      description: "Analyze task complexity",
      category: "orchestration",
      version: "1.0.0",
    };

    expect(info.category).toBe("orchestration");
    expect(info.version).toBe("1.0.0");
  });
});
