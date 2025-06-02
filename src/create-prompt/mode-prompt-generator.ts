import { modeManager } from "../modes";
import type { Mode } from "../modes/types";
import type {
  ModePromptContext,
  PromptTemplate,
  PromptGenerationResult,
  PromptMetadata,
  QualityScore,
} from "./prompt-types";

export class ModePromptGenerator {
  private promptTemplates: Map<string, PromptTemplate>;

  constructor() {
    this.promptTemplates = this.initializePromptTemplates();
  }

  generateModeSpecificPrompt(
    context: ModePromptContext,
  ): PromptGenerationResult {
    const startTime = Date.now();
    let mode: Mode;
    try {
      mode = modeManager.getModeBySlug(context.mode);
    } catch {
      mode = modeManager.getModeBySlug("code");
    }
    const template = this.getTemplateForMode(context.mode);

    const warnings: string[] = [];
    try {
      modeManager.getModeBySlug(context.mode);
    } catch {
      warnings.push("Unknown mode, falling back to code mode");
    }

    // Generate base prompt from template
    let prompt = this.expandTemplate(template, context);

    // Apply mode-specific constraints and instructions
    prompt = this.applyModeConstraints(prompt, mode);

    // Add mode-specific instructions
    const modeInstructions = this.getModeInstructions(context.mode);
    prompt = this.injectModeInstructions(prompt, modeInstructions);

    // Optimize for token limit
    if (context.constraints.maxTokens) {
      prompt = this.optimizeForTokenLimit(
        prompt,
        context.constraints.maxTokens,
      );
    }

    const metadata: PromptMetadata = {
      mode: mode.slug,
      templateUsed: template.mode,
      tokensUsed: this.estimateTokens(prompt),
      optimizationApplied: ["mode_constraints", "token_optimization"],
      generationTime: Date.now() - startTime,
    };

    const qualityScore = this.calculateQualityScore(prompt, context);

    return {
      prompt,
      metadata,
      qualityScore,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  getModeInstructions(mode: string): string {
    const instructionMap: Record<string, string> = {
      code: `
## Implementation Guidelines
- Focus on clean, maintainable code
- Include error handling and edge cases
- Provide comprehensive testing approach
- Follow established coding standards
- Consider performance implications
      `,
      architect: `
## Design Guidelines
- Consider scalability and maintainability
- Define clear component boundaries
- Specify integration patterns
- Address non-functional requirements
- Provide migration strategy if needed
      `,
      debug: `
## Debugging Guidelines
- Systematically analyze the problem
- Identify root causes, not just symptoms
- Provide step-by-step troubleshooting
- Include diagnostic commands and tools
- Suggest preventive measures
      `,
      ask: `
## Information Guidelines
- Provide clear, comprehensive explanations
- Include relevant examples and use cases
- Reference authoritative sources
- Structure information logically
- Anticipate follow-up questions
      `,
      orchestrator: `
## Orchestration Guidelines
- Break down complex tasks systematically
- Identify dependencies and execution order
- Delegate to appropriate specialized modes
- Coordinate between different components
- Monitor overall progress and quality
      `,
    };

    return instructionMap[mode] || instructionMap["code"] || "";
  }

  applyModeConstraints(prompt: string, mode: Mode): string {
    // Add mode-specific role and context
    const roleDefinition = mode.roleDefinition;
    const customInstructions = mode.customInstructions || "";

    let enhancedPrompt = `${roleDefinition}\n\n`;

    if (customInstructions) {
      enhancedPrompt += `${customInstructions}\n\n`;
    }

    enhancedPrompt += prompt;

    // Apply mode-specific formatting and constraints
    switch (mode.slug) {
      case "code":
        enhancedPrompt +=
          "\n\nPlease provide implementation details, including code examples and testing approaches.";
        break;
      case "architect":
        enhancedPrompt +=
          "\n\nPlease provide architectural diagrams, component descriptions, and integration patterns.";
        break;
      case "debug":
        enhancedPrompt +=
          "\n\nPlease provide step-by-step debugging analysis and specific solutions.";
        break;
      case "ask":
        enhancedPrompt +=
          "\n\nPlease provide comprehensive explanations with examples and references.";
        break;
    }

    return enhancedPrompt;
  }

  calculateQualityScore(
    prompt: string,
    context: ModePromptContext,
  ): QualityScore {
    // Simple quality metrics
    const hasRequiredSections = context.constraints.requiredSections.every(
      (section) => prompt.toLowerCase().includes(section.toLowerCase()),
    );

    const hasContext = prompt.includes(context.taskDescription);
    const appropriateLength = prompt.length > 200 && prompt.length < 8000;
    const hasModeSpecificTerms = this.containsModeSpecificTerms(
      prompt,
      context.mode,
    );

    const completeness = hasRequiredSections ? 0.9 : 0.6;
    const specificity = hasContext ? 0.8 : 0.5;
    const clarity = appropriateLength ? 0.8 : 0.6;
    const contextRelevance = hasModeSpecificTerms ? 0.85 : 0.7;
    const tokenEfficiency = this.calculateTokenEfficiency(
      prompt,
      context.constraints.maxTokens,
    );

    const overall =
      (completeness +
        specificity +
        clarity +
        contextRelevance +
        tokenEfficiency) /
      5;

    return {
      overall,
      clarity,
      completeness,
      specificity,
      tokenEfficiency,
      contextRelevance,
    };
  }

  private initializePromptTemplates(): Map<string, PromptTemplate> {
    const templates = new Map<string, PromptTemplate>();

    templates.set("code", {
      mode: "code",
      templateString: `
# Implementation Task: {task}

## Context
{context}

## Previous Work
{previousResults}

## Requirements
{requirements}

## Technical Constraints
{technicalConstraints}

Please implement the solution following best practices.
      `,
      variables: [
        "task",
        "context",
        "previousResults",
        "requirements",
        "technicalConstraints",
      ],
      constraints: {
        maxTokens: 4000,
        requiredSections: ["implementation", "testing"],
        forbiddenTerms: [],
        outputFormat: "markdown",
      },
    });

    templates.set("architect", {
      mode: "architect",
      templateString: `
# Architecture Design: {task}

## System Context
{context}

## Background
{previousResults}

## Requirements
{requirements}

## Constraints
{constraints}

Please design a comprehensive architecture solution.
      `,
      variables: [
        "task",
        "context",
        "previousResults",
        "requirements",
        "constraints",
      ],
      constraints: {
        maxTokens: 5000,
        requiredSections: ["overview", "components", "interactions"],
        forbiddenTerms: [],
        outputFormat: "markdown",
      },
    });

    templates.set("debug", {
      mode: "debug",
      templateString: `
# Debugging Task: {task}

## Problem Description
{context}

## Investigation History
{previousResults}

## System Information
{systemInfo}

## Error Details
{errorDetails}

Please provide systematic debugging analysis.
      `,
      variables: [
        "task",
        "context",
        "previousResults",
        "systemInfo",
        "errorDetails",
      ],
      constraints: {
        maxTokens: 3500,
        requiredSections: ["analysis", "solution", "prevention"],
        forbiddenTerms: [],
        outputFormat: "markdown",
      },
    });

    templates.set("orchestrator", {
      mode: "orchestrator",
      templateString: `
# Orchestration Plan: {task}

## Goal
{goal}

## Main Steps
{mainSteps}

## Key Considerations
{considerations}

## Coordination Strategy
{coordination}

Please outline a detailed orchestration plan.
      `,
      variables: [
        "task",
        "goal",
        "mainSteps",
        "considerations",
        "coordination",
      ],
      constraints: {
        maxTokens: 4500,
        requiredSections: ["plan", "steps", "dependencies", "monitoring"],
        forbiddenTerms: [],
        outputFormat: "markdown",
      },
    });

    return templates;
  }

  private getTemplateForMode(mode: string): PromptTemplate {
    return this.promptTemplates.get(mode) || this.promptTemplates.get("code")!;
  }

  private expandTemplate(
    template: PromptTemplate,
    context: ModePromptContext,
  ): string {
    let prompt = template.templateString;

    const variableMap: Record<string, string> = {
      task: context.taskDescription,
      context: this.formatContext(context.globalContext),
      previousResults: this.formatPreviousResults(context.previousResults),
      requirements: this.extractRequirements(context),
      technicalConstraints: this.formatConstraints(context.constraints),
      constraints: this.formatConstraints(context.constraints),
      systemInfo: this.formatSystemInfo(context.globalContext),
      errorDetails: this.extractErrorDetails(context),
      goal: context.taskDescription,
      mainSteps: this.formatPreviousResults(context.previousResults),
      considerations: this.formatContext(context.globalContext),
      coordination: "Coordinate between different modes and components",
    };

    for (const [variable, value] of Object.entries(variableMap)) {
      const regex = new RegExp(`{${variable}}`, "g");
      prompt = prompt.replace(regex, value || "");
    }

    return prompt;
  }

  private formatContext(globalContext: Record<string, any>): string {
    if (!globalContext || Object.keys(globalContext).length === 0) {
      return "No specific context provided.";
    }

    return Object.entries(globalContext)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join("\n");
  }

  private formatPreviousResults(results: string[]): string {
    if (!results || results.length === 0) {
      return "No previous work completed.";
    }

    return results.map((result, index) => `${index + 1}. ${result}`).join("\n");
  }

  private extractRequirements(context: ModePromptContext): string {
    const sections = context.constraints.requiredSections;
    if (!sections || sections.length === 0) {
      return "General implementation requirements apply.";
    }

    return `Please ensure the following sections are included:\n${sections.map((s) => `- ${s}`).join("\n")}`;
  }

  private formatConstraints(constraints: any): string {
    if (!constraints) return "No specific constraints.";

    const items = [];
    if (constraints.maxTokens)
      items.push(`Maximum tokens: ${constraints.maxTokens}`);
    if (constraints.outputFormat)
      items.push(`Output format: ${constraints.outputFormat}`);
    if (constraints.forbiddenTerms?.length > 0) {
      items.push(`Avoid terms: ${constraints.forbiddenTerms.join(", ")}`);
    }

    return items.length > 0 ? items.join("\n") : "No specific constraints.";
  }

  private formatSystemInfo(context: Record<string, any>): string {
    const systemKeys = [
      "os",
      "framework",
      "database",
      "version",
      "environment",
    ];
    const systemInfo = systemKeys
      .filter((key) => context[key])
      .map((key) => `${key}: ${context[key]}`)
      .join("\n");

    return systemInfo || "System information not provided.";
  }

  private extractErrorDetails(context: ModePromptContext): string {
    if (context.modeSpecificData?.error) {
      return context.modeSpecificData.error;
    }
    return "Error details to be investigated.";
  }

  private injectModeInstructions(prompt: string, instructions: string): string {
    return `${prompt}\n\n${instructions}`;
  }

  private optimizeForTokenLimit(prompt: string, maxTokens: number): string {
    const estimatedTokens = this.estimateTokens(prompt);

    if (estimatedTokens <= maxTokens) {
      return prompt;
    }

    // Simple optimization: truncate sections that are too verbose
    const lines = prompt.split("\n");
    const targetRatio = maxTokens / estimatedTokens;
    const targetLines = Math.floor(lines.length * targetRatio);

    return (
      lines.slice(0, targetLines).join("\n") +
      "\n\n[Content optimized for token limit]"
    );
  }

  private estimateTokens(text: string): number {
    const words = text.split(/\s+/).length;
    const chars = text.length;
    const wordBasedTokens = words * 0.75;
    const charBasedTokens = chars / 4;
    return Math.ceil((wordBasedTokens + charBasedTokens) / 2);
  }

  private containsModeSpecificTerms(prompt: string, mode: string): boolean {
    const modeTerms: Record<string, string[]> = {
      code: ["implement", "function", "class", "method", "test"],
      architect: ["design", "architecture", "component", "system", "pattern"],
      debug: ["debug", "analyze", "troubleshoot", "investigate", "fix"],
      ask: ["explain", "describe", "clarify", "understand", "information"],
    };

    const terms = modeTerms[mode] || [];
    return terms.some((term) => prompt.toLowerCase().includes(term));
  }

  private calculateTokenEfficiency(prompt: string, maxTokens: number): number {
    const estimatedTokens = this.estimateTokens(prompt);
    const efficiency = Math.min(estimatedTokens / maxTokens, 1.0);

    // Penalize if too close to limit (less room for response)
    if (efficiency > 0.8) return efficiency * 0.8;
    return efficiency;
  }
}
