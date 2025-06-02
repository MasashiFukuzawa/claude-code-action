import { describe, test, expect } from "bun:test";
import { BUILT_IN_MODES } from "../../src/modes/built-in-modes";

describe("Built-in Modes", () => {
  test("should define CODE mode correctly", () => {
    const codeMode = BUILT_IN_MODES.CODE;
    expect(codeMode.slug).toBe("code");
    expect(codeMode.name).toBe("Code");
    expect(codeMode.roleDefinition).toContain("expert software developer");
    expect(codeMode.groups).toContain("file_operations");
    expect(codeMode.groups).toContain("git_operations");
  });

  test("should define ARCHITECT mode correctly", () => {
    const architectMode = BUILT_IN_MODES.ARCHITECT;
    expect(architectMode.slug).toBe("architect");
    expect(architectMode.name).toBe("Architect");
    expect(architectMode.roleDefinition).toContain("system architect");
    expect(architectMode.groups).toContain("read_operations");
    expect(architectMode.groups).not.toContain("write_operations");
  });

  test("should define DEBUG mode correctly", () => {
    const debugMode = BUILT_IN_MODES.DEBUG;
    expect(debugMode.slug).toBe("debug");
    expect(debugMode.name).toBe("Debug");
    expect(debugMode.roleDefinition).toContain("debugging expert");
    expect(debugMode.groups).toContain("diagnostic_tools");
  });

  test("should define ASK mode correctly", () => {
    const askMode = BUILT_IN_MODES.ASK;
    expect(askMode.slug).toBe("ask");
    expect(askMode.name).toBe("Ask");
    expect(askMode.roleDefinition).toContain("knowledgeable assistant");
    expect(askMode.groups).toContain("read_operations");
  });

  test("should define ORCHESTRATOR mode correctly", () => {
    const orchestratorMode = BUILT_IN_MODES.ORCHESTRATOR;
    expect(orchestratorMode.slug).toBe("orchestrator");
    expect(orchestratorMode.name).toBe("Orchestrator");
    expect(orchestratorMode.roleDefinition).toContain("task orchestrator");
    expect(orchestratorMode.groups).toContain("task_management");
  });

  test("all modes should have required fields", () => {
    Object.values(BUILT_IN_MODES).forEach((mode) => {
      expect(mode.slug).toBeTruthy();
      expect(mode.name).toBeTruthy();
      expect(mode.roleDefinition).toBeTruthy();
      expect(Array.isArray(mode.groups)).toBe(true);
      expect(mode.groups.length).toBeGreaterThan(0);
    });
  });
});
