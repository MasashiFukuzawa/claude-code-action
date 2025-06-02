import type { ParsedGitHubContext } from "../context";
import type {
  TaskInfo,
  ProgressUpdate,
  OrchestrationResult,
} from "./orchestration-types";

export class ProgressTracker {
  private githubContext: ParsedGitHubContext;
  private commentUpdater?: (content: string) => void;
  private lastComment: string = "";

  constructor(context: ParsedGitHubContext) {
    this.githubContext = context;
  }

  async createInitialComment(taskInfo: TaskInfo): Promise<string> {
    const content = `## 🤖 Orchestrating Task: ${taskInfo.title}

### Task Information
- **ID**: ${taskInfo.id}
- **Issue**: #${taskInfo.issueNumber}
- **Repository**: ${taskInfo.repository.owner}/${taskInfo.repository.name}

### Description
${taskInfo.description}

### Progress
🔄 **Status**: Initializing orchestration...

---
*This comment will be updated with progress*`;

    this.lastComment = content;
    if (this.commentUpdater) {
      this.commentUpdater(content);
    }
    return content;
  }

  async updateProgress(taskId: string, progress: ProgressUpdate): Promise<void> {
    const statusEmoji = this.getStatusEmoji(progress.status);
    const progressBar = this.createProgressBar(progress.percentComplete);

    const updateContent = `### Task Progress Update

**Task ID**: ${taskId}
**Status**: ${statusEmoji} ${progress.status}
**Progress**: ${progressBar} ${progress.percentComplete}%

${progress.currentStep ? `**Current Step**: ${progress.currentStep}` : ""}
${progress.estimatedTimeRemaining ? `**Estimated Time Remaining**: ${progress.estimatedTimeRemaining} seconds` : ""}

---
*Updated at ${new Date().toISOString()}*`;

    this.lastComment = updateContent;
    if (this.commentUpdater) {
      this.commentUpdater(updateContent);
    }
  }

  async finalizeComment(result: OrchestrationResult): Promise<void> {
    const statusEmoji = result.success ? "✅" : "❌";
    const summary = `## ${statusEmoji} Orchestration ${result.success ? "Completed" : "Failed"}

### Summary
${result.summary}

### Results
- **Total Duration**: ${result.totalDuration}ms
- **Total Tokens Used**: ${result.totalTokensUsed}
- **Subtasks Completed**: ${result.subtaskResults.filter((r) => r.success).length}/${result.subtaskResults.length}

### Subtask Details
${result.subtaskResults
  .map(
    (task) =>
      `- ${task.success ? "✅" : "❌"} **${task.taskId}**: ${task.output || "No output"}`,
  )
  .join("\n")}

${result.errors && result.errors.length > 0 ? `### Errors\n${result.errors.map((e) => `- ❌ ${e}`).join("\n")}` : ""}

---
*Orchestration completed at ${new Date().toISOString()}*`;

    this.lastComment = summary;
    if (this.commentUpdater) {
      this.commentUpdater(summary);
    }
  }

  async updateWithError(errorMessage: string): Promise<void> {
    const content = `## ❌ Orchestration Error

${errorMessage}

---
*Error occurred at ${new Date().toISOString()}*`;

    this.lastComment = content;
    if (this.commentUpdater) {
      this.commentUpdater(content);
    }
  }

  setCommentUpdater(updater: (content: string) => void): void {
    this.commentUpdater = updater;
  }

  getLastComment(): string {
    return this.lastComment;
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case "pending":
        return "⏳";
      case "in_progress":
        return "🔄";
      case "completed":
        return "✅";
      case "failed":
        return "❌";
      default:
        return "❓";
    }
  }

  private createProgressBar(percent: number): string {
    const totalBars = 20;
    const filledBars = Math.round((percent / 100) * totalBars);
    const emptyBars = totalBars - filledBars;
    return "█".repeat(filledBars) + "░".repeat(emptyBars);
  }
}