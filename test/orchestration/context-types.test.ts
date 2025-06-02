import { describe, test, expect } from "bun:test";
import type {
  ContextParams,
  ModePriorities,
  CompressionStrategy,
  KeyInfo,
} from "../../src/orchestration/context-types";

describe("Context Optimization Types", () => {
  test("should define ContextParams interface correctly", () => {
    const params: ContextParams = {
      mode: "code",
      taskDescription: "Implement user authentication",
      previousResults: ["Design completed", "Database schema created"],
      globalContext: {
        projectType: "web-app",
        framework: "React",
      },
      maxTokens: 4000,
      priorityOverrides: {
        technical_detail: 0.9,
        file_change: 0.8,
      },
    };

    expect(params.mode).toBe("code");
    expect(params.previousResults.length).toBe(2);
    expect(params.globalContext.framework).toBe("React");
    expect(params.priorityOverrides?.["technical_detail"]).toBe(0.9);
  });

  test("should define ModePriorities correctly", () => {
    const priorities: ModePriorities = {
      design_decision: 0.9,
      technical_detail: 0.8,
      dependency_info: 0.7,
      file_change: 0.6,
      error_info: 0.5,
      performance_data: 0.4,
      security_concern: 0.8,
      test_result: 0.3,
    };

    expect(priorities.design_decision).toBe(0.9);
    expect(priorities.security_concern).toBe(0.8);
    expect(typeof priorities.test_result).toBe("number");
  });

  test("should define KeyInfo correctly", () => {
    const keyInfo: KeyInfo = {
      type: "file_change",
      content: "Modified src/auth/login.ts",
      relevanceScore: 0.85,
      tokens: 45,
      category: "implementation",
    };

    expect(keyInfo.type).toBe("file_change");
    expect(keyInfo.relevanceScore).toBe(0.85);
    expect(keyInfo.tokens).toBe(45);
  });

  test("should define CompressionStrategy correctly", () => {
    const strategy: CompressionStrategy = {
      name: "summarize_logs",
      applicableTypes: ["error_info", "performance_data"],
      compressionRatio: 0.3,
      preserveKeywords: ["error", "performance", "critical"],
    };

    expect(strategy.name).toBe("summarize_logs");
    expect(strategy.compressionRatio).toBe(0.3);
    expect(strategy.preserveKeywords).toContain("error");
  });
});
