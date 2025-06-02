import type { MCPTool, MCPToolInfo } from "./orchestration-types";

export class MCPToolRegistry {
  private tools: Map<string, MCPTool>;

  constructor() {
    this.tools = new Map();
  }

  registerTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }

  listTools(): MCPToolInfo[] {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      category: "orchestration",
      version: "1.0.0",
    }));
  }

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  getAllTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  clear(): void {
    this.tools.clear();
  }
}
