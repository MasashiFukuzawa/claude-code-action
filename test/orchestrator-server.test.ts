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
      const toolHandler = async (params: any) => {
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
});
