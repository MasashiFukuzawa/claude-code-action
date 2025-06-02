import { describe, test, expect, beforeEach } from "bun:test";
import { ModePromptGenerator } from "../../src/create-prompt/mode-prompt-generator";
import { modeManager } from "../../src/modes";

describe("ModePromptGenerator", () => {
  let generator: ModePromptGenerator;

  beforeEach(() => {
    generator = new ModePromptGenerator();
  });

  test("should generate code mode specific prompt", () => {
    const context = {
      mode: "code",
      taskDescription: "Implement user authentication API",
      globalContext: {
        framework: "Express.js",
        database: "MongoDB",
      },
      previousResults: ["Database schema designed"],
      constraints: {
        maxTokens: 4000,
        requiredSections: ["implementation", "testing"],
        forbiddenTerms: [],
        outputFormat: "markdown" as const,
      },
    };

    const result = generator.generateModeSpecificPrompt(context);

    expect(result.prompt).toContain("implementation");
    expect(result.prompt).toContain("Express.js");
    expect(result.prompt).toContain("MongoDB");
    expect(result.metadata.mode).toBe("code");
    expect(result.qualityScore.overall).toBeGreaterThan(0.6);
  });

  test("should generate architect mode specific prompt", () => {
    const context = {
      mode: "architect",
      taskDescription: "Design microservices architecture",
      globalContext: {
        scale: "enterprise",
        requirements: "high availability",
      },
      previousResults: [],
      constraints: {
        maxTokens: 5000,
        requiredSections: ["overview", "components", "interactions"],
        forbiddenTerms: [],
        outputFormat: "markdown" as const,
      },
    };

    const result = generator.generateModeSpecificPrompt(context);

    expect(result.prompt).toContain("architecture");
    expect(result.prompt).toContain("microservices");
    expect(result.prompt).toContain("high availability");
    expect(result.metadata.mode).toBe("architect");
  });

  test("should apply mode constraints correctly", () => {
    const mode = modeManager.getModeBySlug("debug");
    const basePrompt = "Debug the authentication issue";

    const constrainedPrompt = generator.applyModeConstraints(basePrompt, mode);

    expect(constrainedPrompt).toContain("debug");
    expect(constrainedPrompt).toContain("analysis");
    expect(constrainedPrompt.length).toBeGreaterThan(basePrompt.length);
  });

  test("should get mode-specific instructions", () => {
    const codeInstructions = generator.getModeInstructions("code");
    const architectInstructions = generator.getModeInstructions("architect");

    expect(codeInstructions).toContain("Implementation");
    expect(architectInstructions).toContain("Design");
    expect(codeInstructions).not.toBe(architectInstructions);
  });

  test("should handle unknown mode gracefully", () => {
    const context = {
      mode: "unknown_mode",
      taskDescription: "Some task",
      globalContext: {},
      previousResults: [],
      constraints: {
        maxTokens: 2000,
        requiredSections: [],
        forbiddenTerms: [],
        outputFormat: "markdown" as const,
      },
    };

    const result = generator.generateModeSpecificPrompt(context);

    expect(result.prompt).toBeTruthy();
    expect(result.metadata.mode).toBe("code"); // fallback to default
    expect(result.warnings).toContain(
      "Unknown mode, falling back to code mode",
    );
  });
});
