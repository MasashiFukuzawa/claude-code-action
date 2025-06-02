export interface ContextParams {
  mode: string;
  taskDescription: string;
  previousResults: string[];
  globalContext: Record<string, any>;
  maxTokens: number;
  priorityOverrides?: Record<string, number>;
}

export interface ModePriorities {
  design_decision: number;
  technical_detail: number;
  dependency_info: number;
  file_change: number;
  error_info: number;
  performance_data: number;
  security_concern: number;
  test_result: number;
}

export interface ContextWeights {
  recency: number; // How recent the information is
  relevance: number; // How relevant to the current task
  specificity: number; // How specific vs general the information
  actionability: number; // How actionable the information is
}

export interface KeyInfo {
  type: string;
  content: string;
  relevanceScore: number;
  tokens: number;
  category:
    | "implementation"
    | "design"
    | "debugging"
    | "testing"
    | "documentation";
  timestamp?: Date;
}

export interface CompressionStrategy {
  name: string;
  applicableTypes: string[];
  compressionRatio: number;
  preserveKeywords: string[];
  algorithm?:
    | "summarize"
    | "extract_key_points"
    | "compress_logs"
    | "deduplicate";
}

export interface OptimizationResult {
  originalTokens: number;
  optimizedTokens: number;
  reductionRatio: number;
  preservedInfo: KeyInfo[];
  removedInfo: string[];
  optimizationStrategies: string[];
}

export interface SemanticMatch {
  score: number;
  matchedKeywords: string[];
  context: string;
  confidence: number;
}

export type ContextCategory =
  | "code_changes"
  | "design_decisions"
  | "error_logs"
  | "test_results"
  | "performance_metrics"
  | "dependency_updates"
  | "security_findings"
  | "documentation_updates";

export type OptimizationLevel = "aggressive" | "balanced" | "conservative";
