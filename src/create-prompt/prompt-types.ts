import type { SubTask } from "../tasks/types";

export interface PromptTemplate {
  mode: string;
  templateString: string;
  variables: string[];
  constraints: PromptConstraints;
  examples?: string[];
  priority?: number;
}

export interface PromptConstraints {
  maxTokens: number;
  requiredSections: string[];
  forbiddenTerms: string[];
  outputFormat: "markdown" | "json" | "code" | "yaml";
  styleGuidelines?: string[];
}

export interface QualityScore {
  overall: number;
  clarity: number;
  completeness: number;
  specificity: number;
  tokenEfficiency: number;
  contextRelevance?: number;
}

export interface ModePromptContext {
  mode: string;
  taskDescription: string;
  globalContext: Record<string, any>;
  previousResults: string[];
  constraints: PromptConstraints;
  modeSpecificData?: Record<string, any>;
}

export interface SubtaskPromptContext extends ModePromptContext {
  subtask: SubTask;
  dependencies: string[];
  parentTaskId?: string;
  executionOrder: number;
}

export interface PromptGenerationResult {
  prompt: string;
  metadata: PromptMetadata;
  qualityScore: QualityScore;
  warnings?: string[];
}

export interface PromptMetadata {
  mode: string;
  templateUsed: string;
  tokensUsed: number;
  optimizationApplied: string[];
  generationTime: number;
}

export type PromptVariableResolver = (
  variableName: string,
  context: any,
) => string;

export interface PromptValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}
