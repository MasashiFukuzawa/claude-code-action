import { describe, expect, it } from "bun:test";
import { TaskAnalyzer } from "../src/orchestrator";

describe("TaskAnalyzer.analyze", () => {
  it("returns the placeholder analysis result", () => {
    const analyzer = new TaskAnalyzer();
    const result = analyzer.analyze("Do something");
    expect(result).toEqual({
      isComplex: false,
      confidence: 0,
      reason: "Analyzer not implemented",
      suggestedSubtasks: [],
      isJapanese: false,
    });
  });

  it("detects Japanese text", () => {
    const analyzer = new TaskAnalyzer();
    const result = analyzer.analyze("日本語のタスクを実行してください");
    expect(result.isJapanese).toBe(true);
  });
});
