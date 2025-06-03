export interface SuggestedSubtask {
  mode: "architect" | "code" | "debug" | "ask" | "orchestrator";
  description: string;
}

export interface ComplexityAnalysis {
  isComplex: boolean;
  confidence: number;
  reason: string;
  suggestedSubtasks: SuggestedSubtask[];
  error?: string;
}
