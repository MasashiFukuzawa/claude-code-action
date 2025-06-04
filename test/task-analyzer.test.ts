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
});
