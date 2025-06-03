import { TaskAnalyzer } from '../src/orchestrator/task-analyzer';
import { describe, expect, it } from 'bun:test';

describe('TaskAnalyzer', () => {
  it('should return placeholder analysis results', () => {
    const analyzer = new TaskAnalyzer();
    const result = analyzer.analyze('日本語タスク例');

    // 現在のプレースホルダ実装を検証
    expect(result.isComplex).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.reason).toBe('Analysis not implemented yet');
    expect(result.suggestedSubtasks).toEqual([]);
  });
});
