import { describe, test, expect, beforeEach } from "bun:test";
import { SubtaskExecutionManager } from "../../../src/github/operations/subtask-execution";
import type { SubTask } from "../../../src/tasks/types";

describe("SubtaskExecutionManager", () => {
  let manager: SubtaskExecutionManager;

  beforeEach(() => {
    manager = new SubtaskExecutionManager();
  });

  test("should execute independent subtasks in parallel", async () => {
    const subtasks: SubTask[] = [
      {
        id: "subtask-1",
        description: "Task 1",
        mode: "code",
        priority: 1,
        dependencies: [],
        estimatedComplexity: 3,
      },
      {
        id: "subtask-2",
        description: "Task 2",
        mode: "code",
        priority: 1,
        dependencies: [],
        estimatedComplexity: 3,
      },
    ];

    const startTime = Date.now();
    const results = await manager.executeParallel(subtasks);
    const duration = Date.now() - startTime;

    expect(results.length).toBe(2);
    expect(results.every((r) => r.success)).toBe(true);
    // Parallel execution should be faster than sequential
    expect(duration).toBeLessThan(subtasks.length * 1000);
  });

  test("should execute dependent subtasks sequentially", async () => {
    const subtasks: SubTask[] = [
      {
        id: "subtask-1",
        description: "Base task",
        mode: "code",
        priority: 1,
        dependencies: [],
        estimatedComplexity: 3,
      },
      {
        id: "subtask-2",
        description: "Dependent task",
        mode: "code",
        priority: 2,
        dependencies: ["subtask-1"],
        estimatedComplexity: 3,
      },
    ];

    const results = await manager.executeSequential(subtasks);

    expect(results.length).toBe(2);
    expect(results[0].taskId).toBe("subtask-1");
    expect(results[1].taskId).toBe("subtask-2");
  });

  test("should execute dependency graph correctly", async () => {
    const graph = {
      nodes: [
        {
          id: "A",
          mode: "code",
          dependencies: [],
          description: "Task A",
          priority: 1,
          estimatedComplexity: 3,
        },
        {
          id: "B",
          mode: "code",
          dependencies: ["A"],
          description: "Task B",
          priority: 2,
          estimatedComplexity: 3,
        },
        {
          id: "C",
          mode: "code",
          dependencies: ["A"],
          description: "Task C",
          priority: 2,
          estimatedComplexity: 3,
        },
        {
          id: "D",
          mode: "code",
          dependencies: ["B", "C"],
          description: "Task D",
          priority: 3,
          estimatedComplexity: 3,
        },
      ],
      edges: [
        { from: "A", to: "B", type: "sequential" },
        { from: "A", to: "C", type: "sequential" },
        { from: "B", to: "D", type: "sequential" },
        { from: "C", to: "D", type: "sequential" },
      ],
    };

    const results = await manager.executeDependencyGraph(graph);

    expect(results.length).toBe(4);
    // A should complete before B and C
    const aIndex = results.findIndex((r) => r.taskId === "A");
    const bIndex = results.findIndex((r) => r.taskId === "B");
    const cIndex = results.findIndex((r) => r.taskId === "C");
    const dIndex = results.findIndex((r) => r.taskId === "D");

    expect(aIndex).toBeLessThan(bIndex);
    expect(aIndex).toBeLessThan(cIndex);
    expect(dIndex).toBe(3); // D should be last
  });

  test("should monitor progress during execution", async () => {
    const subtask: SubTask = {
      id: "monitor-task",
      description: "Task to monitor",
      mode: "code",
      priority: 1,
      dependencies: [],
      estimatedComplexity: 3,
    };

    const progress = manager.monitorProgress(subtask.id);

    expect(progress.taskId).toBe(subtask.id);
    expect(progress.status).toBe("pending");
  });

  test("should handle execution errors gracefully", async () => {
    const problematicSubtask: SubTask = {
      id: "error-task",
      description: "This task will fail",
      mode: "invalid-mode",
      priority: 1,
      dependencies: [],
      estimatedComplexity: 3,
    };

    const results = await manager.executeParallel([problematicSubtask]);

    expect(results.length).toBe(1);
    expect(results[0].success).toBe(false);
    expect(results[0].error).toBeDefined();
  });
});
