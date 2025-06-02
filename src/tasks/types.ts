export type TaskStatus = "pending" | "in_progress" | "completed" | "failed";

export interface TaskContext {
  previousResults: string[];
  globalContext: Record<string, any>;
  modeSpecificContext: Record<string, any>;
  maxTokens: number;
}

export interface TaskResult {
  taskId: string;
  success: boolean;
  output?: string;
  error?: string;
  createdFiles?: string[];
  modifiedFiles?: string[];
  duration?: number;
  tokensUsed?: number;
}

export interface Task {
  id: string;
  mode: string;
  message: string;
  parentTaskId?: string;
  context: TaskContext;
  status: TaskStatus;
  result?: TaskResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskParams {
  mode: string;
  message: string;
  parentTaskId?: string;
  context?: Partial<TaskContext>;
}

export interface TaskManagerOptions {
  defaultMaxTokens?: number;
}
