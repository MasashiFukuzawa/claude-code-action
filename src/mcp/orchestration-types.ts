import type { Mode } from "../modes/types";

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  handler: (args: any) => Promise<any>;
}

export interface JSONSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface AnalyzeTaskArgs {
  task: string;
  context?: Record<string, any>;
}

export interface SwitchModeArgs {
  mode: string;
  preserveContext?: boolean;
}

export interface OptimizeContextArgs {
  context: Record<string, any>;
  maxTokens: number;
  priorityKeys?: string[];
}

export interface DecomposeTaskArgs {
  task: string;
  maxSubtasks?: number;
  autoAssignModes?: boolean;
}

export interface BoomerangArgs {
  task: string;
  targetMode: string;
  returnContext?: boolean;
}

export interface OptimizedContext {
  context: Record<string, any>;
  tokensUsed: number;
  removedKeys: string[];
  compressionRatio: number;
}

export interface BoomerangResult {
  result: string;
  mode: string;
  tokensUsed: number;
  duration: number;
}

export interface TokenUsage {
  current: number;
  max: number;
  percentage: number;
}

export interface ContextItem {
  key: string;
  value: any;
  tokens: number;
  priority: number;
  timestamp: Date;
}

export interface MCPToolInfo {
  name: string;
  description: string;
  category: string;
  version: string;
}

export interface ModeContext {
  mode: Mode;
  previousMode: Mode;
  contextPreserved: boolean;
}
