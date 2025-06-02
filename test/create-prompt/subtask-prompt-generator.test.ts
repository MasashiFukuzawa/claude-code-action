import { describe, test, expect, beforeEach } from "bun:test";
import { SubtaskPromptGenerator } from "../../src/create-prompt/subtask-prompt-generator";
import type { SubTask, TaskContext } from "../../src/tasks/types";

describe("SubtaskPromptGenerator", () => {
  let generator: SubtaskPromptGenerator;

  beforeEach(() => {
    generator = new SubtaskPromptGenerator();
  });

  test("should generate prompt for independent subtask", () => {
    const subtask: SubTask = {
      id: "subtask-1",
      description: "Implement user authentication API endpoints",
      mode: "code",
      priority: 1,
      dependencies: [],
      estimatedComplexity: 6.5,
    };

    const context: TaskContext = {
      previousResults: [],
      globalContext: {
        framework: "Express.js",
        database: "MongoDB",
      },
      modeSpecificContext: {
        implementationFocus: "security",
      },
      maxTokens: 4000,
    };

    const result = generator.generateSubtaskPrompt(subtask, context);

    expect(result.prompt).toContain("authentication");
    expect(result.prompt).toContain("Express.js");
    expect(result.metadata.mode).toBe("code");
    expect(result.qualityScore.overall).toBeGreaterThan(0.6);
  });

  test("should generate prompt for dependent subtask", () => {
    const subtask: SubTask = {
      id: "subtask-3",
      description: "Implement password reset functionality",
      mode: "code",
      priority: 3,
      dependencies: ["subtask-1", "subtask-2"],
      estimatedComplexity: 4.0,
    };

    const context: TaskContext = {
      previousResults: [
        "User registration API completed",
        "Email service integration completed",
      ],
      globalContext: {
        framework: "Express.js",
        emailProvider: "SendGrid",
      },
      modeSpecificContext: {},
      maxTokens: 3500,
    };

    const result = generator.generateSubtaskPrompt(subtask, context);

    expect(result.prompt).toContain("password reset");
    expect(result.prompt).toContain("registration API completed");
    expect(result.prompt).toContain("Email service integration");
    expect(result.metadata.tokensUsed).toBeLessThan(3500);
  });

  test("should create contextualized prompt with previous results", () => {
    const subtask: SubTask = {
      id: "subtask-2",
      description: "Create user profile management",
      mode: "code",
      priority: 2,
      dependencies: ["subtask-1"],
      estimatedComplexity: 5.0,
    };

    const previousResults = [
      "Database schema created with user table",
      "Authentication middleware implemented",
      "JWT token generation working",
    ];

    const prompt = generator.createContextualizedPrompt(
      subtask,
      previousResults,
    );

    expect(prompt).toContain("profile management");
    expect(prompt).toContain("Database schema created");
    expect(prompt).toContain("Authentication middleware");
    expect(prompt).toContain("JWT token generation");
  });

  test("should inject dependency information correctly", () => {
    const basePrompt = "Implement the feature as described.";
    const dependencies = ["User authentication system", "Database connection"];

    const enhancedPrompt = generator.injectDependencyInfo(
      basePrompt,
      dependencies,
    );

    expect(enhancedPrompt).toContain("authentication system");
    expect(enhancedPrompt).toContain("Database connection");
    expect(enhancedPrompt).toContain("Dependencies");
  });

  test("should handle subtask without dependencies", () => {
    const subtask: SubTask = {
      id: "subtask-1",
      description: "Setup project structure",
      mode: "code",
      priority: 1,
      dependencies: [],
      estimatedComplexity: 2.0,
    };

    const context: TaskContext = {
      previousResults: [],
      globalContext: {},
      modeSpecificContext: {},
      maxTokens: 2000,
    };

    const result = generator.generateSubtaskPrompt(subtask, context);

    expect(result.prompt).toContain("project structure");
    expect(result.prompt).not.toContain("Dependencies");
    expect(result.warnings).toBeUndefined();
  });
});
