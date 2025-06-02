import { describe, test, expect } from "bun:test";
import { PromptExtension } from "../../src/create-prompt/prompt-extension";
import { TaskAnalyzer } from "../../src/orchestration/task-analyzer";

describe("Prompt Extension Integration", () => {
  test("should integrate with orchestration system", () => {
    const promptExtension = new PromptExtension();
    const taskAnalyzer = new TaskAnalyzer();

    // Analyze a complex task
    const complexTask = `
      Create a complete user management system with:
      1. User registration and authentication
      2. Profile management
      3. Admin dashboard
      4. Email notifications
    `;

    const analysis = taskAnalyzer.analyzeTask(complexTask);
    expect(analysis.requiresOrchestration).toBe(true);

    // Generate prompts for each required mode
    analysis.requiredModes.forEach((mode) => {
      const context = {
        mode,
        taskDescription: complexTask,
        globalContext: { framework: "React", backend: "Node.js" },
        previousResults: [],
        constraints: {
          maxTokens: 4000,
          requiredSections: ["implementation", "testing"],
          forbiddenTerms: [],
          outputFormat: "markdown" as const,
        },
      };

      const modeObj = {
        slug: mode,
        name: mode,
        roleDefinition: `You are an expert ${mode} specialist`,
        groups: [] as const,
      };
      const result = promptExtension.createPromptForMode(context, modeObj);

      expect(result.prompt).toContain("user management");
      expect(result.metadata.mode).toBe(mode);
      expect(result.qualityScore.overall).toBeGreaterThan(0.5);
    });
  });

  test("should handle end-to-end prompt generation workflow", () => {
    const promptExtension = new PromptExtension();

    // Simulate a multi-step development workflow
    const steps = [
      {
        mode: "architect",
        description: "Design system architecture",
        previousResults: [],
      },
      {
        mode: "code",
        description: "Implement authentication module",
        previousResults: [
          "System architecture designed with microservices pattern",
        ],
      },
      {
        mode: "debug",
        description: "Fix authentication issues",
        previousResults: [
          "System architecture designed with microservices pattern",
          "Authentication module implemented with JWT",
        ],
      },
    ];

    const allResults: string[] = [];

    steps.forEach((step, index) => {
      const context = {
        mode: step.mode,
        taskDescription: step.description,
        globalContext: {
          framework: "Express.js",
          database: "PostgreSQL",
          projectPhase: `Step ${index + 1}`,
        },
        previousResults: step.previousResults,
        constraints: {
          maxTokens: 3500,
          requiredSections: ["implementation"],
          forbiddenTerms: [],
          outputFormat: "markdown" as const,
        },
      };

      const modeObj = {
        slug: step.mode,
        name: step.mode,
        roleDefinition: `You are an expert ${step.mode} specialist`,
        groups: [] as const,
      };

      const result = promptExtension.createPromptForMode(context, modeObj);

      // Verify prompt contains expected content
      expect(result.prompt).toContain(step.description);
      expect(result.prompt).toContain("Express.js");
      expect(result.metadata.tokensUsed).toBeLessThan(3500);

      // Verify previous results are incorporated
      if (step.previousResults.length > 0) {
        step.previousResults.forEach((prevResult) => {
          expect(result.prompt).toContain(prevResult);
        });
      }

      allResults.push(`${step.mode}: ${step.description} completed`);
    });

    expect(allResults).toHaveLength(3);
  });

  test("should optimize prompts across different contexts", () => {
    const promptExtension = new PromptExtension();

    // Test with various constraint scenarios
    const scenarios = [
      {
        name: "Low token limit",
        maxTokens: 1000,
        expectedOptimization: true,
      },
      {
        name: "High token limit",
        maxTokens: 8000,
        expectedOptimization: false,
      },
      {
        name: "Strict content requirements",
        maxTokens: 4000,
        requiredSections: [
          "overview",
          "implementation",
          "testing",
          "deployment",
        ],
        expectedValidation: true,
      },
    ];

    scenarios.forEach((scenario) => {
      const context = {
        mode: "code",
        taskDescription:
          "Implement a REST API with full CRUD operations for user management",
        globalContext: { framework: "Express.js", database: "MongoDB" },
        previousResults: ["Database schema designed", "API endpoints planned"],
        constraints: {
          maxTokens: scenario.maxTokens,
          requiredSections: scenario.requiredSections || ["implementation"],
          forbiddenTerms: [],
          outputFormat: "markdown" as const,
        },
      };

      const modeObj = {
        slug: "code",
        name: "Code Implementation",
        roleDefinition: "You are an expert software developer",
        groups: ["file_operations", "code_analysis"] as const,
      };

      const result = promptExtension.createPromptForMode(context, modeObj);

      // Verify token optimization
      expect(result.metadata.tokensUsed).toBeLessThanOrEqual(
        scenario.maxTokens,
      );

      // Verify content quality maintained
      expect(result.qualityScore.overall).toBeGreaterThan(0.5);

      // Verify validation if required sections are specified
      if (scenario.requiredSections) {
        const validation = promptExtension.validatePrompt(
          result.prompt,
          context.constraints,
        );
        expect(validation.isValid).toBe(true);
      }
    });
  });

  test("should handle prompt enhancement for existing systems", () => {
    const promptExtension = new PromptExtension();

    const existingPrompt = `
      You are tasked with improving the performance of our web application.
      The current system is experiencing slow response times.
    `;

    const enhancement = {
      mode: "debug",
      taskDescription: "Identify and fix performance bottlenecks",
      globalContext: {
        framework: "React",
        backend: "Node.js",
        database: "PostgreSQL",
        currentIssues: ["Slow API responses", "High memory usage"],
      },
      previousResults: [
        "Performance monitoring set up",
        "Baseline metrics collected",
      ],
      constraints: {
        maxTokens: 3000,
        requiredSections: ["analysis", "solution"],
        forbiddenTerms: [],
        outputFormat: "markdown" as const,
      },
    };

    const result = promptExtension.enhanceExistingPrompt(
      existingPrompt,
      enhancement,
    );

    // Verify original content is preserved
    expect(result.prompt).toContain("improving the performance");
    expect(result.prompt).toContain("slow response times");

    // Verify enhancement is added
    expect(result.prompt).toContain("performance bottlenecks");
    expect(result.prompt).toContain("Node.js");
    expect(result.prompt).toContain("PostgreSQL");

    // Verify metadata indicates enhancement was applied
    expect(result.metadata.optimizationApplied).toContain(
      "existing_prompt_enhancement",
    );

    // Verify quality score is reasonable
    expect(result.qualityScore.overall).toBeGreaterThan(0.6);
  });
});
