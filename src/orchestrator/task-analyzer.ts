import type { ComplexityAnalysis } from "./types";

export class TaskAnalyzer {
  analyze(_task: string): ComplexityAnalysis {
    return {
      isComplex: false,
      confidence: 0,
      reason: "stub",
      suggestedSubtasks: [],
    };
  }
}
