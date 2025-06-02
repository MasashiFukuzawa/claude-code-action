import { describe, test, expect, beforeEach } from "bun:test";
import { ContextOptimizer } from "../../src/orchestration/context-optimizer";
import type { ContextParams } from "../../src/orchestration/context-types";

describe("ContextOptimizer", () => {
  let optimizer: ContextOptimizer;

  beforeEach(() => {
    optimizer = new ContextOptimizer();
  });

  test("should create optimized context for code mode", () => {
    const params: ContextParams = {
      mode: "code",
      taskDescription: "Implement user login functionality",
      previousResults: [
        "Database schema created with user table",
        "Password hashing utility implemented",
        "JWT token service created",
      ],
      globalContext: {
        framework: "React",
        backend: "Node.js",
        database: "PostgreSQL",
      },
      maxTokens: 2000,
    };

    const context = optimizer.createContextForSubTask(params);

    expect(context.maxTokens).toBeLessThanOrEqual(2000);
    expect(context.modeSpecificContext).toBeDefined();
    expect(context.previousResults.length).toBeGreaterThan(0);
  });

  test("should prioritize relevant information for different modes", () => {
    const previousResults = [
      "System architecture designed with microservices",
      "Database schema created",
      "Authentication API implemented",
      "Critical bug found in payment processing",
      "Performance tests show 95% improvement",
    ];

    const codeRelevant = optimizer.extractRelevantInfo(previousResults, "code");
    const debugRelevant = optimizer.extractRelevantInfo(
      previousResults,
      "debug",
    );
    const architectRelevant = optimizer.extractRelevantInfo(
      previousResults,
      "architect",
    );

    // Code mode should prioritize implementation details
    expect(JSON.stringify(codeRelevant)).toContain("implemented");

    // Debug mode should prioritize error information
    expect(JSON.stringify(debugRelevant)).toContain("bug");

    // Architect mode should prioritize design information
    expect(JSON.stringify(architectRelevant)).toContain("architecture");
  });

  test("should achieve significant token reduction", () => {
    const verboseContext = {
      longDescription: "This is a very long description ".repeat(100),
      detailedLogs: "Detailed log entry ".repeat(50),
      extensiveDocumentation: "Documentation paragraph ".repeat(30),
    };

    const optimized = optimizer.optimizeContext(verboseContext, 500);

    const originalSize = JSON.stringify(verboseContext).length;
    const optimizedSize = JSON.stringify(optimized).length;
    const reduction = (originalSize - optimizedSize) / originalSize;

    expect(reduction).toBeGreaterThan(0.3); // At least 30% reduction
  });

  test("should calculate reduction ratio correctly", () => {
    const original = { content: "This is a very long content ".repeat(20) };
    const optimized = { content: "Short content" };

    const ratio = optimizer.calculateReductionRatio(original, optimized);

    expect(ratio).toBeGreaterThan(0);
    expect(ratio).toBeLessThanOrEqual(1);
  });

  test("should preserve high priority information", () => {
    const params: ContextParams = {
      mode: "debug",
      taskDescription: "Fix critical authentication bug",
      previousResults: [
        "User reported login failures",
        "System shows 500 errors in auth service",
        "Database connection is stable",
        "Previous bug fix implemented for payments",
      ],
      globalContext: {},
      maxTokens: 200,
      priorityOverrides: {
        error_info: 0.95,
      },
    };

    const context = optimizer.createContextForSubTask(params);
    const contextStr = JSON.stringify(context);

    // Should preserve error-related information
    expect(contextStr).toContain("error");
    expect(contextStr).toContain("auth");
  });

  test("should handle edge cases gracefully", () => {
    expect(() =>
      optimizer.createContextForSubTask({
        mode: "code",
        taskDescription: "",
        previousResults: [],
        globalContext: {},
        maxTokens: 0,
      }),
    ).not.toThrow();

    expect(() => optimizer.optimizeContext(null, 100)).not.toThrow();
    expect(() =>
      optimizer.extractRelevantInfo([], "unknown_mode"),
    ).not.toThrow();
  });
});
