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
});
