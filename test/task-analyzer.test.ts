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

  describe("Language detection (via analyze behavior)", () => {
    test("should handle Japanese text correctly", () => {
      const analyzer = new TaskAnalyzer();

      // Test with Japanese task - analyze should work correctly with Japanese text
      const result = analyzer.analyze("実装とテストを行ってください");

      expect(result.isComplex).toBe(true);
      expect(result.reason).toContain("複数の操作"); // Japanese reason text
      expect(result.confidence).toBeGreaterThan(0);
    });

    test("should handle English text correctly", () => {
      const analyzer = new TaskAnalyzer();

      // Test with English task - analyze should work correctly with English text
      const result = analyzer.analyze("implement and test the feature");

      expect(result.isComplex).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe("Pattern matching (via analyze behavior)", () => {
    test("should detect complex patterns in Japanese text", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze("実装とテストを行ってください");

      // Verify complex task detection via high complexity score
      expect(result.isComplex).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.reason).toContain("複数の操作");
    });

    test("should detect complex patterns in English text", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze("implement and test the feature");

      // Verify complex task detection via high complexity score
      expect(result.isComplex).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test("should detect simple tasks correctly", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze("fix bug");

      // Verify simple task detection
      expect(result.isComplex).toBe(false);
      expect(result.reason).toContain("シンプル");
    });
  });

  describe("Scoring logic", () => {
    test("should score simple tasks with low complexity", () => {
      const analyzer = new TaskAnalyzer();

      // Test very simple task
      const result = analyzer.analyze("fix typo");
      expect(result.isComplex).toBe(false);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThan(0.5);
    });

    test("should score complex tasks with high complexity", () => {
      const analyzer = new TaskAnalyzer();

      // Test highly complex task with multiple indicators
      const result = analyzer.analyze(
        "設計してから実装し、テストも行い、条件に応じて修正してください",
      );
      expect(result.isComplex).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test("should score medium complexity tasks appropriately", () => {
      const analyzer = new TaskAnalyzer();

      // Test medium complexity task
      const result = analyzer.analyze("設計して実装してください");
      expect(result.isComplex).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
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
