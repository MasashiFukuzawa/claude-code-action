import { describe, test, expect } from "bun:test";
import { taskManager, type TaskResult } from "../../src/tasks";

describe("Task System Integration", () => {
  test("should handle task lifecycle workflow", async () => {
    // 親タスク作成
    const parentTask = taskManager.createTask({
      mode: "orchestrator",
      message: "Implement user authentication system",
    });

    expect(parentTask.status).toBe("pending");

    // サブタスク作成
    const subTask1 = taskManager.createTask({
      mode: "code",
      message: "Create user model",
      parentTaskId: parentTask.id,
    });

    const subTask2 = taskManager.createTask({
      mode: "code",
      message: "Implement login endpoint",
      parentTaskId: parentTask.id,
    });

    // サブタスク取得
    const subTasks = taskManager.getSubTasks(parentTask.id);
    expect(subTasks.length).toBe(2);

    // タスク実行シミュレーション (executeTaskを使用)
    const subTask1FromManager = taskManager.getTask(subTask1.id); // 最新の状態を取得

    // モックの実行関数
    const mockExecutionFn = async (
      taskSuccess: boolean,
      outputMsg?: string,
      errorMsg?: string,
      files?: string[],
    ): Promise<Omit<TaskResult, "taskId">> => {
      await new Promise((resolve) => setTimeout(resolve, 10)); // 非同期処理をシミュレート
      if (taskSuccess) {
        return { success: true, output: outputMsg, createdFiles: files };
      } else {
        return { success: false, error: errorMsg };
      }
    };

    // subTask1 の実行 (成功ケース)
    await taskManager.executeTask(subTask1FromManager.id, () =>
      mockExecutionFn(true, "User model created successfully", undefined, [
        "src/models/user.ts",
      ]),
    );

    const completedTask = taskManager.getTask(subTask1.id);
    expect(completedTask.status).toBe("completed");
    expect(completedTask.result?.success).toBe(true);
    expect(completedTask.result?.createdFiles).toEqual(["src/models/user.ts"]);
    expect(completedTask.result?.duration).toBeGreaterThanOrEqual(10);

    // subTask2 の実行 (失敗ケース)
    await taskManager.executeTask(subTask2.id, () =>
      mockExecutionFn(false, undefined, "Endpoint implementation failed"),
    );
    const failedTask = taskManager.getTask(subTask2.id);
    expect(failedTask.status).toBe("failed");
    expect(failedTask.result?.success).toBe(false);
    expect(failedTask.result?.error).toBe("Endpoint implementation failed");
  });

  test("should support context passing between tasks", () => {
    const task = taskManager.createTask({
      mode: "code",
      message: "Process user data",
      context: {
        globalContext: { userId: "123" },
        modeSpecificContext: { validateInput: true },
        maxTokens: 4000,
      },
    });

    expect(task.context.globalContext.userId).toBe("123");
    expect(task.context.modeSpecificContext.validateInput).toBe(true);
    expect(task.context.maxTokens).toBe(4000);
  });
});
