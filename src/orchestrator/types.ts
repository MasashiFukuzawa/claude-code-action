export type SubtaskMode =
  | "architect"
  | "code"
  | "debug"
  | "ask"
  | "orchestrator";

export type Subtask = {
  id: string;
  description: string;
  mode: SubtaskMode;
  dependencies?: string[];
};

export type ComplexityIndicators = {
  multipleActions: boolean;
  hasDesignKeywords: boolean;
  hasImplementKeywords: boolean;
  hasTestKeywords: boolean;
  hasConditionals: boolean;
  hasSequentialMarkers: boolean;
  taskLength: boolean;
};

export type ComplexityAnalysis = {
  isComplex: boolean;
  confidence: number;
  reason: string;
  suggestedSubtasks: Subtask[];
  error?: string;
};
