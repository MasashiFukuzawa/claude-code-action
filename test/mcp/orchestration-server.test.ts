import { describe, test, expect, beforeEach } from "bun:test";
import { MCPOrchestrationServer } from "../../src/mcp/orchestration-server";

describe("MCPOrchestrationServer", () => {
  let server: MCPOrchestrationServer;

  beforeEach(() => {
    server = new MCPOrchestrationServer();
  });

  test("should register orchestration tools", () => {
    server.registerOrchestrationTools();

    const tools = server.listTools();
    const toolNames = tools.map((t) => t.name);

    expect(toolNames).toContain("analyze_task");
    expect(toolNames).toContain("switch_mode");
    expect(toolNames).toContain("optimize_context");
    expect(toolNames).toContain("decompose_task");
    expect(toolNames).toContain("boomerang");
    expect(toolNames).toContain("list_modes");
    expect(toolNames).toContain("get_context_usage");
  });

  test("should handle analyze_task tool call", async () => {
    server.registerOrchestrationTools();

    const result = await server.handleToolCall("analyze_task", {
      task: "Implement user authentication",
    });

    expect(result).toHaveProperty("complexity");
    expect(result).toHaveProperty("requiredModes");
    expect(result).toHaveProperty("requiresOrchestration");
  });

  test("should handle switch_mode tool call", async () => {
    server.registerOrchestrationTools();

    const result = await server.handleToolCall("switch_mode", {
      mode: "architect",
    });

    expect(result.mode.slug).toBe("architect");
    expect(result).toHaveProperty("previousMode");
    expect(result).toHaveProperty("contextPreserved");
  });

  test("should handle optimize_context tool call", async () => {
    server.registerOrchestrationTools();

    const result = await server.handleToolCall("optimize_context", {
      context: { data: "Large context data".repeat(100) },
      maxTokens: 500,
    });

    expect(result.tokensUsed).toBeLessThanOrEqual(500);
    expect(result).toHaveProperty("removedKeys");
    expect(result).toHaveProperty("compressionRatio");
  });

  test("should handle decompose_task tool call", async () => {
    server.registerOrchestrationTools();

    const result = await server.handleToolCall("decompose_task", {
      task: "Build a complex e-commerce platform with user management, payment processing, and inventory tracking",
      maxSubtasks: 5,
      autoAssignModes: true,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(5);
    expect(result.every((subtask: any) => subtask.id && subtask.mode)).toBe(
      true,
    );
  });

  test("should handle boomerang tool call", async () => {
    server.registerOrchestrationTools();

    const result = await server.handleToolCall("boomerang", {
      task: "Debug memory leak in payment processor",
      targetMode: "debug",
      returnContext: true,
    });

    expect(result.mode).toBe("debug");
    expect(result).toHaveProperty("result");
    expect(result).toHaveProperty("tokensUsed");
    expect(result).toHaveProperty("duration");
  });

  test("should handle list_modes tool call", async () => {
    server.registerOrchestrationTools();

    const result = await server.handleToolCall("list_modes", {});

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((mode: any) => mode.slug && mode.name)).toBe(true);
  });

  test("should handle get_context_usage tool call", async () => {
    server.registerOrchestrationTools();

    const result = await server.handleToolCall("get_context_usage", {});

    expect(result).toHaveProperty("current");
    expect(result).toHaveProperty("max");
    expect(result).toHaveProperty("percentage");
    expect(typeof result.current).toBe("number");
    expect(typeof result.max).toBe("number");
    expect(typeof result.percentage).toBe("number");
  });

  test("should validate tool arguments", async () => {
    server.registerOrchestrationTools();

    await expect(server.handleToolCall("analyze_task", {})).rejects.toThrow(
      "Missing required argument: task",
    );
  });

  test("should handle unknown tool gracefully", async () => {
    await expect(server.handleToolCall("unknown_tool", {})).rejects.toThrow(
      "Unknown tool: unknown_tool",
    );
  });

  test("should validate argument types", async () => {
    server.registerOrchestrationTools();

    await expect(
      server.handleToolCall("optimize_context", {
        context: "invalid",
        maxTokens: "not_a_number",
      }),
    ).rejects.toThrow();
  });

  test("should return correct tool info", () => {
    server.registerOrchestrationTools();

    const tools = server.listTools();
    const analyzeTaskTool = tools.find((t) => t.name === "analyze_task");

    expect(analyzeTaskTool).toBeDefined();
    expect(analyzeTaskTool?.description).toContain("Analyze");
    expect(analyzeTaskTool?.category).toBe("orchestration");
    expect(analyzeTaskTool?.version).toBe("1.0.0");
  });
});
