export type ComplexityAnalysis = {
  isComplex: boolean;
  confidence: number;
  reason: string;
  suggestedSubtasks: Array<{
    mode: "architect" | "code" | "debug" | "ask" | "orchestrator";
    description: string;
  }>;
  error?: string;
};

export type ContextOptimizationResult = {
  optimizedContext: string;
  reductionPercentage: number;
  summary: string;
  detectedLanguage: string;
};
