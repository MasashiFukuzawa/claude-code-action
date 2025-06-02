import type { SubTask, TaskResult } from "../../tasks/types";
import type { ProgressUpdate } from "./orchestration-types";
import { TaskManager } from "../../tasks";

export interface DependencyGraph {
  nodes: SubTask[];
  edges: Array<{
    from: string;
    to: string;
    type: string;
  }>;
}

export class SubtaskExecutionManager {
  private executionQueue: ExecutionQueue;
  private dependencyResolver: DependencyResolver;
  private resultAggregator: ResultAggregator;
  private progressCallbacks: ((update: ProgressUpdate) => void)[] = [];
  private taskManager: TaskManager;

  constructor() {
    this.executionQueue = new ExecutionQueue();
    this.dependencyResolver = new DependencyResolver();
    this.resultAggregator = new ResultAggregator();
    this.taskManager = new TaskManager();
  }

  async executeParallel(subtasks: SubTask[]): Promise<TaskResult[]> {
    const promises = subtasks.map((subtask) => this.executeSubtask(subtask));
    return Promise.all(promises);
  }

  async executeSequential(subtasks: SubTask[]): Promise<TaskResult[]> {
    const results: TaskResult[] = [];

    for (const subtask of subtasks) {
      const result = await this.executeSubtask(subtask);
      results.push(result);

      // Pass result to next subtask's context
      if (subtask.dependencies.length > 0) {
        this.resultAggregator.addResult(subtask.id, result);
      }
    }

    return results;
  }

  async executeDependencyGraph(graph: DependencyGraph): Promise<TaskResult[]> {
    const results: TaskResult[] = [];
    const completed = new Set<string>();
    const executing = new Map<string, Promise<TaskResult>>();

    const executeNode = async (nodeId: string): Promise<TaskResult> => {
      // Check if already completed
      if (completed.has(nodeId)) {
        return results.find((r) => r.taskId === nodeId)!;
      }

      // Check if already executing
      if (executing.has(nodeId)) {
        return executing.get(nodeId)!;
      }

      const node = graph.nodes.find((n) => n.id === nodeId);
      if (!node) throw new Error(`Node ${nodeId} not found`);

      // Create the execution promise first to prevent duplicate execution
      const promise = (async () => {
        // Wait for dependencies
        for (const dep of node.dependencies) {
          await executeNode(dep);
        }

        // Execute this node
        const result = await this.executeSubtask(node as SubTask);
        completed.add(nodeId);
        results.push(result);

        return result;
      })();

      executing.set(nodeId, promise);
      return promise;
    };

    // Start execution of all nodes (they will wait for dependencies)
    await Promise.all(graph.nodes.map((node) => executeNode(node.id)));

    return results;
  }

  monitorProgress(taskId: string): ProgressUpdate {
    return {
      taskId,
      status: "pending",
      percentComplete: 0,
      startTime: new Date(),
    };
  }

  onProgress(callback: (update: ProgressUpdate) => void): void {
    this.progressCallbacks.push(callback);
  }

  queueSubtask(subtask: SubTask): void {
    this.executionQueue.enqueue(subtask);
  }

  resolveExecutionOrder(subtasks: SubTask[]): SubTask[][] {
    return this.dependencyResolver.resolveDependencies(subtasks);
  }

  createTaskFromSubtask(subtask: SubTask): void {
    this.taskManager.createTask({
      mode: subtask.mode,
      message: subtask.description,
      parentTaskId: subtask.parentTaskId,
    });
  }

  private async executeSubtask(subtask: SubTask): Promise<TaskResult> {
    try {
      // Notify progress start
      this.notifyProgress({
        taskId: subtask.id,
        status: "in_progress",
        percentComplete: 0,
        startTime: new Date(),
      });

      // Simulate task execution for now - in real implementation, this would use Claude
      await new Promise((resolve) => setTimeout(resolve, 10)); // Minimal delay for simulation

      // For testing, we check if the mode is valid
      const isValidMode = [
        "code",
        "architect",
        "debug",
        "ask",
        "orchestrator",
      ].includes(subtask.mode);

      const success = isValidMode;
      const output = success
        ? `Executed ${subtask.description}`
        : `Invalid mode: ${subtask.mode}`;

      // Notify completion
      this.notifyProgress({
        taskId: subtask.id,
        status: success ? "completed" : "failed",
        percentComplete: 100,
        endTime: new Date(),
      });

      return {
        taskId: subtask.id,
        success,
        output,
        error: success ? undefined : `Invalid mode: ${subtask.mode}`,
        duration: 10,
        tokensUsed: 100,
      };
    } catch (error) {
      // Notify failure
      this.notifyProgress({
        taskId: subtask.id,
        status: "failed",
        percentComplete: 0,
        endTime: new Date(),
      });

      return {
        taskId: subtask.id,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: 0,
        tokensUsed: 0,
      };
    }
  }

  private notifyProgress(update: ProgressUpdate): void {
    this.progressCallbacks.forEach((callback) => callback(update));
  }
}

export class ExecutionQueue {
  private queue: SubTask[] = [];

  enqueue(subtask: SubTask): void {
    this.queue.push(subtask);
  }

  dequeue(): SubTask | undefined {
    return this.queue.shift();
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }
}

export class DependencyResolver {
  resolveDependencies(subtasks: SubTask[]): SubTask[][] {
    // Group tasks by dependency level
    const levels: SubTask[][] = [];
    const processed = new Set<string>();

    while (processed.size < subtasks.length) {
      const level = subtasks.filter(
        (task) =>
          !processed.has(task.id) &&
          task.dependencies.every((dep: string) => processed.has(dep)),
      );

      if (level.length === 0) {
        throw new Error("Circular dependency detected");
      }

      levels.push(level);
      level.forEach((task) => processed.add(task.id));
    }

    return levels;
  }
}

export class ResultAggregator {
  private results: Map<string, TaskResult> = new Map();

  addResult(taskId: string, result: TaskResult): void {
    this.results.set(taskId, result);
  }

  getResult(taskId: string): TaskResult | undefined {
    return this.results.get(taskId);
  }

  getAllResults(): TaskResult[] {
    return Array.from(this.results.values());
  }

  aggregateResults(taskIds: string[]): TaskResult[] {
    return taskIds
      .map((id) => this.getResult(id))
      .filter((result): result is TaskResult => result !== undefined);
  }
}
