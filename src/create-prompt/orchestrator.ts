import type { PreparedContext } from "./types";

export async function createOrchestratorPrompt(
  _context: PreparedContext,
  taskDescription: string,
): Promise<string> {
  // 日本語タスクでも英語プロンプトを生成（トークン効率）
  return `
# Orchestrator Mode Execution

You are operating in orchestrator mode. The user has provided a task that may be in Japanese.

Task: ${taskDescription}

## Available Tools

You have access to the following orchestrator-specific tools:
- analyze_complexity: Analyze task complexity (supports Japanese)
- prepare_batch_prompt: Prepare a batch execution prompt for subtasks
- orchestrator_save_state: Save intermediate results
- orchestrator_load_state: Load previously saved results
- update_claude_comment: Update progress (output in Japanese)

## Available Modes

When executing subtasks, you can operate in these modes:
- architect: Design and architecture decisions
- code: Implementation and coding
- debug: Debugging and problem solving
- ask: Clarification and questions
- orchestrator: Task coordination (current mode)

## Execution Flow

1. Analyze the task complexity using analyze_complexity tool
2. If complex, use prepare_batch_prompt and execute all subtasks
3. If simple, execute directly in the appropriate mode
4. Always update progress in Japanese using update_claude_comment

Remember: User communication should be in Japanese.
`;
}
