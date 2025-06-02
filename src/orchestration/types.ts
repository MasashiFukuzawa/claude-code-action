export interface ComplexityFactor {
  type: ComplexityFactorType;
  weight: number;
  description: string;
}

export interface TaskAnalysis {
  complexity: number;
  complexityFactors: ComplexityFactor[];
  requiredModes: string[];
  requiresOrchestration: boolean;
  estimatedSubtasks: number;
  suggestedApproach: string;
}

export interface SubTask {
  id: string;
  description: string;
  mode: string;
  priority: number;
  dependencies: string[];
  estimatedComplexity: number;
  estimatedDuration?: number;
}

export interface DependencyGraph {
  nodes: SubTask[];
  edges: DependencyEdge[];
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: "sequential" | "parallel" | "conditional";
}

export interface ModeSelectionRule {
  pattern: RegExp;
  mode: string;
  priority: number;
  conditions?: string[];
}

export type ComplexityFactorType =
  | "multi_step"
  | "cross_domain"
  | "file_complexity"
  | "integration_required"
  | "performance_critical"
  | "security_sensitive"
  | "legacy_code"
  | "external_dependencies";
