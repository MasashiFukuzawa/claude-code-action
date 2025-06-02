import { ModePromptGenerator } from "./mode-prompt-generator";
import { SubtaskPromptGenerator } from "./subtask-prompt-generator";
import type { Mode } from "../modes/types";
import type { SubTask, TaskContext } from "../tasks/types";
import type {
  ModePromptContext,
  PromptConstraints,
  PromptGenerationResult,
  PromptValidationResult,
} from "./prompt-types";

export class PromptExtension {
  private modePromptGenerator: ModePromptGenerator;
  private subtaskPromptGenerator: SubtaskPromptGenerator;

  constructor() {
    this.modePromptGenerator = new ModePromptGenerator();
    this.subtaskPromptGenerator = new SubtaskPromptGenerator();
  }

  createPromptForMode(
    context: ModePromptContext,
    mode: Mode,
  ): PromptGenerationResult {
    // Ensure mode is correctly set in context
    const enhancedContext = {
      ...context,
      mode: mode.slug,
    };

    return this.modePromptGenerator.generateModeSpecificPrompt(enhancedContext);
  }

  createPromptForSubtask(
    subtask: SubTask,
    context: TaskContext,
  ): PromptGenerationResult {
    return this.subtaskPromptGenerator.generateSubtaskPrompt(subtask, context);
  }

  optimizePrompt(prompt: string, constraints: PromptConstraints): string {
    let optimized = prompt;

    // Remove forbidden terms
    if (constraints.forbiddenTerms && constraints.forbiddenTerms.length > 0) {
      constraints.forbiddenTerms.forEach((term) => {
        const regex = new RegExp(term, "gi");
        optimized = optimized.replace(regex, "[TERM_REMOVED]");
      });
    }

    // Optimize for token limit
    if (constraints.maxTokens) {
      const estimatedTokens = this.estimateTokens(optimized);
      if (estimatedTokens > constraints.maxTokens) {
        optimized = this.truncateToTokenLimit(optimized, constraints.maxTokens);
      }
    }

    // Ensure required sections are present
    if (
      constraints.requiredSections &&
      constraints.requiredSections.length > 0
    ) {
      optimized = this.ensureRequiredSections(
        optimized,
        constraints.requiredSections,
      );
    }

    // Apply output format
    optimized = this.applyOutputFormat(optimized, constraints.outputFormat);

    return optimized;
  }

  enhanceExistingPrompt(
    existingPrompt: string,
    enhancement: ModePromptContext,
  ): PromptGenerationResult {
    const startTime = Date.now();

    // Generate mode-specific enhancement
    const modeResult =
      this.modePromptGenerator.generateModeSpecificPrompt(enhancement);

    // Combine existing prompt with enhancement
    const combinedPrompt = this.combinePrompts(
      existingPrompt,
      modeResult.prompt,
    );

    // Optimize the combined prompt
    const optimizedPrompt = this.optimizePrompt(
      combinedPrompt,
      enhancement.constraints,
    );

    return {
      prompt: optimizedPrompt,
      metadata: {
        ...modeResult.metadata,
        optimizationApplied: [
          ...modeResult.metadata.optimizationApplied,
          "existing_prompt_enhancement",
        ],
        generationTime: Date.now() - startTime,
      },
      qualityScore: modeResult.qualityScore,
      warnings: modeResult.warnings,
    };
  }

  validatePrompt(
    prompt: string,
    constraints: PromptConstraints,
  ): PromptValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check token limit
    const tokenCount = this.estimateTokens(prompt);
    if (tokenCount > constraints.maxTokens) {
      errors.push(
        `Prompt exceeds token limit: ${tokenCount} > ${constraints.maxTokens}`,
      );
    } else if (tokenCount > constraints.maxTokens * 0.9) {
      warnings.push("Prompt is close to token limit, consider optimization");
    }

    // Check required sections
    if (constraints.requiredSections) {
      const missingSections = constraints.requiredSections.filter(
        (section) => !prompt.toLowerCase().includes(section.toLowerCase()),
      );
      if (missingSections.length > 0) {
        errors.push(`Missing required sections: ${missingSections.join(", ")}`);
      }
    }

    // Check forbidden terms
    if (constraints.forbiddenTerms) {
      const foundTerms = constraints.forbiddenTerms.filter((term) =>
        prompt.toLowerCase().includes(term.toLowerCase()),
      );
      if (foundTerms.length > 0) {
        errors.push(`Contains forbidden terms: ${foundTerms.join(", ")}`);
      }
    }

    // Quality suggestions
    if (prompt.length < 100) {
      suggestions.push("Prompt might be too short for effective guidance");
    }
    if (prompt.length > 10000) {
      suggestions.push(
        "Prompt might be too long, consider breaking into sections",
      );
    }
    if (!prompt.includes("task") && !prompt.includes("Task")) {
      suggestions.push("Consider making the task description more explicit");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  estimateTokens(text: string): number {
    const words = text.split(/\s+/).length;
    const chars = text.length;
    const wordBasedTokens = words * 0.75;
    const charBasedTokens = chars / 4;
    return Math.ceil((wordBasedTokens + charBasedTokens) / 2);
  }

  private truncateToTokenLimit(prompt: string, maxTokens: number): string {
    const targetChars = maxTokens * 4; // Rough estimation

    if (prompt.length <= targetChars) {
      return prompt;
    }

    // Truncate at sentence boundaries when possible
    const sentences = prompt.split(/[.!?]+/);
    let result = "";

    for (const sentence of sentences) {
      if ((result + sentence).length > targetChars - 100) {
        // Leave buffer
        break;
      }
      result += sentence + ".";
    }

    return result + "\n\n[Content truncated to fit token limit]";
  }

  private ensureRequiredSections(
    prompt: string,
    requiredSections: string[],
  ): string {
    let enhanced = prompt;

    const missingSections = requiredSections.filter(
      (section) => !prompt.toLowerCase().includes(section.toLowerCase()),
    );

    if (missingSections.length > 0) {
      enhanced += "\n\n## Required Sections\n";
      enhanced += "Please ensure your response includes:\n";
      missingSections.forEach((section) => {
        enhanced += `- ${section}\n`;
      });
    }

    return enhanced;
  }

  private applyOutputFormat(prompt: string, format: string): string {
    switch (format) {
      case "json":
        return `${prompt}\n\nPlease provide your response in valid JSON format.`;
      case "yaml":
        return `${prompt}\n\nPlease provide your response in YAML format.`;
      case "code":
        return `${prompt}\n\nPlease provide your response primarily as code with minimal explanatory text.`;
      case "markdown":
      default:
        return `${prompt}\n\nPlease provide your response in well-formatted Markdown.`;
    }
  }

  private combinePrompts(existing: string, enhancement: string): string {
    return `${existing}\n\n---\n\n## Additional Context\n\n${enhancement}`;
  }
}
