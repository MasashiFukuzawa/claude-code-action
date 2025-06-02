import type { SubTask, TaskContext } from "../tasks/types";
import type {
  SubtaskPromptContext,
  PromptGenerationResult,
  PromptMetadata,
  QualityScore,
} from "./prompt-types";
import { ModePromptGenerator } from "./mode-prompt-generator";

export class SubtaskPromptGenerator {
  private modePromptGenerator: ModePromptGenerator;

  constructor() {
    this.modePromptGenerator = new ModePromptGenerator();
  }

  generateSubtaskPrompt(
    subtask: SubTask,
    context: TaskContext,
  ): PromptGenerationResult {
    const startTime = Date.now();

    // Create enhanced context for subtask
    const subtaskContext: SubtaskPromptContext = {
      mode: subtask.mode,
      taskDescription: subtask.description,
      globalContext: context.globalContext,
      previousResults: context.previousResults,
      constraints: {
        maxTokens: context.maxTokens,
        requiredSections: this.getRequiredSectionsForMode(subtask.mode),
        forbiddenTerms: [],
        outputFormat: "markdown",
      },
      subtask,
      dependencies: subtask.dependencies,
      parentTaskId: subtask.parentTaskId,
      executionOrder: subtask.priority,
    };

    // Generate base prompt using mode generator
    const baseResult =
      this.modePromptGenerator.generateModeSpecificPrompt(subtaskContext);

    // Enhance with subtask-specific context
    let enhancedPrompt = this.enhanceWithSubtaskContext(
      baseResult.prompt,
      subtask,
      context,
    );

    // Add dependency information if present
    if (subtask.dependencies.length > 0) {
      enhancedPrompt = this.injectDependencyInfo(
        enhancedPrompt,
        this.resolveDependencies(subtask.dependencies, context),
      );
    }

    // Add execution context
    enhancedPrompt = this.addExecutionContext(enhancedPrompt, subtask, context);

    const metadata: PromptMetadata = {
      ...baseResult.metadata,
      tokensUsed: this.estimateTokens(enhancedPrompt),
      optimizationApplied: [
        ...baseResult.metadata.optimizationApplied,
        "subtask_context",
        "dependency_injection",
      ],
      generationTime: Date.now() - startTime,
    };

    const qualityScore = this.calculateSubtaskQualityScore(
      enhancedPrompt,
      subtaskContext,
    );

    return {
      prompt: enhancedPrompt,
      metadata,
      qualityScore,
      warnings: baseResult.warnings,
    };
  }

  createContextualizedPrompt(
    subtask: SubTask,
    previousResults: string[],
  ): string {
    let prompt = `## Subtask: ${subtask.description}\n\n`;

    if (previousResults.length > 0) {
      prompt += `### Previous Work Completed\n`;
      previousResults.forEach((result, index) => {
        prompt += `${index + 1}. ${result}\n`;
      });
      prompt += "\n";
    }

    prompt += `### Current Task Requirements\n`;
    prompt += `- Mode: ${subtask.mode}\n`;
    prompt += `- Priority: ${subtask.priority}\n`;
    prompt += `- Estimated Complexity: ${subtask.estimatedComplexity}/10\n\n`;

    if (subtask.dependencies.length > 0) {
      prompt += `### Dependencies\n`;
      prompt += `This task depends on: ${subtask.dependencies.join(", ")}\n\n`;
    }

    prompt += `### Task Description\n${subtask.description}\n\n`;

    return prompt;
  }

  injectDependencyInfo(prompt: string, dependencies: string[]): string {
    if (dependencies.length === 0) return prompt;

    const dependencySection = `
### Dependencies and Prerequisites

The following components must be available and functioning before implementing this task:

${dependencies.map((dep, index) => `${index + 1}. ${dep}`).join("\n")}

Please ensure your implementation builds upon these existing components and maintains compatibility.

---

`;

    return dependencySection + prompt;
  }

  private enhanceWithSubtaskContext(
    basePrompt: string,
    subtask: SubTask,
    context: TaskContext,
  ): string {
    let enhanced = basePrompt;

    // Add subtask-specific metadata
    enhanced += `\n## Subtask Information\n`;
    enhanced += `- **Subtask ID**: ${subtask.id}\n`;
    enhanced += `- **Execution Priority**: ${subtask.priority}\n`;
    enhanced += `- **Estimated Complexity**: ${subtask.estimatedComplexity}/10\n`;

    if (subtask.estimatedDuration) {
      enhanced += `- **Estimated Duration**: ${subtask.estimatedDuration} minutes\n`;
    }

    // Add mode-specific context if available
    if (
      context.modeSpecificContext &&
      Object.keys(context.modeSpecificContext).length > 0
    ) {
      enhanced += `\n## Mode-Specific Context\n`;
      Object.entries(context.modeSpecificContext).forEach(([key, value]) => {
        enhanced += `- **${key}**: ${value}\n`;
      });
    }

    return enhanced;
  }

  private addExecutionContext(
    prompt: string,
    subtask: SubTask,
    _context: TaskContext,
  ): string {
    let enhanced = prompt;

    enhanced += `\n## Execution Guidelines\n`;

    // Add complexity-based guidance
    if (subtask.estimatedComplexity > 7) {
      enhanced += `- **High Complexity Task**: Break down into smaller steps and validate each step\n`;
      enhanced += `- **Quality Focus**: Prioritize thorough testing and documentation\n`;
    } else if (subtask.estimatedComplexity > 4) {
      enhanced += `- **Moderate Complexity**: Ensure clear implementation with adequate testing\n`;
    } else {
      enhanced += `- **Straightforward Task**: Focus on clean, efficient implementation\n`;
    }

    // Add priority-based guidance
    if (subtask.priority === 1) {
      enhanced += `- **Critical Priority**: This task blocks other work - complete accurately and promptly\n`;
    } else if (subtask.priority <= 3) {
      enhanced += `- **High Priority**: Important for project progress\n`;
    }

    // Add dependency guidance
    if (subtask.dependencies.length > 0) {
      enhanced += `- **Dependency Aware**: Ensure compatibility with completed prerequisite tasks\n`;
    }

    enhanced += `\nPlease provide a complete implementation that addresses all requirements and maintains quality standards.`;

    return enhanced;
  }

  private resolveDependencies(
    dependencyIds: string[],
    context: TaskContext,
  ): string[] {
    // In a full implementation, this would resolve dependency IDs to their descriptions
    // For now, we'll use the previous results as proxy for dependencies
    const resolvedDependencies: string[] = [];

    dependencyIds.forEach((depId, index) => {
      if (index < context.previousResults.length) {
        resolvedDependencies.push(context.previousResults[index] || "");
      } else {
        resolvedDependencies.push(
          `Dependency ${depId || "unknown"} (details to be resolved)`,
        );
      }
    });

    return resolvedDependencies;
  }

  private getRequiredSectionsForMode(mode: string): string[] {
    const sectionMap: Record<string, string[]> = {
      code: ["implementation", "testing", "documentation"],
      architect: ["overview", "components", "interactions", "considerations"],
      debug: ["analysis", "investigation", "solution", "prevention"],
      ask: ["explanation", "examples", "references"],
      orchestrator: ["breakdown", "coordination", "monitoring"],
    };

    return sectionMap[mode] || sectionMap["code"] || [];
  }

  private calculateSubtaskQualityScore(
    prompt: string,
    context: SubtaskPromptContext,
  ): QualityScore {
    const baseScore = this.modePromptGenerator.calculateQualityScore(
      prompt,
      context,
    );

    // Additional subtask-specific quality factors
    const hasDependencyInfo =
      context.dependencies.length === 0 || prompt.includes("Dependencies");
    const hasExecutionGuidance = prompt.includes("Execution Guidelines");
    const hasSubtaskMetadata = prompt.includes("Subtask Information");

    const subtaskSpecificity =
      ((hasDependencyInfo ? 1 : 0) +
        (hasExecutionGuidance ? 1 : 0) +
        (hasSubtaskMetadata ? 1 : 0)) /
      3;

    return {
      ...baseScore,
      specificity: (baseScore.specificity + subtaskSpecificity) / 2,
      overall: (baseScore.overall + subtaskSpecificity) / 2,
    };
  }

  private estimateTokens(text: string): number {
    const words = text.split(/\s+/).length;
    const chars = text.length;
    const wordBasedTokens = words * 0.75;
    const charBasedTokens = chars / 4;
    return Math.ceil((wordBasedTokens + charBasedTokens) / 2);
  }
}
