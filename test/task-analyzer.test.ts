import { describe, test, expect } from "bun:test";
import { TaskAnalyzer } from "../src/orchestrator/task-analyzer";

describe("TaskAnalyzer", () => {
  test("should instantiate", () => {
    const analyzer = new TaskAnalyzer();
    expect(analyzer).toBeInstanceOf(TaskAnalyzer);
  });

  test("should return analysis with scoring logic", () => {
    const analyzer = new TaskAnalyzer();
    const result = analyzer.analyze("test task");

    expect(result.isComplex).toBe(false);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.reason).toContain("シンプル");
    expect(result.suggestedSubtasks).toEqual([]);
  });

  describe("Japanese detection", () => {
    test("should detect Japanese characters", () => {
      const analyzer = new TaskAnalyzer();

      // Test Japanese text returns Japanese-specific reasons
      const result1 = analyzer.analyze("こんにちは");
      expect(result1.reason).toContain("シンプル");

      const result2 = analyzer.analyze("テストを実装してください");
      expect(result2.reason).toContain("複数の操作");
    });

    test("should not detect Japanese in English text", () => {
      const analyzer = new TaskAnalyzer();

      // English text should still work correctly
      const result = analyzer.analyze("Hello world");
      expect(result.isComplex).toBe(false);
      expect(result.reason).toContain("シンプル");
    });
  });

  describe("Pattern matching", () => {
    test("should analyze indicators for Japanese text", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze("実装とテストを行ってください");

      expect(result.isComplex).toBe(true);
      expect(result.reason).toContain("複数の操作");
      expect(result.reason).toContain("実装とテストの両方が必要");
    });

    test("should analyze indicators for English text", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze("implement and test the feature");

      expect(result.isComplex).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test("should return false for simple tasks", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze("fix bug");

      expect(result.isComplex).toBe(false);
      expect(result.reason).toContain("シンプル");
    });
  });

  describe("Scoring logic", () => {
    test("should calculate complexity score correctly", () => {
      const analyzer = new TaskAnalyzer();

      // Test simple task
      const simpleResult = analyzer.analyze("fix typo");
      expect(simpleResult.isComplex).toBe(false);
      expect(simpleResult.confidence).toBeLessThan(0.5);

      // Test complex task with multiple indicators
      const complexResult = analyzer.analyze(
        "設計してアーキテクチャを実装し、条件に応じてテストを作成してください",
      );
      expect(complexResult.isComplex).toBe(true);
      expect(complexResult.confidence).toBe(1.0);

      // Test medium complexity
      const mediumResult = analyzer.analyze("実装と設計を行う");
      expect(mediumResult.isComplex).toBe(true);
      expect(mediumResult.confidence).toBeGreaterThan(0.5);
      expect(mediumResult.confidence).toBeLessThanOrEqual(1.0);
    });

    test("should return proper analysis for complex task", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze("実装とテストを設計してください");

      expect(result.isComplex).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.reason).toContain("複数の操作");
      expect(result.suggestedSubtasks).toEqual([]);
    });

    test("should return proper analysis for simple task", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze("fix bug");

      expect(result.isComplex).toBe(false);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.reason).toContain("シンプル");
    });
  });
});
