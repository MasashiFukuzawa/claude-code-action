import { describe, test, expect, beforeEach } from "bun:test";
import { TaskManager } from "../../src/tasks/task-manager";
import type { CreateTaskParams, TaskResult } from "../../src/tasks/types";

describe("TaskManager", () => {
  let manager: TaskManager;

  beforeEach(() => {
    manager = new TaskManager();
  });

  test("should create a new task", () => {
    const params: CreateTaskParams = {
      mode: "code",
      message: "Implement feature A",
    };

    const task = manager.createTask(params);

    expect(task.id).toBeTruthy();
    expect(task.mode).toBe("code");
    expect(task.message).toBe("Implement feature A");
    expect(task.status).toBe("pending");
    expect(task.createdAt).toBeInstanceOf(Date);
  });

  test("should get task by id", () => {
    const params: CreateTaskParams = {
      mode: "debug",
      message: "Fix critical bug",
    };

    const task = manager.createTask(params);
    const retrieved = manager.getTask(task.id);

    expect(retrieved).toEqual(task);
  });

  test("should throw error for unknown task", () => {
    expect(() => manager.getTask("unknown-id")).toThrow(
      "Task not found: unknown-id",
    );
  });

  test("should update task status", async () => {
    const task = manager.createTask({
      mode: "code",
      message: "Test task",
    });

    // 少し待ってからステータスを更新
    await new Promise((resolve) => setTimeout(resolve, 1));
    manager.updateTaskStatus(task.id, "in_progress");
    const updated = manager.getTask(task.id);

    expect(updated.status).toBe("in_progress");
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
      task.updatedAt.getTime(),
    );
  });

  test("should throw error when updating status of unknown task", () => {
    expect(() => manager.updateTaskStatus("unknown-id", "in_progress")).toThrow(
      "Task not found: unknown-id",
    );
  });

  test("should throw error when updating result of unknown task", () => {
    expect(() =>
      manager.updateTaskResult("unknown-id", {
        taskId: "unknown-id",
        success: true,
      }),
    ).toThrow("Task not found: unknown-id");
  });

  test("should create subtask with parent reference", () => {
    const parentTask = manager.createTask({
      mode: "orchestrator",
      message: "Complex feature implementation",
    });

    const subTask = manager.createTask({
      mode: "code",
      message: "Implement component X",
      parentTaskId: parentTask.id,
    });

    expect(subTask.parentTaskId).toBe(parentTask.id);
  });

  test("should get subtasks by parent id", () => {
    const parentTask = manager.createTask({
      mode: "orchestrator",
      message: "Main task",
    });

    const subTask1 = manager.createTask({
      mode: "code",
      message: "Subtask 1",
      parentTaskId: parentTask.id,
    });

    const subTask2 = manager.createTask({
      mode: "debug",
      message: "Subtask 2",
      parentTaskId: parentTask.id,
    });

    const subTasks = manager.getSubTasks(parentTask.id);

    expect(subTasks.length).toBe(2);
    expect(subTasks.map((t) => t.id)).toContain(subTask1.id);
    expect(subTasks.map((t) => t.id)).toContain(subTask2.id);
  });

  test("should generate unique task ids", () => {
    const task1 = manager.createTask({ mode: "code", message: "Task 1" });
    const task2 = manager.createTask({ mode: "code", message: "Task 2" });

    expect(task1.id).not.toBe(task2.id);
  });

  test("should allow overriding default context in constructor", () => {
    const customManager = new TaskManager({ defaultMaxTokens: 5000 });
    const task = customManager.createTask({ mode: "code", message: "Test" });
    expect(task.context.maxTokens).toBe(5000);
  });

  test("should merge provided context with defaults", () => {
    const task = manager.createTask({
      mode: "code",
      message: "Test",
      context: { maxTokens: 3000, globalContext: { custom: "value" } },
    });
    expect(task.context.maxTokens).toBe(3000);
    expect(task.context.globalContext.custom).toBe("value");
    expect(task.context.previousResults).toEqual([]); // デフォルトが維持される
  });

  // executeTaskのテスト (モックを使用)
  describe("executeTask", () => {
    // 実際のタスク実行ロジックはTaskManagerの責務外なので、
    // ここでは状態遷移と結果の記録のみをテストする。
    // 実際の実行は各Modeのエンジンが行う。

    test("should update task status to in_progress then completed on successful execution", async () => {
      const task = manager.createTask({
        mode: "code",
        message: "Execute this",
      });
      // 実際の実行処理はモックする
      const mockExecution = async (): Promise<Omit<TaskResult, "taskId">> => {
        return { success: true, output: "Execution successful" };
      };

      const result = await manager.executeTask(task.id, mockExecution);

      expect(result.success).toBe(true);
      expect(result.output).toBe("Execution successful");
      const updatedTask = manager.getTask(task.id);
      expect(updatedTask.status).toBe("completed");
      expect(updatedTask.result).toEqual(result);
    });

    test("should update task status to in_progress then failed on unsuccessful execution", async () => {
      const task = manager.createTask({
        mode: "code",
        message: "Execute this",
      });
      const mockExecution = async (): Promise<Omit<TaskResult, "taskId">> => {
        return { success: false, error: "Execution failed" };
      };

      const result = await manager.executeTask(task.id, mockExecution);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Execution failed");
      const updatedTask = manager.getTask(task.id);
      expect(updatedTask.status).toBe("failed");
      expect(updatedTask.result).toEqual(result);
    });

    test("should throw error if task is not found", async () => {
      const mockExecution = async (): Promise<Omit<TaskResult, "taskId">> => {
        return { success: true };
      };
      await expect(
        manager.executeTask("unknown-id", mockExecution),
      ).rejects.toThrow("Task not found: unknown-id");
    });
  });
});
