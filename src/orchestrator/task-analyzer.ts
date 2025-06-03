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
  constructor() {
    // TODO: initialize patterns and configuration
  }

  analyze(_task: string): ComplexityAnalysis {
    return {
      isComplex: false,
      confidence: 0,
      reason: "Analyzer not implemented",
      suggestedSubtasks: [],
    };
  }
}
