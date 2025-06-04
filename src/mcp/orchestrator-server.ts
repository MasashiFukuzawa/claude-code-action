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
    task: z.string().describe("Task description in any language (Japanese or English)"),
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
            text: JSON.stringify({
              isComplex: false,
              confidence: 0,
              reason: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
              suggestedSubtasks: [],
              error: error instanceof Error ? error.message : "Unknown error",
            }, null, 2),
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
