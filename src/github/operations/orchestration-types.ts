import type { TaskResult } from "../../tasks/types";

export interface OrchestrationResult {
  success: boolean;
  taskId: string;
  subtaskResults: TaskResult[];
  totalDuration: number;
  totalTokensUsed: number;
  summary: string;
  errors?: string[];
  partialSuccess?: boolean;
  completedSubtasks?: TaskResult[];
  failedSubtasks?: TaskResult[];
  errorRecovery?: ErrorRecoveryInfo;
}

export interface ExecutionPlan {
  phases: ExecutionPhase[];
  dependencies: Record<string, string[]>;
  estimatedTotalDuration: number;
  criticalPath: string[];
}

export interface ExecutionPhase {
  phaseId: string;
  name: string;
  subtasks: string[];
  executionType: "parallel" | "sequential";
  estimatedDuration: number;
}

export interface ProgressUpdate {
  taskId: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  percentComplete: number;
  currentStep?: string;
  startTime?: Date;
  endTime?: Date;
  estimatedTimeRemaining?: number;
}

export interface TaskInfo {
  id: string;
  title: string;
  description: string;
  issueNumber: number;
  repository: {
    owner: string;
    name: string;
  };
}

export interface BoomerangRequest {
  task: string;
  targetMode: string;
  returnContext: boolean;
  preserveResults?: boolean;
}

export interface BoomerangResult {
  success: boolean;
  delegatedMode: string;
  result: string;
  tokensUsed: number;
  duration: number;
}

export interface ErrorRecoveryInfo {
  strategy: "retry" | "skip" | "fallback";
  attempts: number;
  recoveredTasks: string[];
  unrecoverableTasks: string[];
}

export interface ExecutionMetrics {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  tokensUsed: number;
  subtasksCompleted: number;
  subtasksFailed: number;
  parallelizationEfficiency?: number;
}
