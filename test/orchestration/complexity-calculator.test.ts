import { describe, test, expect, beforeEach } from "bun:test";
import { ComplexityCalculator } from "../../src/orchestration/complexity-calculator";

describe("ComplexityCalculator", () => {
  let calculator: ComplexityCalculator;

  beforeEach(() => {
    calculator = new ComplexityCalculator();
  });

  test("should calculate low complexity for simple tasks", () => {
    const simpleTask = "Fix typo in README.md";
    const complexity = calculator.calculateComplexity(simpleTask);

    expect(complexity).toBeLessThan(3.0);
  });

  test("should calculate high complexity for multi-step tasks", () => {
    const complexTask = `
      Implement a complete user authentication system with:
      - User registration and login
      - Password reset functionality
      - Email verification
      - JWT token management
      - Rate limiting
      - Integration with existing database
    `;

    const complexity = calculator.calculateComplexity(complexTask);

    expect(complexity).toBeGreaterThan(7.0);
  });

  test("should identify complexity factors correctly", () => {
    const task =
      "Refactor legacy payment processing system to support new payment methods";
    const factors = calculator.identifyComplexityFactors(task);

    const factorTypes = factors.map((f) => f.type);
    expect(factorTypes).toContain("legacy_code");
    expect(factorTypes).toContain("integration_required");
  });

  test("should use appropriate complexity threshold", () => {
    const threshold = calculator.getComplexityThreshold();
    expect(threshold).toBeGreaterThan(0);
    expect(threshold).toBeLessThan(10);
  });

  test("should handle edge cases gracefully", () => {
    expect(() => calculator.calculateComplexity("")).not.toThrow();
    expect(() => calculator.calculateComplexity("   ")).not.toThrow();
    expect(calculator.calculateComplexity("")).toBe(0);
  });

  test("should assign higher complexity to security-sensitive tasks", () => {
    const securityTask = "Implement OAuth2 authentication with PKCE flow";
    const regularTask = "Add logging to user service";

    const securityComplexity = calculator.calculateComplexity(securityTask);
    const regularComplexity = calculator.calculateComplexity(regularTask);

    expect(securityComplexity).toBeGreaterThan(regularComplexity);
  });
});
