import { TaskAnalyzer } from "../orchestration/task-analyzer";
import { modeManager } from "../modes/mode-manager";
import { SubtaskGenerator } from "../orchestration/subtask-generator";
import { ModeSelector } from "../orchestration/mode-selector";
import type {
  AnalyzeTaskArgs,
  SwitchModeArgs,
  OptimizeContextArgs,
  DecomposeTaskArgs,
  BoomerangArgs,
  OptimizedContext,
  BoomerangResult,
  ModeContext,
} from "./orchestration-types";
import type { TaskAnalysis, SubTask } from "../orchestration/types";
import type { Mode } from "../modes/types";

export class OrchestrationTools {
  private taskAnalyzer: TaskAnalyzer;
  private subtaskGenerator: SubtaskGenerator;
  private modeSelector: ModeSelector;
  private currentMode: Mode;

  constructor() {
    this.taskAnalyzer = new TaskAnalyzer();
    this.subtaskGenerator = new SubtaskGenerator();
    this.modeSelector = new ModeSelector();
    this.currentMode = modeManager.getDefaultMode();
  }

  async analyzeTask(args: AnalyzeTaskArgs): Promise<TaskAnalysis> {
    const { task, context } = args;

    // Analyze task complexity
    const analysis = this.taskAnalyzer.analyzeTask(task);

    // Enhance analysis with context if provided
    if (context) {
      analysis.suggestedApproach = this.enhanceApproachWithContext(
        analysis.suggestedApproach,
        context,
      );
    }

    return analysis;
  }

  async switchMode(args: SwitchModeArgs): Promise<ModeContext> {
    const { mode: modeSlug, preserveContext = false } = args;

    const previousMode = this.currentMode;
    const newMode = modeManager.getModeBySlug(modeSlug);

    this.currentMode = newMode;

    return {
      mode: newMode,
      previousMode,
      contextPreserved: preserveContext,
    };
  }

  async optimizeContext(args: OptimizeContextArgs): Promise<OptimizedContext> {
    const { context, maxTokens, priorityKeys = [] } = args;

    // Calculate current token usage
    const currentTokens = this.calculateContextTokens(context);

    if (currentTokens <= maxTokens) {
      return {
        context,
        tokensUsed: currentTokens,
        removedKeys: [],
        compressionRatio: 0,
      };
    }

    // Optimize context by removing low-priority items
    const optimizedContext = this.removeNonPriorityItems(
      context,
      priorityKeys,
      maxTokens,
    );
    const optimizedTokens = this.calculateContextTokens(optimizedContext);

    // Calculate removed keys
    const originalKeys = Object.keys(context);
    const optimizedKeys = Object.keys(optimizedContext);
    const removedKeys = originalKeys.filter(
      (key) => !optimizedKeys.includes(key),
    );

    const compressionRatio =
      currentTokens > 0 ? (currentTokens - optimizedTokens) / currentTokens : 0;

    return {
      context: optimizedContext,
      tokensUsed: optimizedTokens,
      removedKeys,
      compressionRatio,
    };
  }

  async decomposeTask(args: DecomposeTaskArgs): Promise<SubTask[]> {
    const { task, maxSubtasks = 10, autoAssignModes = true } = args;

    // Analyze task first
    const analysis = await this.analyzeTask({ task });

    // Generate subtasks
    const subtasks = this.subtaskGenerator.generateSubtasks(analysis);

    // Limit number of subtasks
    const limitedSubtasks = subtasks.slice(0, maxSubtasks);

    // Auto-assign modes if requested
    if (autoAssignModes) {
      return limitedSubtasks.map((subtask) => ({
        ...subtask,
        mode: subtask.mode || this.selectOptimalMode(subtask.description),
      }));
    }

    return limitedSubtasks;
  }

  async boomerang(args: BoomerangArgs): Promise<BoomerangResult> {
    const { task, targetMode, returnContext = false } = args;
    const startTime = Date.now();

    // Switch to target mode
    const switchResult = await this.switchMode({
      mode: targetMode,
      preserveContext: returnContext,
    });

    // Execute task in target mode (simulated)
    const result = await this.executeInMode(task, switchResult.mode);

    // Return to previous mode if context was preserved
    if (returnContext) {
      await this.switchMode({
        mode: switchResult.previousMode.slug,
        preserveContext: true,
      });
    }

    return {
      result: result.output,
      mode: targetMode,
      tokensUsed: result.tokensUsed,
      duration: Date.now() - startTime,
    };
  }

  private enhanceApproachWithContext(
    approach: string,
    context: Record<string, any>,
  ): string {
    const contextInfo = Object.entries(context)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    return `${approach} Context: ${contextInfo}`;
  }

  private selectOptimalMode(taskDescription: string): string {
    return this.modeSelector.selectOptimalMode(taskDescription);
  }

  private async executeInMode(
    task: string,
    mode: Mode,
  ): Promise<{ output: string; tokensUsed: number }> {
    // Simulate execution in specific mode
    const baseTokens = 500;
    const complexityMultiplier = task.length / 100;

    return {
      output: `Executed "${task}" in ${mode.name} mode. ${mode.roleDefinition}`,
      tokensUsed: Math.floor(baseTokens * complexityMultiplier),
    };
  }

  private calculateContextTokens(context: Record<string, any>): number {
    // Simple token calculation based on string length
    // In practice, this would use a proper tokenizer
    const contextString = JSON.stringify(context);
    return Math.floor(contextString.length / 4); // Rough approximation: 4 chars = 1 token
  }

  private removeNonPriorityItems(
    context: Record<string, any>,
    priorityKeys: string[],
    maxTokens: number,
  ): Record<string, any> {
    const result: Record<string, any> = {};
    let currentTokens = 0;

    // First, add priority items
    for (const key of priorityKeys) {
      if (key in context) {
        const tokens = this.calculateContextTokens({ [key]: context[key] });
        if (currentTokens + tokens <= maxTokens) {
          result[key] = context[key];
          currentTokens += tokens;
        }
      }
    }

    // Then add other items if space allows
    for (const [key, value] of Object.entries(context)) {
      if (!priorityKeys.includes(key) && !(key in result)) {
        const tokens = this.calculateContextTokens({ [key]: value });
        if (currentTokens + tokens <= maxTokens) {
          result[key] = value;
          currentTokens += tokens;
        }
      }
    }

    return result;
  }
}
