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

      // Test Japanese text returns Japanese-specific reasons
      const result1 = analyzer.analyze("こんにちは");
      expect(result1.reason).toContain("シンプル");

      const result2 = analyzer.analyze("テストを実装してください");
      expect(result2.reason).toContain("複数の操作");
    });

    test("should handle English text correctly", () => {
      const analyzer = new TaskAnalyzer();

      // English text should still work correctly
      const result = analyzer.analyze("Hello world");
      expect(result.isComplex).toBe(false);
      expect(result.reason).toContain("シンプル");
    });
  });

  describe("Pattern matching (via analyze behavior)", () => {
    test("should detect complex patterns in Japanese text", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze("実装とテストを行ってください");

      expect(result.isComplex).toBe(true);
      expect(result.reason).toContain("複数の操作");
      expect(result.reason).toContain("実装とテストの両方が必要");
    });

    test("should detect complex patterns in English text", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze("implement and test the feature");

      expect(result.isComplex).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test("should detect simple tasks correctly", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze("fix bug");

      expect(result.isComplex).toBe(false);
      expect(result.reason).toContain("シンプル");
    });
  });

  describe("Scoring logic", () => {
    test("should score simple tasks with low complexity", () => {
      const analyzer = new TaskAnalyzer();

      // Test simple task
      const simpleResult = analyzer.analyze("fix typo");
      expect(simpleResult.isComplex).toBe(false);
      expect(simpleResult.confidence).toBeLessThan(0.5);
    });

    test("should score complex tasks with high complexity", () => {
      const analyzer = new TaskAnalyzer();

      // Test highly complex task with multiple indicators
      const result = analyzer.analyze(
        "設計してアーキテクチャを実装し、条件に応じてテストを作成してください",
      );
      expect(result.isComplex).toBe(true);
      expect(result.confidence).toBe(1.0);
    });

    test("should score medium complexity tasks appropriately", () => {
      const analyzer = new TaskAnalyzer();

      // Test medium complexity task
      const result = analyzer.analyze("実装と設計を行う");
      expect(result.isComplex).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });

    test("should return proper analysis for complex task", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze("実装とテストを設計してください");

      expect(result.isComplex).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.reason).toContain("複数の操作");
      expect(result.suggestedSubtasks).toEqual([
        {
          mode: "architect",
          description: "設計とアーキテクチャの決定",
        },
        {
          mode: "code",
          description: "実装",
        },
        {
          mode: "code",
          description: "テストの作成",
        },
      ]);
    });

    test("should return proper analysis for simple task", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze("fix bug");

      expect(result.isComplex).toBe(false);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.reason).toContain("シンプル");
    });
  });

  describe("Subtask generation", () => {
    test("should generate subtasks for design and implementation", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze("設計してから実装してください");

      expect(result.isComplex).toBe(true);
      expect(result.suggestedSubtasks).toHaveLength(3);
      expect(result.suggestedSubtasks[0]?.mode).toBe("architect");
      expect(result.suggestedSubtasks[1]?.mode).toBe("code");
      expect(result.suggestedSubtasks[2]?.mode).toBe("code");
    });

    test("should generate English subtasks for English input", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze("design and implement the feature");

      expect(result.isComplex).toBe(true);
      expect(result.suggestedSubtasks).toContainEqual({
        mode: "architect",
        description: "Design and architecture decisions",
      });
      expect(result.suggestedSubtasks).toContainEqual({
        mode: "code",
        description: "Implementation",
      });
      expect(result.suggestedSubtasks).toContainEqual({
        mode: "code",
        description: "Test creation",
      });
    });

    test("should return empty subtasks for simple tasks", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze("fix typo");

      expect(result.isComplex).toBe(false);
      expect(result.suggestedSubtasks).toEqual([]);
    });
  });
});
