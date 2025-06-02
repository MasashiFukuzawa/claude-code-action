import { describe, test, expect, beforeEach } from "bun:test";
import { OrchestrationTools } from "../../src/mcp/orchestration-tools";
import type {
  AnalyzeTaskArgs,
  SwitchModeArgs,
  OptimizeContextArgs,
  DecomposeTaskArgs,
  BoomerangArgs,
} from "../../src/mcp/orchestration-types";

describe("OrchestrationTools", () => {
  let tools: OrchestrationTools;

  beforeEach(() => {
    tools = new OrchestrationTools();
  });

  test("should analyze task complexity", async () => {
    const args: AnalyzeTaskArgs = {
      task: "Implement a complete user authentication system with OAuth2, JWT tokens, role-based access control, password reset functionality, email verification, multi-factor authentication, and integration with multiple social login providers",
      context: { framework: "Express.js" },
    };

    const analysis = await tools.analyzeTask(args);

    expect(analysis.complexity).toBeGreaterThan(4);
    expect(analysis.requiredModes).toContain("code");
    expect(analysis.requiresOrchestration).toBe(analysis.complexity >= 5);
  });

  test("should switch mode with context preservation", async () => {
    const args: SwitchModeArgs = {
      mode: "architect",
      preserveContext: true,
    };

    const result = await tools.switchMode(args);

    expect(result.mode.slug).toBe("architect");
    expect(result.previousMode).toBeDefined();
    expect(result.contextPreserved).toBe(true);
  });

  test("should optimize context for token limit", async () => {
    const largeContext = {
      fileContents: "Large file content...".repeat(1000),
      history: ["Previous command 1", "Previous command 2"],
      metadata: { timestamp: new Date(), user: "test" },
    };

    const args: OptimizeContextArgs = {
      context: largeContext,
      maxTokens: 1000,
      priorityKeys: ["fileContents"],
    };

    const optimized = await tools.optimizeContext(args);

    expect(optimized.tokensUsed).toBeLessThanOrEqual(1000);
    expect(optimized.removedKeys.length).toBeGreaterThan(0);
    expect(optimized.compressionRatio).toBeGreaterThan(0.5);
  });

  test("should decompose complex task into subtasks", async () => {
    const args: DecomposeTaskArgs = {
      task: `Build a complete e-commerce platform with:
        - User authentication system
        - Product catalog management
        - Shopping cart functionality
        - Payment processing
        - Order tracking`,
      maxSubtasks: 10,
      autoAssignModes: true,
    };

    const subtasks = await tools.decomposeTask(args);

    expect(subtasks.length).toBeGreaterThanOrEqual(3);
    expect(subtasks.length).toBeLessThanOrEqual(10);
    expect(subtasks.every((st) => st.mode)).toBe(true);
    expect(subtasks.some((st) => st.dependencies.length > 0)).toBe(true);
  });

  test("should handle boomerang pattern for mode delegation", async () => {
    const args: BoomerangArgs = {
      task: "Debug memory leak in payment processor",
      targetMode: "debug",
      returnContext: true,
    };

    const result = await tools.boomerang(args);

    expect(result.mode).toBe("debug");
    expect(result.result).toContain("memory");
    expect(result.tokensUsed).toBeGreaterThan(0);
  });

  test("should handle simple task analysis", async () => {
    const args: AnalyzeTaskArgs = {
      task: "Add a comment to this function",
    };

    const analysis = await tools.analyzeTask(args);

    expect(analysis.complexity).toBeLessThan(5);
    expect(analysis.requiresOrchestration).toBe(false);
  });

  test("should handle mode switching without context preservation", async () => {
    const args: SwitchModeArgs = {
      mode: "code",
      preserveContext: false,
    };

    const result = await tools.switchMode(args);

    expect(result.mode.slug).toBe("code");
    expect(result.contextPreserved).toBe(false);
  });

  test("should handle context optimization with empty context", async () => {
    const args: OptimizeContextArgs = {
      context: {},
      maxTokens: 500,
    };

    const optimized = await tools.optimizeContext(args);

    expect(optimized.tokensUsed).toBe(0);
    expect(optimized.removedKeys.length).toBe(0);
    expect(optimized.compressionRatio).toBe(0);
  });

  test("should limit subtasks to maxSubtasks", async () => {
    const args: DecomposeTaskArgs = {
      task: "Complex task with many requirements",
      maxSubtasks: 3,
      autoAssignModes: true,
    };

    const subtasks = await tools.decomposeTask(args);

    expect(subtasks.length).toBeLessThanOrEqual(3);
  });

  test("should handle boomerang without returning context", async () => {
    const args: BoomerangArgs = {
      task: "Analyze system architecture",
      targetMode: "architect",
      returnContext: false,
    };

    const result = await tools.boomerang(args);

    expect(result.mode).toBe("architect");
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });
});
