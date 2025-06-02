import type { ParsedGitHubContext } from "../github/context";
import { TaskManager } from "../tasks";
import { TaskAnalyzer } from "../orchestration";
import { ContextOptimizer } from "../orchestration";
import { modeManager } from "../modes/mode-manager";
import { SubtaskExecutionManager } from "../github/operations/subtask-execution";
import { ProgressTracker } from "../github/operations/progress-tracker";
import type {
  OrchestrationResult,
  ProgressUpdate,
  TaskInfo,
  ExecutionPlan,
  BoomerangRequest,
} from "../github/operations/orchestration-types";
import type { TaskAnalysis } from "../orchestration";
import type { SubTask, TaskResult } from "../tasks/types";
import type { Mode } from "../modes/types";

export class OrchestrationEntrypoint {
  private githubContext: ParsedGitHubContext;
  private taskManager: TaskManager;
  private orchestrator?: AutoOrchestrator;
  private progressTracker: ProgressTracker;
  private isInitialized: boolean = false;

  constructor(context: ParsedGitHubContext) {
    this.githubContext = context;
    this.taskManager = new TaskManager();
    this.progressTracker = new ProgressTracker(context);
  }

  async prepare(): Promise<void> {
    // Initialize MCP server
    await this.initializeMCPServer();

    // Initialize orchestrator
    this.orchestrator = new AutoOrchestrator(
      this.taskManager,
      new TaskAnalyzer(),
      new ContextOptimizer(),
      modeManager,
    );

    this.isInitialized = true;
  }

  async execute(): Promise<OrchestrationResult> {
    if (!this.isInitialized || !this.orchestrator) {
      throw new Error("Orchestration not initialized. Call prepare() first.");
    }

    try {
      // Create initial progress comment
      const taskInfo = this.extractTaskInfo();
      await this.progressTracker.createInitialComment(taskInfo);

      // Extract task description from issue/comment
      const taskDescription = this.extractTaskDescription();

      // Orchestrate the task
      const result = await this.orchestrator.orchestrateTask(taskDescription);

      // Update final comment
      await this.progressTracker.finalizeComment(result);

      return result;
    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    }
  }

  async updateProgress(progress: ProgressUpdate): Promise<void> {
    await this.progressTracker.updateProgress(progress.taskId, progress);
  }

  async handleError(error: Error): Promise<void> {
    const errorMessage = `❌ Orchestration failed: ${error.message}`;
    await this.progressTracker.updateWithError(errorMessage);
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  setCommentUpdater(updater: (content: string) => void): void {
    this.progressTracker.setCommentUpdater(updater);
  }

  getLastComment(): string {
    return this.progressTracker.getLastComment();
  }

  private async initializeMCPServer(): Promise<void> {
    // Initialize MCP server with orchestration tools
    // Implementation details...
  }

  private extractTaskInfo(): TaskInfo {
    return {
      id: `task-${Date.now()}`,
      title: (this.githubContext as any).issue?.title || "Task",
      description: (this.githubContext as any).issue?.body || "",
      issueNumber: (this.githubContext as any).issue?.number || 0,
      repository: {
        owner: this.githubContext.repository.owner,
        name: this.githubContext.repository.repo,
      },
    };
  }

  private extractTaskDescription(): string {
    const issueBody = (this.githubContext as any).issue?.body || "";
    const commentBody = (this.githubContext as any).comment?.body || "";
    return `${issueBody}\n\n${commentBody}`;
  }
}

export class AutoOrchestrator {
  constructor(
    private taskManager: TaskManager,
    private taskAnalyzer: TaskAnalyzer,
    private contextOptimizer: ContextOptimizer,
    private modeManager: any,
  ) {}

  async orchestrateTask(taskDescription: string): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const analysis = this.taskAnalyzer.analyzeTask(taskDescription);

    if (!analysis.requiresOrchestration) {
      // Simple task - execute directly
      return this.executeSingleTask(
        taskDescription,
        analysis.requiredModes[0] || "code",
      );
    }

    // Complex task - create subtasks and execution plan
    const subtasks = await this.generateSubtasks(analysis);
    const executionPlan = await this.coordinateExecution(subtasks);

    // Execute subtasks according to plan
    const executionManager = new SubtaskExecutionManager();
    const results = await executionManager.executeDependencyGraph({
      nodes: subtasks,
      edges: this.createDependencyEdges(executionPlan),
    });

    return {
      success: results.every((r) => r.success),
      taskId: `main-${Date.now()}`,
      subtaskResults: results,
      totalDuration: Date.now() - startTime,
      totalTokensUsed: results.reduce((sum, r) => sum + (r.tokensUsed || 0), 0),
      summary: this.generateSummary(results),
    };
  }

  async executeSubTasks(analysis: TaskAnalysis): Promise<TaskResult[]> {
    const subtasks = await this.generateSubtasks(analysis);
    const executionManager = new SubtaskExecutionManager();

    // Group subtasks by dependencies
    const independentTasks = subtasks.filter(
      (t) => t.dependencies.length === 0,
    );
    const dependentTasks = subtasks.filter((t) => t.dependencies.length > 0);

    // Execute independent tasks in parallel
    const independentResults =
      await executionManager.executeParallel(independentTasks);

    // Execute dependent tasks sequentially
    const dependentResults =
      await executionManager.executeSequential(dependentTasks);

    return [...independentResults, ...dependentResults];
  }

  async handleBoomerangTask(request: BoomerangRequest): Promise<TaskResult> {
    const mode = this.modeManager.getModeBySlug(request.targetMode);
    const context = this.contextOptimizer.createContextForSubTask({
      mode: request.targetMode,
      taskDescription: request.task,
      previousResults: [],
      globalContext: {},
      maxTokens: 4000,
    });

    // Execute task in specified mode
    const result = await this.executeInMode(request.task, mode, context);

    return {
      taskId: `boomerang-${Date.now()}`,
      success: true,
      output: result,
      duration: 0,
      tokensUsed: 0,
    };
  }

  async coordinateExecution(subtasks: SubTask[]): Promise<ExecutionPlan> {
    // Analyze dependencies and create execution phases
    const phases = this.createExecutionPhases(subtasks);
    const criticalPath = this.calculateCriticalPath(subtasks);

    return {
      phases,
      dependencies: this.extractDependencies(subtasks),
      estimatedTotalDuration: this.estimateTotalDuration(phases),
      criticalPath,
    };
  }

  // Private helper methods
  private async executeSingleTask(
    taskDescription: string,
    mode: string,
  ): Promise<OrchestrationResult> {
    const task = await this.taskManager.createTask({
      mode,
      message: taskDescription,
    });

    const result = await this.taskManager.executeTask(task.id, async () => ({
      success: true,
      output: `Executed task: ${taskDescription}`,
      tokensUsed: 100,
    }));

    return {
      success: result.success,
      taskId: task.id,
      subtaskResults: [result],
      totalDuration: result.duration || 0,
      totalTokensUsed: result.tokensUsed || 0,
      summary: result.success ? "Task completed successfully" : "Task failed",
    };
  }

  private async generateSubtasks(analysis: TaskAnalysis): Promise<SubTask[]> {
    // Generate subtasks based on analysis
    const subtasks: SubTask[] = [];

    // Create subtasks based on required modes and estimated complexity
    analysis.requiredModes.forEach((mode, index) => {
      subtasks.push({
        id: `subtask-${index + 1}`,
        description: `Implement task using ${mode} mode`,
        mode,
        priority: index + 1,
        dependencies: index > 0 ? [`subtask-${index}`] : [],
        estimatedComplexity: Math.min(
          analysis.complexity / analysis.requiredModes.length,
          10,
        ),
      });
    });

    return subtasks;
  }

  private createDependencyEdges(executionPlan: ExecutionPlan): any {
    // Create dependency graph edges
    return Object.entries(executionPlan.dependencies).map(([task, deps]) => ({
      from: deps,
      to: task,
    }));
  }

  private generateSummary(results: TaskResult[]): string {
    const successful = results.filter((r) => r.success).length;
    const failed = results.length - successful;
    return `Completed ${successful}/${results.length} subtasks. ${failed} failed.`;
  }

  private async executeInMode(
    task: string,
    mode: Mode,
    _context: any,
  ): Promise<string> {
    // Execute task in specified mode
    return `Executed task "${task}" in mode ${mode.slug}`;
  }

  private createExecutionPhases(subtasks: SubTask[]): any[] {
    // Create execution phases based on dependencies
    return [
      {
        phaseId: "phase-1",
        name: "Initial Phase",
        subtasks: subtasks.map((t) => t.id),
        executionType: "parallel",
        estimatedDuration: 60,
      },
    ];
  }

  private calculateCriticalPath(subtasks: SubTask[]): string[] {
    // Calculate critical path through dependencies
    return subtasks.map((t) => t.id);
  }

  private extractDependencies(subtasks: SubTask[]): Record<string, string[]> {
    // Extract dependency mapping
    const deps: Record<string, string[]> = {};
    subtasks.forEach((task) => {
      if (task.dependencies.length > 0) {
        deps[task.id] = task.dependencies;
      }
    });
    return deps;
  }

  private estimateTotalDuration(phases: any[]): number {
    // Estimate total duration based on phases
    return phases.reduce((total, phase) => total + phase.estimatedDuration, 0);
  }
}
