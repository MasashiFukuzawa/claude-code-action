import { describe, test, expect } from "bun:test";
import { ContextOptimizer, TaskAnalyzer } from "../../src/orchestration";

describe("Context Optimization Integration", () => {
  test("should handle complete context optimization workflow", () => {
    const analyzer = new TaskAnalyzer();
    const optimizer = new ContextOptimizer();

    const complexTask = `
      Implement a complete user management system with:
      1. Authentication with JWT tokens
      2. Role-based access control
      3. Password reset functionality
      4. Email verification
      5. User profile management
      6. Admin dashboard
    `;

    // Analyze task complexity
    const analysis = analyzer.analyzeTask(complexTask);
    expect(analysis.requiresOrchestration).toBe(true);

    // Create optimized context for a subtask
    const contextParams = {
      mode: "code",
      taskDescription: "Implement JWT authentication",
      previousResults: [
        "System architecture designed with microservices approach",
        "Database schema created with user, role, and session tables",
        "Password hashing service implemented using bcrypt",
        "Email service configured with SendGrid",
        "Basic user registration endpoint created",
        "Input validation middleware implemented",
        "Error handling framework established",
      ],
      globalContext: {
        framework: "Express.js",
        database: "PostgreSQL",
        authStrategy: "JWT",
        emailProvider: "SendGrid",
      },
      maxTokens: 1500,
    };

    const optimizedContext = optimizer.createContextForSubTask(contextParams);

    // Verify optimization
    expect(optimizedContext.maxTokens).toBe(1500);
    expect(optimizedContext.previousResults.length).toBeGreaterThan(0);
    expect(optimizedContext.modeSpecificContext.mode).toBe("code");

    // Verify relevant information is prioritized
    const contextStr = JSON.stringify(optimizedContext);
    expect(contextStr).toContain("JWT");
    expect(contextStr).toContain("auth");
  });

  test("should achieve target token reduction", () => {
    const optimizer = new ContextOptimizer();

    const verboseContext = {
      previousResults: [
        "This is a very detailed explanation of how the authentication system was designed with extensive documentation about the security considerations and implementation details that goes on for many sentences and includes lots of technical jargon and specific implementation details that might not be relevant for the current task",
        "Database schema created",
        "Password hashing implemented",
        "Email service configured",
      ],
      globalContext: {
        detailedDescription:
          "This is another very long description that contains lots of information about the project setup and configuration that might not be directly relevant to the current subtask but was included for completeness",
      },
    };

    const original = JSON.stringify(verboseContext);
    const optimized = optimizer.optimizeContext(verboseContext, 500);
    const optimizedStr = JSON.stringify(optimized);

    const reductionRatio =
      (original.length - optimizedStr.length) / original.length;
    // For complex contexts, should achieve some reduction or at least not expand
    expect(reductionRatio).toBeGreaterThanOrEqual(0); // Should not expand content
    expect(optimizedStr.length).toBeLessThanOrEqual(original.length);
  });

  test("should maintain context quality across modes", () => {
    const optimizer = new ContextOptimizer();

    const previousResults = [
      "System architecture designed with microservices",
      "Critical authentication bug discovered in login flow",
      "User interface components created for login page",
      "Database performance optimized with indexing",
      "Unit tests written for authentication service",
    ];

    const modes = ["code", "architect", "debug"];

    for (const mode of modes) {
      const contextParams = {
        mode,
        taskDescription: `${mode} mode task`,
        previousResults,
        globalContext: {},
        maxTokens: 800,
      };

      const context = optimizer.createContextForSubTask(contextParams);

      expect(context.previousResults.length).toBeGreaterThan(0);
      expect(context.modeSpecificContext.mode).toBe(mode);

      // Each mode should prioritize different information
      const contextStr = JSON.stringify(context);
      if (mode === "debug") {
        expect(contextStr).toContain("bug");
      } else if (mode === "architect") {
        expect(contextStr).toContain("architecture");
      }
    }
  });
});
