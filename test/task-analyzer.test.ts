import { describe, test, expect } from "bun:test";
import { TaskAnalyzer } from "../src/orchestrator/task-analyzer";

describe("TaskAnalyzer", () => {
  test("should instantiate", () => {
    const analyzer = new TaskAnalyzer();
    expect(analyzer).toBeInstanceOf(TaskAnalyzer);
  });

  test("should return fixed analysis", () => {
    const analyzer = new TaskAnalyzer();
    const result = analyzer.analyze("test task");

    expect(result).toEqual({
      isComplex: false,
      confidence: 1.0,
      reason: "Skeleton implementation - always returns simple task",
      suggestedSubtasks: [],
    });
  });

  describe("Japanese detection", () => {
    test("should detect Japanese characters", () => {
      const analyzer = new TaskAnalyzer();

      // These should return true when implemented
      expect(analyzer.testDetectJapanese("こんにちは")).toBe(true);
      expect(analyzer.testDetectJapanese("テスト")).toBe(true);
      expect(analyzer.testDetectJapanese("実装してください")).toBe(true);
      expect(analyzer.testDetectJapanese("Hello 世界")).toBe(true);
    });

    test("should not detect Japanese in English text", () => {
      const analyzer = new TaskAnalyzer();

      // These should return false
      expect(analyzer.testDetectJapanese("Hello world")).toBe(false);
      expect(analyzer.testDetectJapanese("implement feature")).toBe(false);
      expect(analyzer.testDetectJapanese("123 test")).toBe(false);
    });
  });

  describe("Pattern matching", () => {
    test("should analyze indicators for Japanese text", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.testAnalyzeIndicators("実装とテストを行ってください");

      expect(result.hasMultipleActions).toBe(true); // "と" pattern
      expect(result.hasImplementKeywords).toBe(true); // "実装"
      expect(result.hasTestKeywords).toBe(true); // "テスト"
    });

    test("should analyze indicators for English text", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.testAnalyzeIndicators("implement and test the feature");

      expect(result.hasMultipleActions).toBe(true); // "and" pattern
      expect(result.hasImplementKeywords).toBe(true); // "implement"
      expect(result.hasTestKeywords).toBe(true); // "test"
    });

    test("should return false for simple tasks", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.testAnalyzeIndicators("fix bug");

      expect(result.hasMultipleActions).toBe(false);
      expect(result.hasConditionals).toBe(false);
      expect(result.hasDesignKeywords).toBe(false);
    });
  });
});
