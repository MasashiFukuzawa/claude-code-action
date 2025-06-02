import { describe, test, expect, beforeEach } from "bun:test";
import { ModeSelector } from "../../src/orchestration/mode-selector";

describe("ModeSelector", () => {
  let selector: ModeSelector;

  beforeEach(() => {
    selector = new ModeSelector();
  });

  test("should select architect mode for design tasks", () => {
    const designTasks = [
      "Design the overall system architecture",
      "Create a high-level plan for the microservices",
      "Plan the database schema for user management",
    ];

    designTasks.forEach((task) => {
      const mode = selector.selectOptimalMode(task);
      expect(mode).toBe("architect");
    });
  });

  test("should select code mode for implementation tasks", () => {
    const codeTasks = [
      "Implement user authentication API",
      "Create React component for user profile",
      "Develop payment processing service",
    ];

    codeTasks.forEach((task) => {
      const mode = selector.selectOptimalMode(task);
      expect(mode).toBe("code");
    });
  });

  test("should select debug mode for troubleshooting tasks", () => {
    const debugTasks = [
      "Fix memory leak in payment processor",
      "Debug authentication issues",
      "Resolve performance problems in search",
    ];

    debugTasks.forEach((task) => {
      const mode = selector.selectOptimalMode(task);
      expect(mode).toBe("debug");
    });
  });

  test("should select ask mode for informational tasks", () => {
    const askTasks = [
      "Explain how OAuth2 works",
      "What are the best practices for API design?",
      "How should we structure our TypeScript project?",
    ];

    askTasks.forEach((task) => {
      const mode = selector.selectOptimalMode(task);
      expect(mode).toBe("ask");
    });
  });

  test("should evaluate mode match scores correctly", () => {
    const task = "Implement user authentication with JWT tokens";

    const codeScore = selector.evaluateModeMatch(task, "code");
    const architectScore = selector.evaluateModeMatch(task, "architect");
    const debugScore = selector.evaluateModeMatch(task, "debug");

    expect(codeScore).toBeGreaterThan(architectScore);
    expect(codeScore).toBeGreaterThan(debugScore);
  });

  test("should get mode capabilities correctly", () => {
    const codeCapabilities = selector.getModeCapabilities("code");
    const architectCapabilities = selector.getModeCapabilities("architect");

    expect(codeCapabilities).toContain("implementation");
    expect(architectCapabilities).toContain("design");
  });

  test("should handle ambiguous tasks gracefully", () => {
    const ambiguousTask = "Work on the user system";
    const mode = selector.selectOptimalMode(ambiguousTask);

    // Should return a valid mode (defaulting to code if unclear)
    expect(["code", "architect", "debug", "ask", "orchestrator"]).toContain(
      mode,
    );
  });
});
