import { PriorityCalculator } from "./priority-calculator";
import { TokenOptimizer } from "./token-optimizer";
import type {
  ContextParams,
  OptimizationResult,
  KeyInfo,
} from "./context-types";
import type { TaskContext } from "../tasks/types";

export class ContextOptimizer {
  private priorityCalculator: PriorityCalculator;
  private tokenOptimizer: TokenOptimizer;

  constructor() {
    this.priorityCalculator = new PriorityCalculator();
    this.tokenOptimizer = new TokenOptimizer();
  }

  createContextForSubTask(params: ContextParams): TaskContext {
    // Apply priority overrides if provided
    if (params.priorityOverrides) {
      this.priorityCalculator.updateModePriorities(
        params.mode,
        params.priorityOverrides,
      );
    }

    // Extract and prioritize relevant information
    const relevantInfo = this.extractRelevantInfo(
      params.previousResults,
      params.mode,
    );

    // Create mode-specific context
    const modeSpecificContext = this.createModeSpecificContext(params);

    // Optimize for token limit
    const optimizedInfo = this.optimizeContext(
      {
        relevantInfo,
        modeSpecificContext,
        globalContext: params.globalContext,
      },
      params.maxTokens,
    );

    return {
      previousResults: optimizedInfo.relevantInfo || [],
      globalContext: optimizedInfo.globalContext || {},
      modeSpecificContext: optimizedInfo.modeSpecificContext || {},
      maxTokens: params.maxTokens,
    };
  }

  extractRelevantInfo(previousResults: string[], mode: string): string[] {
    if (!previousResults || previousResults.length === 0) {
      return [];
    }

    // Convert results to info objects for prioritization
    const infoObjects = previousResults.map((result, index) => ({
      type: this.classifyInformation(result),
      content: result,
      timestamp: new Date(Date.now() - index * 60000), // Simulate recency
      category: this.categorizeForMode(result, mode),
    }));

    // Rank by priority for the given mode
    const ranked = this.priorityCalculator.rankInformationByPriority(
      infoObjects,
      mode,
    );

    // Return the content of top-ranked items
    return ranked.map((item) => item.content);
  }

  optimizeContext(context: any, maxTokens: number): any {
    if (maxTokens <= 0) {
      return context;
    }

    const currentTokens = this.calculateContextTokens(context);
    if (currentTokens <= maxTokens) {
      return context;
    }

    // Use token optimizer to reduce size
    return this.tokenOptimizer.optimizeForTokenLimit(context, maxTokens);
  }

  calculateReductionRatio(original: any, optimized: any): number {
    const originalTokens = this.calculateContextTokens(original);
    const optimizedTokens = this.calculateContextTokens(optimized);

    if (originalTokens === 0) return 0;

    return Math.max(0, (originalTokens - optimizedTokens) / originalTokens);
  }

  generateOptimizationReport(
    original: any,
    optimized: any,
  ): OptimizationResult {
    const originalTokens = this.calculateContextTokens(original);
    const optimizedTokens = this.calculateContextTokens(optimized);
    const reductionRatio = this.calculateReductionRatio(original, optimized);

    return {
      originalTokens,
      optimizedTokens,
      reductionRatio,
      preservedInfo: this.extractPreservedInfo(original, optimized),
      removedInfo: this.extractRemovedInfo(original, optimized),
      optimizationStrategies: [
        "prioritization",
        "token_optimization",
        "relevance_filtering",
      ],
    };
  }

  private createModeSpecificContext(
    params: ContextParams,
  ): Record<string, any> {
    const { mode, taskDescription } = params;

    const baseContext = {
      mode,
      taskDescription,
      optimizationLevel: this.determineOptimizationLevel(params.maxTokens),
    };

    // Add mode-specific optimizations
    switch (mode) {
      case "code":
        return {
          ...baseContext,
          focusAreas: [
            "implementation_details",
            "file_changes",
            "technical_requirements",
          ],
          excludeTypes: ["high_level_design", "business_requirements"],
        };

      case "architect":
        return {
          ...baseContext,
          focusAreas: [
            "system_design",
            "dependencies",
            "architecture_decisions",
          ],
          excludeTypes: ["implementation_details", "low_level_bugs"],
        };

      case "debug":
        return {
          ...baseContext,
          focusAreas: ["error_information", "performance_data", "system_logs"],
          excludeTypes: ["design_decisions", "future_planning"],
        };

      case "ask":
        return {
          ...baseContext,
          focusAreas: ["documentation", "explanations", "knowledge_base"],
          excludeTypes: ["implementation_specifics", "error_logs"],
        };

      case "orchestrator":
        return {
          ...baseContext,
          focusAreas: [
            "task_dependencies",
            "coordination_requirements",
            "overall_progress",
          ],
          excludeTypes: ["implementation_details"],
        };

      default:
        return baseContext;
    }
  }

  private classifyInformation(content: string): string {
    const lowerContent = content.toLowerCase();

    if (
      this.containsKeywords(lowerContent, [
        "error",
        "exception",
        "failed",
        "bug",
      ])
    ) {
      return "error_info";
    }

    if (
      this.containsKeywords(lowerContent, [
        "design",
        "architecture",
        "decided",
        "plan",
      ])
    ) {
      return "design_decision";
    }

    if (
      this.containsKeywords(lowerContent, [
        "implemented",
        "created",
        "added",
        "modified",
        "file",
      ])
    ) {
      return "file_change";
    }

    if (
      this.containsKeywords(lowerContent, [
        "performance",
        "speed",
        "memory",
        "cpu",
        "latency",
      ])
    ) {
      return "performance_data";
    }

    if (
      this.containsKeywords(lowerContent, [
        "test",
        "spec",
        "passed",
        "failed",
        "coverage",
      ])
    ) {
      return "test_result";
    }

    if (
      this.containsKeywords(lowerContent, [
        "security",
        "auth",
        "permission",
        "vulnerability",
      ])
    ) {
      return "security_concern";
    }

    if (
      this.containsKeywords(lowerContent, [
        "dependency",
        "library",
        "package",
        "import",
      ])
    ) {
      return "dependency_info";
    }

    return "technical_detail";
  }

  private categorizeForMode(
    content: string,
    mode: string,
  ): "implementation" | "design" | "debugging" | "testing" | "documentation" {
    const lowerContent = content.toLowerCase();

    if (
      mode === "architect" ||
      this.containsKeywords(lowerContent, ["design", "architecture", "plan"])
    ) {
      return "design";
    }

    if (
      mode === "debug" ||
      this.containsKeywords(lowerContent, ["error", "bug", "fix", "debug"])
    ) {
      return "debugging";
    }

    if (
      this.containsKeywords(lowerContent, [
        "test",
        "spec",
        "coverage",
        "verify",
      ])
    ) {
      return "testing";
    }

    if (
      this.containsKeywords(lowerContent, [
        "document",
        "explain",
        "guide",
        "readme",
      ])
    ) {
      return "documentation";
    }

    return "implementation";
  }

  private containsKeywords(content: string, keywords: string[]): boolean {
    return keywords.some((keyword) => content.includes(keyword));
  }

  private determineOptimizationLevel(
    maxTokens: number,
  ): "aggressive" | "balanced" | "conservative" {
    if (maxTokens < 1000) return "aggressive";
    if (maxTokens < 3000) return "balanced";
    return "conservative";
  }

  private calculateContextTokens(context: any): number {
    return this.tokenOptimizer.calculateTokenCount(JSON.stringify(context));
  }

  private extractPreservedInfo(_original: any, _optimized: any): KeyInfo[] {
    // Simplified implementation - in practice, this would track actual preserved information
    return [];
  }

  private extractRemovedInfo(_original: any, _optimized: any): string[] {
    // Simplified implementation - in practice, this would track removed information
    return [];
  }
}
