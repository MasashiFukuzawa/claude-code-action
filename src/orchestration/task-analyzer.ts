import { ComplexityCalculator } from "./complexity-calculator";
import type { TaskAnalysis } from "./types";

export class TaskAnalyzer {
  private complexityCalculator: ComplexityCalculator;
  private readonly ORCHESTRATION_THRESHOLD = 5.0;

  constructor() {
    this.complexityCalculator = new ComplexityCalculator();
  }

  analyzeTask(description: string): TaskAnalysis {
    if (!description || description.trim().length === 0) {
      return this.createEmptyAnalysis();
    }

    const complexity =
      this.complexityCalculator.calculateComplexity(description);
    const complexityFactors =
      this.complexityCalculator.identifyComplexityFactors(description);
    const requiredModes = this.determineRequiredModes(description);
    const requiresOrchestration = complexity >= this.ORCHESTRATION_THRESHOLD;
    const estimatedSubtasks = this.estimateSubtaskCount(
      complexity,
      description,
    );
    const suggestedApproach = this.generateSuggestedApproach(
      description,
      complexity,
      requiredModes,
    );

    return {
      complexity,
      complexityFactors,
      requiredModes,
      requiresOrchestration,
      estimatedSubtasks,
      suggestedApproach,
    };
  }

  calculateComplexity(description: string): number {
    return this.complexityCalculator.calculateComplexity(description);
  }

  determineRequiredModes(description: string): string[] {
    const modes = new Set<string>();
    const lowerDesc = description.toLowerCase();

    // Architecture/Design indicators
    if (this.hasArchitectureKeywords(lowerDesc)) {
      modes.add("architect");
    }

    // Code implementation indicators
    if (this.hasCodeKeywords(lowerDesc)) {
      modes.add("code");
    }

    // Debugging indicators
    if (this.hasDebugKeywords(lowerDesc)) {
      modes.add("debug");
    }

    // Documentation/Knowledge indicators
    if (this.hasAskKeywords(lowerDesc)) {
      modes.add("ask");
    }

    // Complex tasks that need orchestration
    if (this.needsOrchestration(lowerDesc)) {
      modes.add("orchestrator");
    }

    // If no specific mode identified, default to code
    if (modes.size === 0) {
      modes.add("code");
    }

    return Array.from(modes);
  }

  shouldOrchestrate(analysis: TaskAnalysis): boolean {
    return analysis.requiresOrchestration;
  }

  private createEmptyAnalysis(): TaskAnalysis {
    return {
      complexity: 0,
      complexityFactors: [],
      requiredModes: [],
      requiresOrchestration: false,
      estimatedSubtasks: 0,
      suggestedApproach: "No task description provided",
    };
  }

  private hasArchitectureKeywords(description: string): boolean {
    const architectureKeywords = [
      "design",
      "architecture",
      "structure",
      "plan",
      "blueprint",
      "schema",
      "system design",
      "high-level",
      "overview",
      "strategy",
      "approach",
    ];
    return architectureKeywords.some((keyword) =>
      description.includes(keyword),
    );
  }

  private hasCodeKeywords(description: string): boolean {
    const codeKeywords = [
      "implement",
      "code",
      "develop",
      "build",
      "create",
      "function",
      "class",
      "method",
      "algorithm",
      "feature",
      "component",
      "module",
    ];
    return codeKeywords.some((keyword) => description.includes(keyword));
  }

  private hasDebugKeywords(description: string): boolean {
    const debugKeywords = [
      "fix",
      "bug",
      "error",
      "issue",
      "problem",
      "debug",
      "troubleshoot",
      "investigate",
      "diagnose",
      "resolve",
      "repair",
    ];
    return debugKeywords.some((keyword) => description.includes(keyword));
  }

  private hasAskKeywords(description: string): boolean {
    const askKeywords = [
      "explain",
      "how",
      "what",
      "why",
      "when",
      "where",
      "documentation",
      "understand",
      "clarify",
      "describe",
      "tell me",
      "help me understand",
    ];
    return askKeywords.some((keyword) => description.includes(keyword));
  }

  private needsOrchestration(description: string): boolean {
    const orchestrationIndicators = [
      "complete",
      "entire",
      "full",
      "comprehensive",
      "end-to-end",
      "multiple",
      "several",
      "various",
      "different",
      "across",
    ];
    return orchestrationIndicators.some((keyword) =>
      description.includes(keyword),
    );
  }

  private estimateSubtaskCount(
    complexity: number,
    description: string,
  ): number {
    // Base estimation from complexity
    let subtasks = Math.ceil(complexity / 2);

    // Adjust based on explicit indicators
    const stepMatches = description.match(/\b(step|phase|stage)\s*\d+/gi);
    if (stepMatches) {
      subtasks = Math.max(subtasks, stepMatches.length);
    }

    const listMatches =
      description.match(/[•\-\*]\s/g) || description.match(/\d+\.\s/g);
    if (listMatches) {
      subtasks = Math.max(subtasks, listMatches.length);
    }

    return Math.min(Math.max(subtasks, 1), 10); // Cap between 1 and 10
  }

  private generateSuggestedApproach(
    _description: string,
    complexity: number,
    requiredModes: string[],
  ): string {
    if (complexity === 0) {
      return "No task description provided";
    }

    if (complexity < 3) {
      return `Simple task that can be completed directly with ${requiredModes[0] || "code"} mode.`;
    }

    if (complexity < 5) {
      return `Moderate complexity task. Consider breaking into 2-3 focused subtasks using ${requiredModes.join(" and ")} modes.`;
    }

    const approach = [];

    if (requiredModes.includes("architect")) {
      approach.push("Start with architectural design and planning");
    }

    if (requiredModes.includes("code")) {
      approach.push("Break implementation into focused, manageable components");
    }

    if (requiredModes.includes("debug")) {
      approach.push("Include systematic testing and debugging phases");
    }

    approach.push(
      "Use orchestration to coordinate between different modes and subtasks",
    );

    return approach.join(". ") + ".";
  }
}
