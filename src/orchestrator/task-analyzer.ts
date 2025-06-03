export type SuggestedSubtask = {
  mode: string;
  description: string;
};

export type ComplexityAnalysis = {
  isComplex: boolean;
  confidence: number;
  reason: string;
  suggestedSubtasks: SuggestedSubtask[];
};

export class TaskAnalyzer {
  private japanesePatterns: RegExp[];
  private englishPatterns: RegExp[];

  constructor() {
    this.japanesePatterns = [/実装/, /テスト/, /設計/];
    this.englishPatterns = [/implement/i, /test/i, /design/i];
  }

  analyze(_task: string): ComplexityAnalysis {
    // Reference patterns to avoid unused property errors
    void this.japanesePatterns;
    void this.englishPatterns;
    return {
      isComplex: false,
      confidence: 0,
      reason: "Analyzer not implemented",
      suggestedSubtasks: [],
    };
  }
}
