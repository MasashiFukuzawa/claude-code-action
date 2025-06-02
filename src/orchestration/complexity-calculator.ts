import type { ComplexityFactor } from "./types";

export class ComplexityCalculator {
  private readonly BASE_COMPLEXITY = 1.0;
  private readonly COMPLEXITY_THRESHOLD = 5.0;

  constructor() {}

  calculateComplexity(description: string): number {
    if (!description || description.trim().length === 0) {
      return 0;
    }

    const factors = this.identifyComplexityFactors(description);
    let baseComplexity = this.BASE_COMPLEXITY;

    // Reduce base complexity for simple tasks
    if (this.isSimpleTask(description.toLowerCase())) {
      baseComplexity = 0.5;
    }

    // Calculate weighted complexity based on factors
    const factorComplexity = factors.reduce((total, factor) => {
      return total + factor.weight;
    }, 0);

    // Apply length multiplier for very detailed descriptions
    const lengthMultiplier = this.calculateLengthMultiplier(description);

    return Math.min(baseComplexity + factorComplexity * lengthMultiplier, 10.0);
  }

  identifyComplexityFactors(description: string): ComplexityFactor[] {
    const factors: ComplexityFactor[] = [];
    const lowerDesc = description.toLowerCase();

    // Multi-step complexity
    if (this.hasMultipleSteps(lowerDesc)) {
      factors.push({
        type: "multi_step",
        weight: 2.5,
        description: "Task requires multiple implementation steps",
      });
    }

    // Cross-domain complexity
    if (this.isCrossDomain(lowerDesc)) {
      factors.push({
        type: "cross_domain",
        weight: 2.0,
        description: "Task spans multiple knowledge domains",
      });
    }

    // File complexity
    if (this.hasFileComplexity(lowerDesc)) {
      factors.push({
        type: "file_complexity",
        weight: 1.5,
        description: "Multiple files need modification",
      });
    }

    // Integration complexity
    if (this.requiresIntegration(lowerDesc)) {
      factors.push({
        type: "integration_required",
        weight: 3.0,
        description: "Requires integration with external systems",
      });
    }

    // Security sensitivity
    if (this.isSecuritySensitive(lowerDesc)) {
      factors.push({
        type: "security_sensitive",
        weight: 3.5,
        description: "Involves security-critical functionality",
      });
    }

    // Legacy code complexity
    if (this.involvesLegacyCode(lowerDesc)) {
      factors.push({
        type: "legacy_code",
        weight: 2.0,
        description: "Involves working with legacy code",
      });
    }

    // Performance critical
    if (this.isPerformanceCritical(lowerDesc)) {
      factors.push({
        type: "performance_critical",
        weight: 1.8,
        description: "Performance optimization required",
      });
    }

    // External dependencies
    if (this.hasExternalDependencies(lowerDesc)) {
      factors.push({
        type: "external_dependencies",
        weight: 1.5,
        description: "Depends on external libraries or services",
      });
    }

    return factors;
  }

  getComplexityThreshold(): number {
    return this.COMPLEXITY_THRESHOLD;
  }

  private hasMultipleSteps(description: string): boolean {
    const stepIndicators = [
      /\b(and|then|also|additionally|furthermore)/gi,
      /\b(step|phase|stage)\s*\d+/gi,
      /\b(first|second|third|finally)/gi,
      /[•\-\*]\s/g, // bullet points
      /\d+\.\s/g, // numbered lists
    ];

    let stepCount = 0;
    for (const pattern of stepIndicators) {
      const matches = description.match(pattern);
      if (matches) {
        stepCount += matches.length;
      }
    }

    return stepCount >= 2;
  }

  private isCrossDomain(description: string): boolean {
    const domains = [
      "frontend",
      "backend",
      "database",
      "api",
      "ui",
      "ux",
      "testing",
      "deployment",
      "security",
      "ci/cd",
      "pipeline",
      "build",
    ];
    const mentionedDomains = domains.filter(
      (domain) =>
        description.includes(domain) ||
        description.includes(domain.toUpperCase()),
    );
    return mentionedDomains.length >= 2;
  }

  private hasFileComplexity(description: string): boolean {
    const fileIndicators = [
      /\bmultiple\s+(files|components|modules)/i,
      /\bseveral\s+(files|components|modules)/i,
      /\bacross\s+(files|components|modules)/i,
      /\brefactor\s+.*\s+(files|codebase)/i,
    ];

    return fileIndicators.some((pattern) => pattern.test(description));
  }

  private requiresIntegration(description: string): boolean {
    const integrationKeywords = [
      "integrate",
      "integration",
      "api",
      "webhook",
      "external",
      "third-party",
      "database",
      "connect",
      "sync",
      "import",
      "export",
      "payment",
      "processing",
      "pipeline",
      "ci/cd",
      "deployment",
    ];

    const lowerDesc = description.toLowerCase();

    // Don't count simple service operations as integration
    if (this.isSimpleTask(lowerDesc)) {
      return false;
    }

    return integrationKeywords.some((keyword) => lowerDesc.includes(keyword));
  }

  private isSecuritySensitive(description: string): boolean {
    const securityKeywords = [
      "auth",
      "authentication",
      "authorization",
      "security",
      "encrypt",
      "jwt",
      "token",
      "password",
      "oauth",
      "oauth2",
      "pkce",
      "permission",
      "role",
      "access",
    ];

    return securityKeywords.some((keyword) =>
      description.toLowerCase().includes(keyword),
    );
  }

  private involvesLegacyCode(description: string): boolean {
    const legacyIndicators = [
      "legacy",
      "refactor",
      "migrate",
      "modernize",
      "upgrade",
      "replace",
    ];

    return legacyIndicators.some((keyword) =>
      description.toLowerCase().includes(keyword),
    );
  }

  private isPerformanceCritical(description: string): boolean {
    const performanceKeywords = [
      "performance",
      "optimize",
      "speed",
      "fast",
      "efficient",
      "cache",
      "memory",
      "cpu",
      "latency",
      "throughput",
      "scale",
    ];

    return performanceKeywords.some((keyword) =>
      description.toLowerCase().includes(keyword),
    );
  }

  private hasExternalDependencies(description: string): boolean {
    const dependencyIndicators = [
      "library",
      "package",
      "npm",
      "dependency",
      "external",
      "third-party",
      "framework",
      "tool",
      "api",
    ];

    // Don't count internal service operations as external dependencies
    const lowerDesc = description.toLowerCase();
    if (this.isSimpleTask(lowerDesc)) {
      return false;
    }

    return dependencyIndicators.some((keyword) => lowerDesc.includes(keyword));
  }

  private calculateLengthMultiplier(description: string): number {
    const length = description.length;
    if (length < 100) return 1.0;
    if (length < 300) return 1.1;
    if (length < 500) return 1.2;
    return 1.3;
  }

  private isSimpleTask(description: string): boolean {
    const simpleTaskIndicators = [
      "add",
      "fix typo",
      "update",
      "logging",
      "log",
      "simple",
      "minor",
      "small",
      "quick",
    ];

    return simpleTaskIndicators.some((indicator) =>
      description.includes(indicator),
    );
  }
}
