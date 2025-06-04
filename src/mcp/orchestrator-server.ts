#!/usr/bin/env node

/**
 * Orchestrator MCP Server
 * Provides tools for task complexity analysis and orchestration
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TaskAnalyzer } from "../orchestrator/task-analyzer.js";

// Create MCP server instance
const server = new McpServer({
  name: "Orchestrator Server",
  version: "0.1.0",
});

// Task complexity analysis tool
server.tool(
  "analyze_complexity",
  "Analyze task complexity and suggest subtasks for orchestration",
  {
    task: z
      .string()
      .describe("Task description in any language (Japanese or English)"),
  },
  async ({ task }) => {
    try {
      const analyzer = new TaskAnalyzer();
      const result = analyzer.analyze(task);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Error analyzing task complexity:", error);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                isComplex: false,
                confidence: 0,
                reason: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                suggestedSubtasks: [],
                error: error instanceof Error ? error.message : "Unknown error",
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  },
);

// In-memory state storage for orchestration tasks
interface TaskState {
  id: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  subtasks?: TaskState[];
  result?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

const taskStates = new Map<string, TaskState>();

// Create or update task state
server.tool(
  "manage_task_state",
  "Create, update, or retrieve task state for orchestration tracking",
  {
    action: z
      .enum(["create", "update", "get", "list", "delete"])
      .describe("Action to perform on task state"),
    taskId: z
      .string()
      .optional()
      .describe("Task ID (required for update, get, delete actions)"),
    description: z
      .string()
      .optional()
      .describe("Task description (required for create action)"),
    status: z
      .enum(["pending", "in_progress", "completed", "failed"])
      .optional()
      .describe("Task status (for create/update actions)"),
    result: z.string().optional().describe("Task result (for update action)"),
    error: z.string().optional().describe("Error message (for update action)"),
  },
  async ({ action, taskId, description, status, result, error }) => {
    try {
      const now = new Date().toISOString();

      switch (action) {
        case "create": {
          if (!description) {
            throw new Error("Description is required for create action");
          }
          const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          const newTask: TaskState = {
            id,
            description,
            status: status || "pending",
            createdAt: now,
            updatedAt: now,
          };
          taskStates.set(id, newTask);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    action: "create",
                    task: newTask,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "update": {
          if (!taskId) {
            throw new Error("Task ID is required for update action");
          }
          const existingTask = taskStates.get(taskId);
          if (!existingTask) {
            throw new Error(`Task with ID ${taskId} not found`);
          }

          const updatedTask: TaskState = {
            ...existingTask,
            ...(status && { status }),
            ...(result && { result }),
            ...(error && { error }),
            updatedAt: now,
          };
          taskStates.set(taskId, updatedTask);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    action: "update",
                    task: updatedTask,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "get": {
          if (!taskId) {
            throw new Error("Task ID is required for get action");
          }
          const task = taskStates.get(taskId);
          if (!task) {
            throw new Error(`Task with ID ${taskId} not found`);
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    action: "get",
                    task,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "list": {
          const tasks = Array.from(taskStates.values());
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    action: "list",
                    tasks,
                    count: tasks.length,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "delete": {
          if (!taskId) {
            throw new Error("Task ID is required for delete action");
          }
          const deleted = taskStates.delete(taskId);
          if (!deleted) {
            throw new Error(`Task with ID ${taskId} not found`);
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    action: "delete",
                    taskId,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error("Error managing task state:", error);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                action,
                error: error instanceof Error ? error.message : "Unknown error",
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  },
);

// Progress tracking tool
server.tool(
  "track_progress",
  "Track and report progress across multiple orchestrated tasks",
  {
    filterStatus: z
      .enum(["pending", "in_progress", "completed", "failed"])
      .optional()
      .describe("Filter tasks by status"),
  },
  async ({ filterStatus }) => {
    try {
      const allTasks = Array.from(taskStates.values());
      const filteredTasks = filterStatus
        ? allTasks.filter((task) => task.status === filterStatus)
        : allTasks;

      const metrics = {
        total: allTasks.length,
        pending: allTasks.filter((t) => t.status === "pending").length,
        inProgress: allTasks.filter((t) => t.status === "in_progress").length,
        completed: allTasks.filter((t) => t.status === "completed").length,
        failed: allTasks.filter((t) => t.status === "failed").length,
      };

      const reportData = {
        metrics,
        recentTasks: filteredTasks
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )
          .slice(0, 5)
          .map((task) => ({
            id: task.id,
            description:
              task.description.substring(0, 50) +
              (task.description.length > 50 ? "..." : ""),
            status: task.status,
            updatedAt: task.updatedAt,
          })),
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                filterStatus,
                report: reportData,
                generatedAt: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      console.error("Error tracking progress:", error);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  },
);

// Batch prompt processing for orchestrated workflows
server.tool(
  "batch_prompt",
  "Process multiple prompts in batch for orchestrated task workflows",
  {
    prompts: z
      .array(
        z.object({
          id: z.string().describe("Unique identifier for this prompt"),
          content: z.string().describe("The prompt content to process"),
          taskId: z
            .string()
            .optional()
            .describe("Associated task ID for tracking"),
          metadata: z
            .record(z.any())
            .optional()
            .describe("Additional metadata for the prompt"),
        }),
      )
      .describe("Array of prompts to process in batch"),
    timeout: z
      .number()
      .min(1000)
      .max(300000)
      .optional()
      .describe("Timeout per prompt in milliseconds (default: 30000)"),
  },
  async ({ prompts, timeout = 30000 }) => {
    try {
      const results = [];
      const startTime = Date.now();

      // Validate prompts
      if (!prompts || prompts.length === 0) {
        throw new Error("At least one prompt is required");
      }

      if (prompts.length > 50) {
        throw new Error("Maximum 50 prompts allowed per batch");
      }

      // Process prompts sequentially
      const processQueue = [...prompts];

      {
        for (const prompt of processQueue) {
          const promptStartTime = Date.now();
          try {
            // Simulate prompt processing with a simple response
            const processingTime = Math.random() * 1000 + 500;
            await new Promise((resolve) =>
              setTimeout(resolve, Math.min(processingTime, timeout)),
            );

            const result = {
              id: prompt.id,
              status: "completed",
              response: `Processed prompt: ${prompt.content.substring(0, 100)}${prompt.content.length > 100 ? "..." : ""}`,
              processingTimeMs: Date.now() - promptStartTime,
              taskId: prompt.taskId,
              metadata: prompt.metadata,
            };

            results.push(result);

            // Update associated task if provided
            if (prompt.taskId && taskStates.has(prompt.taskId)) {
              const task = taskStates.get(prompt.taskId)!;
              taskStates.set(prompt.taskId, {
                ...task,
                status: "completed",
                result: `Batch prompt ${prompt.id} processed`,
                updatedAt: new Date().toISOString(),
              });
            }
          } catch (error) {
            results.push({
              id: prompt.id,
              status: "failed",
              error: error instanceof Error ? error.message : "Unknown error",
              processingTimeMs: Date.now() - promptStartTime,
              taskId: prompt.taskId,
              metadata: prompt.metadata,
            });

            if (prompt.taskId && taskStates.has(prompt.taskId)) {
              const task = taskStates.get(prompt.taskId)!;
              taskStates.set(prompt.taskId, {
                ...task,
                status: "failed",
                error: error instanceof Error ? error.message : "Unknown error",
                updatedAt: new Date().toISOString(),
              });
            }
          }
        }
      }

      const totalTime = Date.now() - startTime;
      const summary = {
        total: results.length,
        completed: results.filter((r) => r.status === "completed").length,
        failed: results.filter((r) => r.status === "failed").length,
        averageProcessingTime:
          results.length > 0
            ? Math.round(
                results.reduce((sum, r) => sum + (r.processingTimeMs || 0), 0) /
                  results.length,
              )
            : 0,
        totalProcessingTime: totalTime,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                timeout,
                summary,
                results,
                processedAt: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      console.error("Error processing batch prompts:", error);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                timeout,
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  },
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Orchestrator MCP server running on stdio");
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.error("Shutting down Orchestrator MCP server");
  process.exit(0);
});

if (require.main === module) {
  main().catch((error) => {
    console.error("Failed to start Orchestrator MCP server:", error);
    process.exit(1);
  });
}

export { server };
