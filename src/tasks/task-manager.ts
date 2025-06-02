import type {
  Task,
  CreateTaskParams,
  TaskStatus,
  TaskResult,
  TaskManagerOptions,
} from "./types";
import { v4 as uuidv4 } from "uuid";

export class TaskManager {
  private tasks: Map<string, Task>;
  private defaultMaxTokens: number;

  constructor(options?: TaskManagerOptions) {
    this.tasks = new Map();
    this.defaultMaxTokens = options?.defaultMaxTokens ?? 8000;
  }

  createTask(params: CreateTaskParams): Task {
    const now = new Date();
    const task: Task = {
      id: this.generateTaskId(),
      mode: params.mode,
      message: params.message,
      parentTaskId: params.parentTaskId,
      status: "pending",
      context: {
        previousResults: [],
        globalContext: {},
        modeSpecificContext: {},
        maxTokens: this.defaultMaxTokens,
        ...params.context,
      },
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(task.id, task);
    return task;
  }

  getTask(id: string): Task {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task not found: ${id}`);
    }
    return task;
  }

  updateTaskStatus(id: string, status: TaskStatus): void {
    const task = this.getTask(id);
    task.status = status;
    task.updatedAt = new Date();
    this.tasks.set(id, task);
  }

  updateTaskResult(id: string, result: TaskResult): void {
    const task = this.getTask(id);
    task.result = result;
    task.status = result.success ? "completed" : "failed";
    task.updatedAt = new Date();
    this.tasks.set(id, task);
  }

  async executeTask(
    id: string,
    executionFn: () => Promise<Omit<TaskResult, "taskId">>,
  ): Promise<TaskResult> {
    this.getTask(id); // Validate task exists
    const startTime = Date.now();

    // Update status to in_progress
    this.updateTaskStatus(id, "in_progress");

    try {
      // Execute the task
      const outcome = await executionFn();
      const duration = Date.now() - startTime;

      // Create full result with taskId and duration
      const result: TaskResult = {
        taskId: id,
        duration,
        ...outcome,
      };

      // Update task with result
      this.updateTaskResult(id, result);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TaskResult = {
        taskId: id,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration,
      };

      // Update task with error result
      this.updateTaskResult(id, result);

      return result;
    }
  }

  getSubTasks(parentId: string): Task[] {
    return Array.from(this.tasks.values())
      .filter((task) => task.parentTaskId === parentId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return Array.from(this.tasks.values())
      .filter((task) => task.status === status)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  private generateTaskId(): string {
    return `task-${uuidv4()}`;
  }
}

// Singleton instance
export const taskManager = new TaskManager();
