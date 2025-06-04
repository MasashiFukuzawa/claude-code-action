/**
 * Result of task complexity analysis
 */
export interface ComplexityAnalysis {
  /** Whether the task is considered complex and needs orchestration */
  isComplex: boolean;

  /** Confidence level in the analysis (0-1) */
  confidence: number;

  /** Human-readable reason for the complexity decision */
  reason: string;

  /** Suggested subtasks if the task is complex */
  suggestedSubtasks: SubTask[];

  /** Error message if analysis failed */
  error?: string;
}

/**
 * A suggested subtask for complex task execution
 */
export interface SubTask {
  /** Execution mode for this subtask */
  mode: ExecutionMode;

  /** Description of the subtask */
  description: string;

  /** Optional dependencies on other subtasks */
  dependencies?: string[];
}

/**
 * Available execution modes for Claude Code Action
 */
export type ExecutionMode =
  | "architect"
  | "code"
  | "debug"
  | "ask"
  | "orchestrator";

/**
 * Japanese patterns for complexity analysis
 */
export interface JapanesePatterns {
  /** Patterns indicating multiple actions */
  multipleActions?: string[];

  /** Patterns indicating conditional logic */
  conditionals?: string[];

  /** Keywords for design and architecture tasks */
  designKeywords?: string[];

  /** Keywords for implementation tasks */
  implementKeywords?: string[];
}

/**
 * English patterns for complexity analysis
 */
export interface EnglishPatterns {
  /** Patterns indicating multiple actions */
  multipleActions?: string[];

  /** Patterns indicating conditional logic */
  conditionals?: string[];

  /** Keywords for design and architecture tasks */
  designKeywords?: string[];

  /** Keywords for implementation tasks */
  implementKeywords?: string[];
}

/**
 * Indicators for task complexity analysis
 */
export interface ComplexityIndicators {
  /** Task contains multiple actions */
  hasMultipleActions: boolean;

  /** Task contains conditional logic */
  hasConditionals: boolean;

  /** Task contains design keywords */
  hasDesignKeywords: boolean;

  /** Task contains implementation keywords */
  hasImplementKeywords: boolean;

  /** Task contains test keywords */
  hasTestKeywords: boolean;
}
