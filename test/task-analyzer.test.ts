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
      const result =
        analyzer.testAnalyzeIndicators("実装とテストを行ってください");

      expect(result.hasMultipleActions).toBe(true); // "と" pattern
      expect(result.hasImplementKeywords).toBe(true); // "実装"
      expect(result.hasTestKeywords).toBe(true); // "テスト"
    });

    test("should analyze indicators for English text", () => {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.testAnalyzeIndicators(
        "implement and test the feature",
      );

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

  describe("Scoring logic", () => {
    test("should calculate complexity score correctly", () => {
      const analyzer = new TaskAnalyzer();

      // Test simple task (no indicators)
      const simpleIndicators = {
        hasMultipleActions: false,
        hasConditionals: false,
        hasDesignKeywords: false,
        hasImplementKeywords: false,
        hasTestKeywords: false,
      };
      expect(analyzer.testCalculateComplexityScore(simpleIndicators)).toBe(0);

      // Test complex task (all indicators)
      const complexIndicators = {
        hasMultipleActions: true,
        hasConditionals: true,
        hasDesignKeywords: true,
        hasImplementKeywords: true,
        hasTestKeywords: true,
      };
      expect(analyzer.testCalculateComplexityScore(complexIndicators)).toBe(
        1.0,
      );

      // Test medium complexity
      const mediumIndicators = {
        hasMultipleActions: true,
        hasConditionals: false,
        hasDesignKeywords: true,
        hasImplementKeywords: false,
        hasTestKeywords: false,
      };
      expect(analyzer.testCalculateComplexityScore(mediumIndicators)).toBe(
        0.55,
      );
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
