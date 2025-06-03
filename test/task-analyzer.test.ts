import { TaskAnalyzer } from "../src/orchestrator/task-analyzer";
import { describe, expect, it } from "bun:test";

describe("TaskAnalyzer", () => {
  it("should detect Japanese text", () => {
    const analyzer = new TaskAnalyzer() as any; // プライベートメソッドにアクセスするため
    const japaneseText = 'ユーザー認証システムを実装してください';
    const englishText = 'Implement user authentication system';

    // 日本語テキストを検出
    expect(analyzer.detectJapanese(japaneseText)).toBe(true);

    // 英語テキストを検出しない
    expect(analyzer.detectJapanese(englishText)).toBe(false);
  });

  it("should return placeholder analysis results with language detection", () => {
    const analyzer = new TaskAnalyzer();
    const japaneseResult = analyzer.analyze('日本語タスク例');
    const englishResult = analyzer.analyze('English task example');

    // 日本語タスクの結果を検証
    expect(japaneseResult.isComplex).toBe(false);
    expect(japaneseResult.confidence).toBe(0);
    expect(japaneseResult.reason).toMatch(/Analysis not implemented yet \(detected: Japanese\)/);
    expect(japaneseResult.suggestedSubtasks).toEqual([]);

    // 英語タスクの結果を検証
    expect(englishResult.isComplex).toBe(false);
    expect(englishResult.confidence).toBe(0);
    expect(englishResult.reason).toMatch(/Analysis not implemented yet \(detected: non-Japanese\)/);
    expect(englishResult.suggestedSubtasks).toEqual([]);
  });
});
