import type { TaskAnalysis, SubTask } from "./types";

export class SubtaskGenerator {
  generateSubtasks(analysis: TaskAnalysis): SubTask[] {
    const subtasks: SubTask[] = [];

    if (!analysis.requiresOrchestration) {
      // Simple task - create single subtask
      return [
        {
          id: "simple-task-1",
          description: "Execute simple task",
          mode: analysis.requiredModes[0] || "code",
          priority: 1,
          dependencies: [],
          estimatedComplexity: analysis.complexity,
        },
      ];
    }

    // Complex task - generate multiple subtasks based on required modes
    analysis.requiredModes.forEach((mode, index) => {
      const subtask: SubTask = {
        id: `subtask-${index + 1}`,
        description: this.generateSubtaskDescription(mode, analysis),
        mode,
        priority: index + 1,
        dependencies: index > 0 ? [`subtask-${index}`] : [],
        estimatedComplexity: Math.min(
          Math.floor(analysis.complexity / analysis.requiredModes.length),
          10,
        ),
      };

      subtasks.push(subtask);
    });

    // Add integration subtask if multiple modes are required
    if (analysis.requiredModes.length > 1) {
      subtasks.push({
        id: `integration-${analysis.requiredModes.length + 1}`,
        description: "Integrate and test all components",
        mode: "code",
        priority: analysis.requiredModes.length + 1,
        dependencies: subtasks.map((st) => st.id),
        estimatedComplexity: 3,
      });
    }

    return subtasks;
  }

  private generateSubtaskDescription(
    mode: string,
    analysis: TaskAnalysis,
  ): string {
    const baseDescription = analysis.suggestedApproach || "Complete the task";

    switch (mode) {
      case "architect":
        return `Design architecture and system structure for: ${baseDescription}`;
      case "code":
        return `Implement code solution for: ${baseDescription}`;
      case "debug":
        return `Debug and troubleshoot issues in: ${baseDescription}`;
      case "ask":
        return `Research and gather information about: ${baseDescription}`;
      case "orchestrator":
        return `Coordinate and manage execution of: ${baseDescription}`;
      default:
        return `Execute task in ${mode} mode: ${baseDescription}`;
    }
  }
}
