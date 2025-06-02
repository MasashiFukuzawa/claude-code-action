import { describe, test, expect, beforeEach } from "bun:test";
import { TaskAnalyzer } from "../../src/orchestration/task-analyzer";

describe("TaskAnalyzer", () => {
  let analyzer: TaskAnalyzer;

  beforeEach(() => {
    analyzer = new TaskAnalyzer();
  });

  test("should analyze simple task correctly", () => {
    const task = "Fix typo in documentation";
    const analysis = analyzer.analyzeTask(task);

    expect(analysis.complexity).toBeLessThan(3.0);
    expect(analysis.requiresOrchestration).toBe(false);
    expect(analysis.estimatedSubtasks).toBeLessThanOrEqual(1);
  });

  test("should analyze complex task correctly", () => {
    const task = `
      Implement a complete user management system with:
      1. User registration and authentication
      2. Role-based access control
      3. Email verification system
      4. Password reset functionality
      5. Admin dashboard for user management
      6. Integration with existing payment system
    `;

    const analysis = analyzer.analyzeTask(task);

    expect(analysis.complexity).toBeGreaterThan(7.0);
    expect(analysis.requiresOrchestration).toBe(true);
    expect(analysis.estimatedSubtasks).toBeGreaterThanOrEqual(4);
    expect(analysis.requiredModes.length).toBeGreaterThan(1);
  });

  test("should determine required modes correctly", () => {
    const designTask = "Design system architecture for microservices";
    const codeTask = "Implement user authentication API";
    const debugTask = "Fix memory leak in payment processor";

    const designAnalysis = analyzer.analyzeTask(designTask);
    const codeAnalysis = analyzer.analyzeTask(codeTask);
    const debugAnalysis = analyzer.analyzeTask(debugTask);

    expect(designAnalysis.requiredModes).toContain("architect");
    expect(codeAnalysis.requiredModes).toContain("code");
    expect(debugAnalysis.requiredModes).toContain("debug");
  });

  test("should decide orchestration necessity correctly", () => {
    const simpleTask = "Update package.json version";
    const complexTask =
      "Implement complete CI/CD pipeline with testing, building, and deployment";

    const simpleAnalysis = analyzer.analyzeTask(simpleTask);
    const complexAnalysis = analyzer.analyzeTask(complexTask);

    expect(analyzer.shouldOrchestrate(simpleAnalysis)).toBe(false);
    expect(analyzer.shouldOrchestrate(complexAnalysis)).toBe(true);
  });

  test("should provide meaningful suggested approach", () => {
    const task = "Migrate from REST API to GraphQL";
    const analysis = analyzer.analyzeTask(task);

    expect(analysis.suggestedApproach).toBeTruthy();
    expect(analysis.suggestedApproach.length).toBeGreaterThan(10);
  });

  test("should handle edge cases gracefully", () => {
    expect(() => analyzer.analyzeTask("")).not.toThrow();
    expect(() => analyzer.analyzeTask("   ")).not.toThrow();

    const emptyAnalysis = analyzer.analyzeTask("");
    expect(emptyAnalysis.complexity).toBe(0);
    expect(emptyAnalysis.requiresOrchestration).toBe(false);
  });
});
