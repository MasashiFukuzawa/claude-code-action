import { describe, test, expect } from "bun:test";
import { TaskAnalyzer } from "../../src/orchestration";

describe("Task Analysis Integration", () => {
  test("should handle end-to-end task analysis workflow", () => {
    const analyzer = new TaskAnalyzer();

    const complexTask = `
      Create a complete e-commerce platform with:
      1. User authentication and registration
      2. Product catalog with search and filtering
      3. Shopping cart functionality
      4. Payment processing integration
      5. Order management system
      6. Admin dashboard for inventory management
      7. Email notification system
      8. Mobile responsive design
    `;

    const analysis = analyzer.analyzeTask(complexTask);

    expect(analysis.complexity).toBeGreaterThan(7.5);
    expect(analysis.requiresOrchestration).toBe(true);
    expect(analysis.requiredModes).toContain("orchestrator");
    expect(analysis.requiredModes).toContain("architect");
    expect(analysis.requiredModes).toContain("code");
    expect(analysis.estimatedSubtasks).toBeGreaterThanOrEqual(6);
    expect(analysis.complexityFactors.length).toBeGreaterThan(0);
    expect(analysis.suggestedApproach).toContain("orchestration");
  });

  test("should handle simple task analysis workflow", () => {
    const analyzer = new TaskAnalyzer();

    const simpleTask = "Fix typo in user profile component";
    const analysis = analyzer.analyzeTask(simpleTask);

    expect(analysis.complexity).toBeLessThan(3.0);
    expect(analysis.requiresOrchestration).toBe(false);
    expect(analysis.estimatedSubtasks).toBeLessThanOrEqual(1);
    expect(analysis.requiredModes).toContain("code");
  });

  test("should provide consistent analysis results", () => {
    const analyzer = new TaskAnalyzer();
    const task = "Implement OAuth2 authentication with PKCE flow";

    const analysis1 = analyzer.analyzeTask(task);
    const analysis2 = analyzer.analyzeTask(task);

    expect(analysis1.complexity).toBe(analysis2.complexity);
    expect(analysis1.requiresOrchestration).toBe(
      analysis2.requiresOrchestration,
    );
    expect(analysis1.requiredModes).toEqual(analysis2.requiredModes);
  });
});
