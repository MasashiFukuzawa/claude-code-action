import { ContextOptimizer } from "../src/orchestrator/context-optimizer";
import { describe, expect, it } from "bun:test";

describe("ContextOptimizer", () => {
  it("should prioritize rare terms when compressing text", () => {
    const optimizer = new ContextOptimizer();
    const context = `
      This sentence contains unique-term-x and unique-term-y.
      Common words like 'the', 'and', 'is' appear in this one.
      Another sentence with unique-term-z and unique-term-w.
    `;
    const result = optimizer.optimize(context);

    // 共通ワードの文が含まれないことを検証
    expect(result.optimizedContext).not.toMatch(/common words/);

    // 少なくとも1つのユニークワード文が含まれる
    expect(
      /unique-term-x|unique-term-z/.test(result.optimizedContext),
    ).toBeTrue();

    // 圧縮率と概要の検証
    expect(result.reductionPercentage).toBeGreaterThan(0);
    expect(result.summary).toMatch(/Compressed from 3 to 2 sentences/);
  });

  it("should handle short text without compression", () => {
    const optimizer = new ContextOptimizer();
    const context = "Single sentence.";
    const result = optimizer.optimize(context);

    expect(result.optimizedContext).toBe(context);
    expect(result.reductionPercentage).toBe(0);
    expect(result.summary).toMatch(/Compressed from 1 to 1 sentences/);
  });

  it("should correctly handle abbreviations in sentence splitting", () => {
    const optimizer = new ContextOptimizer() as any;
    const text = "This is Dr. Smith. He works at U.N. Special cases!";
    const sentences = optimizer.splitIntoSentences(text);

    expect(sentences).toEqual([
      "This is Dr. Smith.",
      "He works at U.N.",
      "Special cases!",
    ]);
  });
});
