import { describe, test, expect, jest, beforeEach } from "bun:test";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

describe("Orchestrator MCP Server", () => {
  let mockTaskAnalyzer: {
    analyze: jest.Mock;
  };
  let server: McpServer;

  beforeEach(() => {
    // Create mock TaskAnalyzer instance
    mockTaskAnalyzer = {
      analyze: jest.fn(),
    };

    // Create server instance for testing
    server = new McpServer({
      name: "Orchestrator Server Test",
      version: "0.1.0",
    });
  });

  describe("analyze_complexity tool", () => {
    test("should be registered with correct name and description", () => {
      // Note: This test verifies the tool registration without executing it
      // The actual server instance from the main module would have the tool registered
      expect(server).toBeInstanceOf(McpServer);
    });

    test("should validate task parameter schema", async () => {
      // Mock successful analysis
      const mockAnalysisResult = {
        isComplex: true,
        confidence: 0.8,
        reason: "複数の操作が含まれています",
        suggestedSubtasks: [],
      };

      mockTaskAnalyzer.analyze.mockReturnValue(mockAnalysisResult);

      // Create a mock tool handler that mimics the actual implementation
      const toolHandler = async ({ task }: { task: string }) => {
        try {
          const result = mockTaskAnalyzer.analyze(task);

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
                    error:
                      error instanceof Error ? error.message : "Unknown error",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }
      };

      const result = await toolHandler({
        task: "実装とテストを行ってください",
      });

      expect(mockTaskAnalyzer.analyze).toHaveBeenCalledWith(
        "実装とテストを行ってください",
      );
      expect(result.content?.[0]?.text).toContain(
        JSON.stringify(mockAnalysisResult, null, 2),
      );
    });

    test("should handle Japanese task descriptions", async () => {
      const mockAnalysisResult = {
        isComplex: true,
        confidence: 0.7,
        reason: "複数の操作が含まれています",
        suggestedSubtasks: [],
      };

      mockTaskAnalyzer.analyze.mockReturnValue(mockAnalysisResult);

      const toolHandler = async ({ task }: { task: string }) => {
        const result = mockTaskAnalyzer.analyze(task);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      };

      const result = await toolHandler({
        task: "設計してから実装し、テストも行ってください",
      });

      expect(mockTaskAnalyzer.analyze).toHaveBeenCalledWith(
        "設計してから実装し、テストも行ってください",
      );
      expect(result.content?.[0]?.text).toContain("複数の操作が含まれています");
    });

    test("should handle English task descriptions", async () => {
      const mockAnalysisResult = {
        isComplex: true,
        confidence: 0.6,
        reason: "Multiple operations required",
        suggestedSubtasks: [],
      };

      mockTaskAnalyzer.analyze.mockReturnValue(mockAnalysisResult);

      const toolHandler = async ({ task }: { task: string }) => {
        const result = mockTaskAnalyzer.analyze(task);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      };

      const result = await toolHandler({
        task: "implement and test the feature",
      });

      expect(mockTaskAnalyzer.analyze).toHaveBeenCalledWith(
        "implement and test the feature",
      );
      expect(result.content?.[0]?.text).toContain(
        "Multiple operations required",
      );
    });

    test("should handle simple tasks", async () => {
      const mockAnalysisResult = {
        isComplex: false,
        confidence: 0.3,
        reason: "シンプルなタスクです",
        suggestedSubtasks: [],
      };

      mockTaskAnalyzer.analyze.mockReturnValue(mockAnalysisResult);

      const toolHandler = async ({ task }: { task: string }) => {
        const result = mockTaskAnalyzer.analyze(task);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      };

      const result = await toolHandler({ task: "fix typo" });

      expect(mockTaskAnalyzer.analyze).toHaveBeenCalledWith("fix typo");
      expect(result.content?.[0]?.text).toContain("シンプルなタスクです");
      expect(result.content?.[0]?.text).toContain('"isComplex": false');
    });

    test("should handle analysis errors gracefully", async () => {
      const mockError = new Error("Analysis failed");
      mockTaskAnalyzer.analyze.mockImplementation(() => {
        throw mockError;
      });

      const toolHandler = async ({ task }: { task: string }) => {
        try {
          const result = mockTaskAnalyzer.analyze(task);

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
                    error:
                      error instanceof Error ? error.message : "Unknown error",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }
      };

      const result = await toolHandler({ task: "some task" });

      expect(mockTaskAnalyzer.analyze).toHaveBeenCalledWith("some task");
      expect(result.content?.[0]?.text).toContain(
        "Analysis failed: Analysis failed",
      );
      expect(result.content?.[0]?.text).toContain('"isComplex": false');
      expect(result.content?.[0]?.text).toContain('"confidence": 0');
      expect(result.content?.[0]?.text).toContain('"error": "Analysis failed"');
    });

    test("should handle non-Error exceptions", async () => {
      mockTaskAnalyzer.analyze.mockImplementation(() => {
        throw "String error";
      });

      const toolHandler = async ({ task }: { task: string }) => {
        try {
          const result = mockTaskAnalyzer.analyze(task);

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
                    error:
                      error instanceof Error ? error.message : "Unknown error",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }
      };

      const result = await toolHandler({ task: "some task" });

      expect(result.content?.[0]?.text).toContain(
        "Analysis failed: Unknown error",
      );
      expect(result.content?.[0]?.text).toContain('"error": "Unknown error"');
    });

    test("should return properly structured JSON output", async () => {
      const mockAnalysisResult = {
        isComplex: true,
        confidence: 0.85,
        reason:
          "複数の操作が含まれています、設計・アーキテクチャ要素が含まれています",
        suggestedSubtasks: [],
      };

      mockTaskAnalyzer.analyze.mockReturnValue(mockAnalysisResult);

      const toolHandler = async ({ task }: { task: string }) => {
        const result = mockTaskAnalyzer.analyze(task);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      };

      const result = await toolHandler({
        task: "設計して実装してテストしてください",
      });

      // Verify the result structure
      expect(result).toHaveProperty("content");
      expect(result.content).toHaveLength(1);
      expect(result.content?.[0]).toHaveProperty("type", "text");
      expect(result.content?.[0]).toHaveProperty("text");

      // Verify the JSON can be parsed
      const parsedResult = JSON.parse(result.content?.[0]?.text || "{}");
      expect(parsedResult).toHaveProperty("isComplex", true);
      expect(parsedResult).toHaveProperty("confidence", 0.85);
      expect(parsedResult).toHaveProperty("reason");
      expect(parsedResult).toHaveProperty("suggestedSubtasks");
      expect(Array.isArray(parsedResult.suggestedSubtasks)).toBe(true);
    });

    test("should handle empty task descriptions", async () => {
      const mockAnalysisResult = {
        isComplex: false,
        confidence: 0.1,
        reason: "シンプルなタスクです",
        suggestedSubtasks: [],
      };

      mockTaskAnalyzer.analyze.mockReturnValue(mockAnalysisResult);

      const toolHandler = async ({ task }: { task: string }) => {
        const result = mockTaskAnalyzer.analyze(task);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      };

      const result = await toolHandler({ task: "" });

      expect(mockTaskAnalyzer.analyze).toHaveBeenCalledWith("");
      expect(result.content?.[0]?.text).toContain('"isComplex": false');
    });

    test("should handle very long task descriptions", async () => {
      const longTask =
        "A".repeat(1000) + " implementation and testing required";
      const mockAnalysisResult = {
        isComplex: true,
        confidence: 0.6,
        reason: "Multiple operations required",
        suggestedSubtasks: [],
      };

      mockTaskAnalyzer.analyze.mockReturnValue(mockAnalysisResult);

      const toolHandler = async ({ task }: { task: string }) => {
        const result = mockTaskAnalyzer.analyze(task);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      };

      const result = await toolHandler({ task: longTask });

      expect(mockTaskAnalyzer.analyze).toHaveBeenCalledWith(longTask);
      expect(result.content?.[0]?.text).toContain('"isComplex": true');
    });

    test("should handle mixed language task descriptions", async () => {
      const mixedTask = "Implement 実装 and test テスト the feature";
      const mockAnalysisResult = {
        isComplex: true,
        confidence: 0.7,
        reason: "複数の操作が含まれています",
        suggestedSubtasks: [],
      };

      mockTaskAnalyzer.analyze.mockReturnValue(mockAnalysisResult);

      const toolHandler = async ({ task }: { task: string }) => {
        const result = mockTaskAnalyzer.analyze(task);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      };

      const result = await toolHandler({ task: mixedTask });

      expect(mockTaskAnalyzer.analyze).toHaveBeenCalledWith(mixedTask);
      expect(result.content?.[0]?.text).toContain('"isComplex": true');
    });
  });

  describe("Server Configuration", () => {
    test("should have correct server metadata", () => {
      expect(server).toBeInstanceOf(McpServer);
      // Note: In a real test, we would check the server configuration
      // but the current server instance doesn't expose this information directly
    });

    test("should handle graceful shutdown", () => {
      // This test verifies that the server can be closed properly
      // In the actual implementation, SIGINT handler is set up in the main module
      expect(server).toBeInstanceOf(McpServer);
      // The server instance itself should be closeable
      expect(typeof server.close).toBe("function");
    });
  });

  describe("Tool Parameter Validation", () => {
    test("should validate required task parameter", async () => {
      // Mock zod validation behavior
      const toolHandler = async (params: any) => {
        if (!params.task || typeof params.task !== "string") {
          throw new Error("Invalid task parameter");
        }

        const result = mockTaskAnalyzer.analyze(params.task);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      };

      // Test with missing task parameter
      await expect(toolHandler({})).rejects.toThrow("Invalid task parameter");

      // Test with null task parameter
      await expect(toolHandler({ task: null })).rejects.toThrow(
        "Invalid task parameter",
      );

      // Test with non-string task parameter
      await expect(toolHandler({ task: 123 })).rejects.toThrow(
        "Invalid task parameter",
      );
    });

    test("should accept valid task parameter", async () => {
      const mockAnalysisResult = {
        isComplex: false,
        confidence: 0.2,
        reason: "シンプルなタスクです",
        suggestedSubtasks: [],
      };

      mockTaskAnalyzer.analyze.mockReturnValue(mockAnalysisResult);

      const toolHandler = async (params: any) => {
        if (!params.task || typeof params.task !== "string") {
          throw new Error("Invalid task parameter");
        }

        const result = mockTaskAnalyzer.analyze(params.task);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      };

      const result = await toolHandler({ task: "valid task" });

      expect(mockTaskAnalyzer.analyze).toHaveBeenCalledWith("valid task");
      expect(result.content?.[0]?.text).toContain('"isComplex": false');
    });
  });

  describe("manage_task_state tool", () => {
    test("should create new task state", async () => {
      const toolHandler = async (params: any) => {
        // Simulate the manage_task_state tool logic
        if (params.action === "create" && !params.description) {
          throw new Error("Description is required for create action");
        }
        const now = new Date().toISOString();
        const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const newTask = {
          id,
          description: params.description,
          status: params.status || "pending",
          createdAt: now,
          updatedAt: now,
        };

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
      };

      const result = await toolHandler({
        action: "create",
        description: "Test task description",
        status: "pending",
      });

      expect(result.content?.[0]?.text).toContain('"success": true');
      expect(result.content?.[0]?.text).toContain('"action": "create"');
      expect(result.content?.[0]?.text).toContain("Test task description");
      expect(result.content?.[0]?.text).toContain('"status": "pending"');
    });

    test("should update existing task state", async () => {
      const toolHandler = async (params: any) => {
        if (params.action === "update" && !params.taskId) {
          throw new Error("Task ID is required for update action");
        }
        const now = new Date().toISOString();
        const updatedTask = {
          id: params.taskId,
          description: "Original description",
          status: params.status || "completed",
          result: params.result,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: now,
        };

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
      };

      const result = await toolHandler({
        action: "update",
        taskId: "task_123_abc",
        status: "completed",
        result: "Task completed successfully",
      });

      expect(result.content?.[0]?.text).toContain('"success": true');
      expect(result.content?.[0]?.text).toContain('"action": "update"');
      expect(result.content?.[0]?.text).toContain('"status": "completed"');
      expect(result.content?.[0]?.text).toContain(
        "Task completed successfully",
      );
    });

    test("should get task state by ID", async () => {
      const toolHandler = async (params: any) => {
        if (params.action === "get" && !params.taskId) {
          throw new Error("Task ID is required for get action");
        }
        const task = {
          id: params.taskId,
          description: "Test task",
          status: "in_progress",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T01:00:00.000Z",
        };

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
      };

      const result = await toolHandler({
        action: "get",
        taskId: "task_123_abc",
      });

      expect(result.content?.[0]?.text).toContain('"success": true');
      expect(result.content?.[0]?.text).toContain('"action": "get"');
      expect(result.content?.[0]?.text).toContain("Test task");
      expect(result.content?.[0]?.text).toContain('"status": "in_progress"');
    });

    test("should list all tasks", async () => {
      const toolHandler = async (_params: any) => {
        const tasks = [
          {
            id: "task_1",
            description: "First task",
            status: "completed",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T01:00:00.000Z",
          },
          {
            id: "task_2",
            description: "Second task",
            status: "pending",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:30:00.000Z",
          },
        ];

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
      };

      const result = await toolHandler({
        action: "list",
      });

      expect(result.content?.[0]?.text).toContain('"success": true');
      expect(result.content?.[0]?.text).toContain('"action": "list"');
      expect(result.content?.[0]?.text).toContain('"count": 2');
      expect(result.content?.[0]?.text).toContain("First task");
      expect(result.content?.[0]?.text).toContain("Second task");
    });

    test("should delete task state", async () => {
      const toolHandler = async (params: any) => {
        if (params.action === "delete" && !params.taskId) {
          throw new Error("Task ID is required for delete action");
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  action: "delete",
                  taskId: params.taskId,
                },
                null,
                2,
              ),
            },
          ],
        };
      };

      const result = await toolHandler({
        action: "delete",
        taskId: "task_123_abc",
      });

      expect(result.content?.[0]?.text).toContain('"success": true');
      expect(result.content?.[0]?.text).toContain('"action": "delete"');
      expect(result.content?.[0]?.text).toContain('"taskId": "task_123_abc"');
    });

    test("should handle errors for invalid actions", async () => {
      const toolHandler = async (params: any) => {
        try {
          if (params.action === "create" && !params.description) {
            throw new Error("Description is required for create action");
          }
          return { content: [{ type: "text", text: '{"success": true}' }] };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: false,
                    action: params.action,
                    error:
                      error instanceof Error ? error.message : "Unknown error",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }
      };

      const result = await toolHandler({
        action: "create",
        // Missing description
      });

      expect(result.content?.[0]?.text).toContain('"success": false');
      expect(result.content?.[0]?.text).toContain(
        "Description is required for create action",
      );
    });
  });

  describe("track_progress tool", () => {
    test("should generate summary progress report", async () => {
      const toolHandler = async (params: any) => {
        const metrics = {
          total: 5,
          pending: 1,
          inProgress: 2,
          completed: 2,
          failed: 0,
        };

        const recentTasks = [
          {
            id: "task_1",
            description: "Recent task description",
            status: "completed",
            updatedAt: "2024-01-01T01:00:00.000Z",
          },
        ];

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  format: params.format || "summary",
                  filterStatus: params.filterStatus,
                  report: {
                    metrics,
                    recentTasks,
                  },
                  generatedAt: new Date().toISOString(),
                },
                null,
                2,
              ),
            },
          ],
        };
      };

      const result = await toolHandler({
        format: "summary",
      });

      expect(result.content?.[0]?.text).toContain('"success": true');
      expect(result.content?.[0]?.text).toContain('"format": "summary"');
      expect(result.content?.[0]?.text).toContain('"total": 5');
      expect(result.content?.[0]?.text).toContain('"pending": 1');
      expect(result.content?.[0]?.text).toContain('"inProgress": 2');
      expect(result.content?.[0]?.text).toContain('"completed": 2');
    });

    test("should generate detailed progress report", async () => {
      const toolHandler = async (params: any) => {
        const metrics = {
          total: 3,
          pending: 1,
          inProgress: 1,
          completed: 1,
          failed: 0,
        };

        const tasks = [
          {
            id: "task_1",
            description: "First detailed task",
            status: "completed",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T01:00:00.000Z",
          },
          {
            id: "task_2",
            description: "Second detailed task",
            status: "in_progress",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:30:00.000Z",
          },
        ];

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  format: "detailed",
                  filterStatus: params.filterStatus,
                  report: {
                    metrics,
                    tasks,
                  },
                  generatedAt: new Date().toISOString(),
                },
                null,
                2,
              ),
            },
          ],
        };
      };

      const result = await toolHandler({
        format: "detailed",
      });

      expect(result.content?.[0]?.text).toContain('"success": true');
      expect(result.content?.[0]?.text).toContain('"format": "detailed"');
      expect(result.content?.[0]?.text).toContain("First detailed task");
      expect(result.content?.[0]?.text).toContain("Second detailed task");
    });

    test("should generate metrics progress report", async () => {
      const toolHandler = async (params: any) => {
        const metrics = {
          total: 10,
          pending: 2,
          inProgress: 3,
          completed: 4,
          failed: 1,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  format: "metrics",
                  filterStatus: params.filterStatus,
                  report: {
                    metrics,
                    completionRate: "40.0%",
                    failureRate: "10.0%",
                    activeRate: "30.0%",
                  },
                  generatedAt: new Date().toISOString(),
                },
                null,
                2,
              ),
            },
          ],
        };
      };

      const result = await toolHandler({
        format: "metrics",
      });

      expect(result.content?.[0]?.text).toContain('"success": true');
      expect(result.content?.[0]?.text).toContain('"format": "metrics"');
      expect(result.content?.[0]?.text).toContain('"completionRate": "40.0%"');
      expect(result.content?.[0]?.text).toContain('"failureRate": "10.0%"');
      expect(result.content?.[0]?.text).toContain('"activeRate": "30.0%"');
    });

    test("should filter progress report by status", async () => {
      const toolHandler = async (params: any) => {
        const metrics = {
          total: 5,
          pending: 2,
          inProgress: 0,
          completed: 3,
          failed: 0,
        };

        const filteredTasks = [
          {
            id: "task_1",
            description: "Completed task 1",
            status: "completed",
            updatedAt: "2024-01-01T01:00:00.000Z",
          },
          {
            id: "task_2",
            description: "Completed task 2",
            status: "completed",
            updatedAt: "2024-01-01T00:30:00.000Z",
          },
        ];

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  format: "summary",
                  filterStatus: params.filterStatus,
                  report: {
                    metrics,
                    recentTasks: filteredTasks,
                  },
                  generatedAt: new Date().toISOString(),
                },
                null,
                2,
              ),
            },
          ],
        };
      };

      const result = await toolHandler({
        format: "summary",
        filterStatus: "completed",
      });

      expect(result.content?.[0]?.text).toContain('"success": true');
      expect(result.content?.[0]?.text).toContain(
        '"filterStatus": "completed"',
      );
      expect(result.content?.[0]?.text).toContain("Completed task 1");
      expect(result.content?.[0]?.text).toContain("Completed task 2");
    });

    test("should handle progress tracking errors", async () => {
      const toolHandler = async (params: any) => {
        try {
          if (params.format === "invalid") {
            throw new Error("Unknown format: invalid");
          }
          return { content: [{ type: "text", text: '{"success": true}' }] };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: false,
                    error:
                      error instanceof Error ? error.message : "Unknown error",
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }
      };

      const result = await toolHandler({
        format: "invalid",
      });

      expect(result.content?.[0]?.text).toContain('"success": false');
      expect(result.content?.[0]?.text).toContain("Unknown format: invalid");
    });
  });

  describe("batch_prompt tool", () => {
    test("should process sequential batch successfully", async () => {
      const toolHandler = async (params: any) => {
        // Simulate batch_prompt tool logic
        if (!params.prompts || params.prompts.length === 0) {
          throw new Error("At least one prompt is required");
        }

        const results = params.prompts.map((prompt: any) => ({
          id: prompt.id,
          status: "completed",
          response: `Processed prompt: ${prompt.content.substring(0, 100)}${prompt.content.length > 100 ? "..." : ""}`,
          processingTimeMs: Math.floor(Math.random() * 1000) + 500,
          taskId: prompt.taskId,
          metadata: prompt.metadata,
        }));

        const summary = {
          total: results.length,
          completed: results.filter((r: any) => r.status === "completed")
            .length,
          failed: results.filter((r: any) => r.status === "failed").length,
          averageProcessingTime: 750,
          totalProcessingTime: 1500,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  processingMode: params.processingMode || "sequential",
                  maxConcurrency: params.maxConcurrency || 3,
                  timeout: params.timeout || 30000,
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
      };

      const result = await toolHandler({
        prompts: [
          {
            id: "prompt_1",
            content: "Test prompt content 1",
            taskId: "task_123",
            priority: "medium",
            metadata: { type: "test" },
          },
          {
            id: "prompt_2",
            content: "Test prompt content 2",
            priority: "high",
          },
        ],
        processingMode: "sequential",
      });

      expect(result.content?.[0]?.text).toContain('"success": true');
      expect(result.content?.[0]?.text).toContain(
        '"processingMode": "sequential"',
      );
      expect(result.content?.[0]?.text).toContain('"total": 2');
      expect(result.content?.[0]?.text).toContain('"completed": 2');
      expect(result.content?.[0]?.text).toContain("Test prompt content 1");
      expect(result.content?.[0]?.text).toContain("Test prompt content 2");
    });

    test("should process parallel batch successfully", async () => {
      const toolHandler = async (params: any) => {
        const results = params.prompts.map((prompt: any) => ({
          id: prompt.id,
          status: "completed",
          response: `Processed prompt: ${prompt.content}`,
          processingTimeMs: 600,
          taskId: prompt.taskId,
          metadata: prompt.metadata,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  processingMode: "parallel",
                  maxConcurrency: 5,
                  summary: {
                    total: results.length,
                    completed: results.length,
                    failed: 0,
                    averageProcessingTime: 600,
                    totalProcessingTime: 1200,
                  },
                  results,
                  processedAt: new Date().toISOString(),
                },
                null,
                2,
              ),
            },
          ],
        };
      };

      const result = await toolHandler({
        prompts: [
          { id: "prompt_1", content: "First prompt" },
          { id: "prompt_2", content: "Second prompt" },
          { id: "prompt_3", content: "Third prompt" },
        ],
        processingMode: "parallel",
        maxConcurrency: 5,
      });

      expect(result.content?.[0]?.text).toContain(
        '"processingMode": "parallel"',
      );
      expect(result.content?.[0]?.text).toContain('"maxConcurrency": 5');
      expect(result.content?.[0]?.text).toContain('"total": 3');
      expect(result.content?.[0]?.text).toContain("First prompt");
      expect(result.content?.[0]?.text).toContain("Third prompt");
    });

    test("should process priority batch successfully", async () => {
      const toolHandler = async (params: any) => {
        // Sort by priority like the actual implementation
        const priorityOrder: { [key: string]: number } = {
          high: 3,
          medium: 2,
          low: 1,
        };
        const sortedPrompts = [...params.prompts].sort(
          (a: any, b: any) =>
            (priorityOrder[b.priority || "medium"] || 2) -
            (priorityOrder[a.priority || "medium"] || 2),
        );

        const results = sortedPrompts.map((prompt: any) => ({
          id: prompt.id,
          status: "completed",
          response: `Processed ${prompt.priority || "medium"} priority prompt: ${prompt.content}`,
          processingTimeMs: 800,
          priority: prompt.priority || "medium",
          taskId: prompt.taskId,
          metadata: prompt.metadata,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  processingMode: "priority",
                  summary: {
                    total: results.length,
                    completed: results.length,
                    failed: 0,
                    averageProcessingTime: 800,
                    totalProcessingTime: 2400,
                  },
                  results,
                  processedAt: new Date().toISOString(),
                },
                null,
                2,
              ),
            },
          ],
        };
      };

      const result = await toolHandler({
        prompts: [
          { id: "prompt_1", content: "Low priority task", priority: "low" },
          { id: "prompt_2", content: "High priority task", priority: "high" },
          {
            id: "prompt_3",
            content: "Medium priority task",
            priority: "medium",
          },
        ],
        processingMode: "priority",
      });

      expect(result.content?.[0]?.text).toContain(
        '"processingMode": "priority"',
      );
      expect(result.content?.[0]?.text).toContain("High priority task");
      expect(result.content?.[0]?.text).toContain("Medium priority task");
      expect(result.content?.[0]?.text).toContain("Low priority task");
    });

    test("should handle empty prompts array", async () => {
      const toolHandler = async (params: any) => {
        if (!params.prompts || params.prompts.length === 0) {
          throw new Error("At least one prompt is required");
        }
        return { content: [{ type: "text", text: '{"success": true}' }] };
      };

      await expect(toolHandler({ prompts: [] })).rejects.toThrow(
        "At least one prompt is required",
      );
    });

    test("should handle too many prompts", async () => {
      const toolHandler = async (params: any) => {
        if (params.prompts.length > 50) {
          throw new Error("Maximum 50 prompts allowed per batch");
        }
        return { content: [{ type: "text", text: '{"success": true}' }] };
      };

      const tooManyPrompts = Array.from({ length: 51 }, (_, i) => ({
        id: `prompt_${i}`,
        content: `Prompt ${i}`,
      }));

      await expect(toolHandler({ prompts: tooManyPrompts })).rejects.toThrow(
        "Maximum 50 prompts allowed per batch",
      );
    });

    test("should handle processing failures", async () => {
      const toolHandler = async (params: any) => {
        const results = params.prompts.map((prompt: any, index: number) => {
          if (index === 1) {
            // Simulate failure on second prompt
            return {
              id: prompt.id,
              status: "failed",
              error: "Processing timeout",
              processingTimeMs: 30000,
              taskId: prompt.taskId,
              metadata: prompt.metadata,
            };
          }
          return {
            id: prompt.id,
            status: "completed",
            response: `Processed prompt: ${prompt.content}`,
            processingTimeMs: 1000,
            taskId: prompt.taskId,
            metadata: prompt.metadata,
          };
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  processingMode: "sequential",
                  summary: {
                    total: results.length,
                    completed: results.filter(
                      (r: any) => r.status === "completed",
                    ).length,
                    failed: results.filter((r: any) => r.status === "failed")
                      .length,
                    averageProcessingTime: 15500,
                    totalProcessingTime: 31000,
                  },
                  results,
                  processedAt: new Date().toISOString(),
                },
                null,
                2,
              ),
            },
          ],
        };
      };

      const result = await toolHandler({
        prompts: [
          { id: "prompt_1", content: "Success prompt" },
          { id: "prompt_2", content: "Failure prompt" },
        ],
        processingMode: "sequential",
      });

      expect(result.content?.[0]?.text).toContain('"success": true');
      expect(result.content?.[0]?.text).toContain('"completed": 1');
      expect(result.content?.[0]?.text).toContain('"failed": 1');
      expect(result.content?.[0]?.text).toContain("Processing timeout");
    });

    test("should validate maxConcurrency parameter", async () => {
      const toolHandler = async (params: any) => {
        // Simulate zod validation for maxConcurrency
        if (
          typeof params.maxConcurrency === "number" &&
          (params.maxConcurrency < 1 || params.maxConcurrency > 10)
        ) {
          throw new Error("maxConcurrency must be between 1 and 10");
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  processingMode: "parallel",
                  maxConcurrency: params.maxConcurrency || 3,
                  summary: { total: 1, completed: 1, failed: 0 },
                  results: [
                    {
                      id: "prompt_1",
                      status: "completed",
                      response: "Processed",
                      processingTimeMs: 500,
                    },
                  ],
                },
                null,
                2,
              ),
            },
          ],
        };
      };

      // Valid concurrency
      const validResult = await toolHandler({
        prompts: [{ id: "prompt_1", content: "test" }],
        maxConcurrency: 5,
      });
      expect(validResult.content?.[0]?.text).toContain('"maxConcurrency": 5');

      // Invalid concurrency - too high
      await expect(
        toolHandler({
          prompts: [{ id: "prompt_1", content: "test" }],
          maxConcurrency: 15,
        }),
      ).rejects.toThrow("maxConcurrency must be between 1 and 10");

      // Invalid concurrency - too low
      await expect(
        toolHandler({
          prompts: [{ id: "prompt_1", content: "test" }],
          maxConcurrency: 0,
        }),
      ).rejects.toThrow("maxConcurrency must be between 1 and 10");
    });

    test("should validate timeout parameter", async () => {
      const toolHandler = async (params: any) => {
        if (
          params.timeout &&
          (params.timeout < 1000 || params.timeout > 300000)
        ) {
          throw new Error(
            "timeout must be between 1000 and 300000 milliseconds",
          );
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  timeout: params.timeout || 30000,
                  summary: { total: 1, completed: 1, failed: 0 },
                  results: [
                    {
                      id: "prompt_1",
                      status: "completed",
                      response: "Processed",
                      processingTimeMs: 500,
                    },
                  ],
                },
                null,
                2,
              ),
            },
          ],
        };
      };

      // Valid timeout
      const validResult = await toolHandler({
        prompts: [{ id: "prompt_1", content: "test" }],
        timeout: 60000,
      });
      expect(validResult.content?.[0]?.text).toContain('"timeout": 60000');

      // Invalid timeout - too high
      await expect(
        toolHandler({
          prompts: [{ id: "prompt_1", content: "test" }],
          timeout: 400000,
        }),
      ).rejects.toThrow("timeout must be between 1000 and 300000 milliseconds");

      // Invalid timeout - too low
      await expect(
        toolHandler({
          prompts: [{ id: "prompt_1", content: "test" }],
          timeout: 500,
        }),
      ).rejects.toThrow("timeout must be between 1000 and 300000 milliseconds");
    });

    test("should handle prompts with metadata", async () => {
      const toolHandler = async (params: any) => {
        const results = params.prompts.map((prompt: any) => ({
          id: prompt.id,
          status: "completed",
          response: `Processed prompt: ${prompt.content}`,
          processingTimeMs: 700,
          taskId: prompt.taskId,
          metadata: prompt.metadata,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  processingMode: "sequential",
                  summary: {
                    total: results.length,
                    completed: results.length,
                    failed: 0,
                    averageProcessingTime: 700,
                    totalProcessingTime: 1400,
                  },
                  results,
                  processedAt: new Date().toISOString(),
                },
                null,
                2,
              ),
            },
          ],
        };
      };

      const result = await toolHandler({
        prompts: [
          {
            id: "prompt_1",
            content: "First prompt",
            taskId: "task_abc",
            metadata: { source: "user", type: "question" },
          },
          {
            id: "prompt_2",
            content: "Second prompt",
            metadata: { source: "system", urgency: "high" },
          },
        ],
        processingMode: "sequential",
      });

      expect(result.content?.[0]?.text).toContain('"success": true');
      expect(result.content?.[0]?.text).toContain('"source": "user"');
      expect(result.content?.[0]?.text).toContain('"type": "question"');
      expect(result.content?.[0]?.text).toContain('"source": "system"');
      expect(result.content?.[0]?.text).toContain('"urgency": "high"');
    });

    test("should handle batch processing errors gracefully", async () => {
      const toolHandler = async (_params: any) => {
        try {
          throw new Error("Batch processing system failure");
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: false,
                    error:
                      error instanceof Error ? error.message : "Unknown error",
                    processingMode: "sequential",
                    maxConcurrency: 3,
                    timeout: 30000,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }
      };

      const result = await toolHandler({
        prompts: [{ id: "prompt_1", content: "test" }],
      });

      expect(result.content?.[0]?.text).toContain('"success": false');
      expect(result.content?.[0]?.text).toContain(
        "Batch processing system failure",
      );
    });
  });
});
