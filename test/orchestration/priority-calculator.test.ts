import { describe, test, expect, beforeEach } from "bun:test";
import { PriorityCalculator } from "../../src/orchestration/priority-calculator";

describe("PriorityCalculator", () => {
  let calculator: PriorityCalculator;

  beforeEach(() => {
    calculator = new PriorityCalculator();
  });

  test("should calculate correct priorities for code mode", () => {
    const codePriorities = calculator.getModePriorities("code");

    expect(codePriorities.technical_detail).toBeGreaterThan(
      codePriorities.design_decision,
    );
    expect(codePriorities.file_change).toBeGreaterThan(
      codePriorities.performance_data,
    );
    expect(codePriorities.error_info).toBeGreaterThan(
      codePriorities.test_result,
    );
  });

  test("should calculate correct priorities for architect mode", () => {
    const architectPriorities = calculator.getModePriorities("architect");

    expect(architectPriorities.design_decision).toBeGreaterThan(
      architectPriorities.technical_detail,
    );
    expect(architectPriorities.dependency_info).toBeGreaterThan(
      architectPriorities.file_change,
    );
  });

  test("should calculate correct priorities for debug mode", () => {
    const debugPriorities = calculator.getModePriorities("debug");

    expect(debugPriorities.error_info).toBeGreaterThan(
      debugPriorities.design_decision,
    );
    expect(debugPriorities.performance_data).toBeGreaterThan(
      debugPriorities.test_result,
    );
  });

  test("should calculate priority scores for information items", () => {
    const fileChangeInfo = {
      type: "file_change",
      content: "Modified src/components/UserProfile.tsx",
      category: "implementation",
    };

    const codeScore = calculator.calculatePriority(fileChangeInfo, "code");
    const architectScore = calculator.calculatePriority(
      fileChangeInfo,
      "architect",
    );

    expect(codeScore).toBeGreaterThan(architectScore);
  });

  test("should rank information by priority correctly", () => {
    const items = [
      { type: "design_decision", content: "Chose React for frontend" },
      { type: "file_change", content: "Updated user.ts" },
      { type: "error_info", content: "TypeError in login function" },
      { type: "test_result", content: "All tests passing" },
    ];

    const rankedForCode = calculator.rankInformationByPriority(items, "code");
    const rankedForDebug = calculator.rankInformationByPriority(items, "debug");

    // For code mode, file changes should be high priority
    expect(rankedForCode[0].type).toBe("file_change");

    // For debug mode, error info should be highest priority
    expect(rankedForDebug[0].type).toBe("error_info");
  });

  test("should handle unknown information types gracefully", () => {
    const unknownInfo = {
      type: "unknown_type",
      content: "Some unknown information",
    };

    const score = calculator.calculatePriority(unknownInfo, "code");
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  test("should apply recency weighting correctly", () => {
    const oldInfo = {
      type: "file_change",
      content: "Old change",
      timestamp: new Date("2023-01-01"),
    };

    const newInfo = {
      type: "file_change",
      content: "Recent change",
      timestamp: new Date(),
    };

    const oldScore = calculator.calculatePriority(oldInfo, "code");
    const newScore = calculator.calculatePriority(newInfo, "code");

    expect(newScore).toBeGreaterThan(oldScore);
  });
});
