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
    });
  });
});

describe("TaskAnalyzer patterns", () => {
  it("matches Japanese keywords", () => {
    const analyzer = new TaskAnalyzer() as any;
    const patterns: RegExp[] = analyzer["japanesePatterns"];
    expect(patterns.some((p) => p.test("この機能を実装する"))).toBe(true);
    expect(patterns.some((p) => p.test("テストを追加"))).toBe(true);
    expect(patterns.some((p) => p.test("設計を検討"))).toBe(true);
  });

  it("matches English keywords", () => {
    const analyzer = new TaskAnalyzer() as any;
    const patterns: RegExp[] = analyzer["englishPatterns"];
    expect(patterns.some((p) => p.test("implement the feature"))).toBe(true);
    expect(patterns.some((p) => p.test("write a test"))).toBe(true);
    expect(patterns.some((p) => p.test("design the system"))).toBe(true);
  });
});
