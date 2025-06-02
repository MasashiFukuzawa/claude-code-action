import { describe, test, expect, beforeEach } from "bun:test";
import { PromptExtension } from "../../src/create-prompt/prompt-extension";
import type { Mode } from "../../src/modes/types";
import type { SubTask, TaskContext } from "../../src/tasks/types";

describe("PromptExtension", () => {
  let promptExtension: PromptExtension;

  beforeEach(() => {
    promptExtension = new PromptExtension();
  });

  test("should create prompt for specific mode", () => {
    const context = {
      mode: "code",
      taskDescription: "Implement JWT authentication",
      globalContext: { framework: "Express.js" },
      previousResults: [],
      constraints: {
        maxTokens: 4000,
        requiredSections: ["implementation"],
        forbiddenTerms: [],
        outputFormat: "markdown" as const,
      },
    };

    const mode: Mode = {
      slug: "code",
      name: "Code Implementation",
      roleDefinition: "You are an expert software developer",
      groups: ["file_operations", "code_analysis"],
    };

    const result = promptExtension.createPromptForMode(context, mode);

    expect(result.prompt).toContain("JWT authentication");
    expect(result.prompt).toContain("Express.js");
    expect(result.metadata.mode).toBe("code");
    expect(result.qualityScore.overall).toBeGreaterThan(0.6);
  });

  test("should create prompt for subtask", () => {
    const subtask: SubTask = {
      id: "subtask-1",
      description: "Implement user registration endpoint",
      mode: "code",
      priority: 1,
      dependencies: [],
      estimatedComplexity: 5.0,
    };

    const context: TaskContext = {
      previousResults: [],
      globalContext: {
        framework: "Express.js",
        database: "MongoDB",
      },
      modeSpecificContext: {},
      maxTokens: 3000,
    };

    const result = promptExtension.createPromptForSubtask(subtask, context);

    expect(result.prompt).toContain("user registration");
    expect(result.prompt).toContain("Express.js");
    expect(result.metadata.tokensUsed).toBeLessThan(3000);
  });

  test("should optimize prompt for constraints", () => {
    const longPrompt =
      "Very long prompt content that exceeds token limits. ".repeat(200);
    const constraints = {
      maxTokens: 1000,
      requiredSections: ["summary"],
      forbiddenTerms: ["harmful"],
      outputFormat: "markdown" as const,
    };

    const optimized = promptExtension.optimizePrompt(longPrompt, constraints);

    expect(optimized.length).toBeLessThan(longPrompt.length);
    expect(optimized).not.toContain("harmful");
    expect(promptExtension.estimateTokens(optimized)).toBeLessThan(1000);
  });

  test("should integrate with existing prompt creation system", () => {
    const existingPrompt = "This is an existing system prompt.";
    const enhancement = {
      mode: "code",
      taskDescription: "Add authentication",
      globalContext: {},
      previousResults: [],
      constraints: {
        maxTokens: 2000,
        requiredSections: [],
        forbiddenTerms: [],
        outputFormat: "markdown" as const,
      },
    };

    const result = promptExtension.enhanceExistingPrompt(
      existingPrompt,
      enhancement,
    );

    expect(result.prompt).toContain("existing system prompt");
    expect(result.prompt).toContain("authentication");
    expect(result.metadata.optimizationApplied).toContain(
      "existing_prompt_enhancement",
    );
  });

  test("should validate prompt correctly", () => {
    const validPrompt = "This is a valid prompt with implementation details";
    const constraints = {
      maxTokens: 1000,
      requiredSections: ["implementation"],
      forbiddenTerms: ["harmful"],
      outputFormat: "markdown" as const,
    };

    const validation = promptExtension.validatePrompt(validPrompt, constraints);

    expect(validation.isValid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });

  test("should detect validation errors", () => {
    const invalidPrompt =
      "This prompt contains harmful content and is too short";
    const constraints = {
      maxTokens: 50,
      requiredSections: ["implementation", "testing"],
      forbiddenTerms: ["harmful"],
      outputFormat: "markdown" as const,
    };

    const validation = promptExtension.validatePrompt(
      invalidPrompt,
      constraints,
    );

    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.errors.some((error) => error.includes("harmful"))).toBe(
      true,
    );
  });
});
