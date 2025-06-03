export type SuggestedSubtask = {
  mode: string;
  description: string;
};

export type ComplexityAnalysis = {
  isComplex: boolean;
  confidence: number;
  reason: string;
  suggestedSubtasks: SuggestedSubtask[];
  isJapanese: boolean;
};

export class TaskAnalyzer {
  constructor() {
    // TODO: initialize patterns and configuration
  }

  private detectJapanese(task: string): boolean {
    const japaneseRegex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9faf]/;
    return japaneseRegex.test(task);
  }

  analyze(task: string): ComplexityAnalysis {
    const isJapanese = this.detectJapanese(task);

    return {
      isComplex: false,
      confidence: 0,
      reason: "Analyzer not implemented",
      suggestedSubtasks: [],
      isJapanese,
    };
  }
}
