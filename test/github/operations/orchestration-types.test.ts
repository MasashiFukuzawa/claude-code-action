import { describe, test, expect } from "bun:test";
import type {
  OrchestrationResult,
  ExecutionPlan,
  ProgressUpdate,
  TaskInfo,
  BoomerangRequest,
  BoomerangResult,
  ErrorRecoveryInfo,
  ExecutionMetrics,
} from "../../../src/github/operations/orchestration-types";

describe("Orchestration Types", () => {
  test("should define OrchestrationResult correctly", () => {
    const result: OrchestrationResult = {
      success: true,
      taskId: "main-task-1",
      subtaskResults: [
        {
          taskId: "subtask-1",
          success: true,
          output: "Component implemented",
          duration: 120,
          tokensUsed: 1500,
        },
      ],
      totalDuration: 300,
      totalTokensUsed: 5000,
      summary: "All subtasks completed successfully",
    };

    expect(result.success).toBe(true);
    expect(result.subtaskResults.length).toBe(1);
    expect(result.totalTokensUsed).toBe(5000);
  });

  test("should define ExecutionPlan correctly", () => {
    const plan: ExecutionPlan = {
      phases: [
        {
          phaseId: "phase-1",
          name: "Initial Setup",
          subtasks: ["subtask-1", "subtask-2"],
          executionType: "parallel",
          estimatedDuration: 60,
        },
      ],
      dependencies: {
        "subtask-3": ["subtask-1", "subtask-2"],
        "subtask-4": ["subtask-3"],
      },
      estimatedTotalDuration: 180,
      criticalPath: ["subtask-1", "subtask-3", "subtask-4"],
    };

    expect(plan.phases.length).toBe(1);
    expect(plan.phases[0].executionType).toBe("parallel");
    expect(plan.criticalPath.length).toBe(3);
  });

  test("should define ProgressUpdate correctly", () => {
    const progress: ProgressUpdate = {
      taskId: "subtask-1",
      status: "in_progress",
      percentComplete: 75,
      currentStep: "Running tests",
      startTime: new Date(),
      estimatedTimeRemaining: 30,
    };

    expect(progress.status).toBe("in_progress");
    expect(progress.percentComplete).toBe(75);
    expect(progress.currentStep).toBe("Running tests");
  });

  test("should define BoomerangRequest correctly", () => {
    const request: BoomerangRequest = {
      task: "Refactor component X",
      targetMode: "code-refactor",
      returnContext: true,
      preserveResults: false,
    };
    expect(request.targetMode).toBe("code-refactor");
    expect(request.preserveResults).toBe(false);
  });

  test("should define BoomerangResult correctly", () => {
    const result: BoomerangResult = {
      success: true,
      delegatedMode: "code-refactor",
      result: "Component X refactored successfully.",
      tokensUsed: 250,
      duration: 60,
    };
    expect(result.success).toBe(true);
    expect(result.tokensUsed).toBe(250);
  });

  test("should define ErrorRecoveryInfo correctly", () => {
    const recoveryInfo: ErrorRecoveryInfo = {
      strategy: "retry",
      attempts: 3,
      recoveredTasks: ["task-A"],
      unrecoverableTasks: ["task-B"],
    };
    expect(recoveryInfo.strategy).toBe("retry");
    expect(recoveryInfo.recoveredTasks.length).toBe(1);
  });

  test("should define ExecutionMetrics correctly", () => {
    const metrics: ExecutionMetrics = {
      startTime: new Date(),
      tokensUsed: 1200,
      subtasksCompleted: 3,
      subtasksFailed: 0,
    };
    // endTime, duration, parallelizationEfficiency はオプショナルなので、必須項目のみテスト
    expect(metrics.tokensUsed).toBe(1200);
    expect(metrics.subtasksFailed).toBe(0);
  });
});
