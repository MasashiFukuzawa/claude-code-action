export const VALID_GROUPS = [
  "file_operations",
  "git_operations",
  "code_analysis",
  "testing",
  "read_operations",
  "write_operations",
  "documentation",
  "analysis",
  "diagnostic_tools",
  "logging",
  "search",
  "task_management",
  "mode_switching",
  "context_optimization",
] as const;

export type ValidGroup = (typeof VALID_GROUPS)[number];

export interface Mode {
  slug: string;
  name: string;
  roleDefinition: string;
  groups: readonly ValidGroup[];
  customInstructions?: string;
  defaultLLMProvider?: string;
}

export interface ModeContext {
  mode: Mode;
  previousResults?: string[];
  globalContext?: Record<string, any>;
}

export type ModeSlug =
  | "code"
  | "architect"
  | "debug"
  | "ask"
  | "orchestrator"
  | string;
