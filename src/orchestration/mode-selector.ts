import { modeManager } from "../modes";
import type { ModeSelectionRule } from "./types";

export class ModeSelector {
  private selectionRules: ModeSelectionRule[];

  constructor() {
    this.selectionRules = this.initializeSelectionRules();
  }

  selectOptimalMode(subtask: string): string {
    let bestMatch = { mode: "code", score: 0 };

    // Evaluate each available mode
    const availableModes = modeManager.getAllModes();
    for (const mode of availableModes) {
      const score = this.evaluateModeMatch(subtask, mode.slug);
      if (score > bestMatch.score) {
        bestMatch = { mode: mode.slug, score };
      }
    }

    return bestMatch.mode;
  }

  evaluateModeMatch(task: string, mode: string): number {
    const lowerTask = task.toLowerCase();
    let score = 0;

    // Get mode-specific keywords and calculate match score
    const modeKeywords = this.getModeKeywords(mode);
    for (const keyword of modeKeywords) {
      if (lowerTask.includes(keyword.toLowerCase())) {
        score += keyword.length * 0.1; // Longer keywords = better match
      }
    }

    // Apply rule-based scoring
    for (const rule of this.selectionRules) {
      if (rule.mode === mode && rule.pattern.test(task)) {
        score += rule.priority;
      }
    }

    return score;
  }

  getModeCapabilities(mode: string): string[] {
    const capabilityMap: Record<string, string[]> = {
      code: [
        "implementation",
        "coding",
        "development",
        "programming",
        "feature creation",
        "component building",
        "algorithm implementation",
      ],
      architect: [
        "design",
        "planning",
        "architecture",
        "system design",
        "high-level planning",
        "technical specifications",
        "blueprints",
      ],
      debug: [
        "troubleshooting",
        "bug fixing",
        "problem solving",
        "diagnostics",
        "error resolution",
        "performance analysis",
        "investigation",
      ],
      ask: [
        "information",
        "explanation",
        "documentation",
        "guidance",
        "knowledge sharing",
        "clarification",
        "educational content",
      ],
      orchestrator: [
        "task coordination",
        "workflow management",
        "delegation",
        "complex task breakdown",
        "multi-mode coordination",
      ],
    };

    return capabilityMap[mode] || [];
  }

  private initializeSelectionRules(): ModeSelectionRule[] {
    return [
      // Architect mode rules
      {
        pattern:
          /\b(design|architecture|plan|blueprint|structure|schema|strategy)\b/i,
        mode: "architect",
        priority: 3,
      },
      {
        pattern: /\b(high-level|overview|system design|architectural)\b/i,
        mode: "architect",
        priority: 2,
      },

      // Code mode rules
      {
        pattern: /\b(implement|code|develop|build|create|write)\b/i,
        mode: "code",
        priority: 3,
      },
      {
        pattern: /\b(function|method|class|component|feature|api|endpoint)\b/i,
        mode: "code",
        priority: 2,
      },

      // Debug mode rules
      {
        pattern: /\b(fix|bug|error|issue|problem|debug|troubleshoot)\b/i,
        mode: "debug",
        priority: 3,
      },
      {
        pattern: /\b(resolve|investigate|diagnose|repair|performance)\b/i,
        mode: "debug",
        priority: 2,
      },

      // Ask mode rules
      {
        pattern: /\b(explain|how|what|why|when|where|documentation)\b/i,
        mode: "ask",
        priority: 4,
      },
      {
        pattern: /\b(understand|clarify|describe|help me|tell me)\b/i,
        mode: "ask",
        priority: 3,
      },
      {
        pattern: /\?/,
        mode: "ask",
        priority: 3,
      },

      // Orchestrator mode rules
      {
        pattern: /\b(complete|entire|full|comprehensive|end-to-end)\b/i,
        mode: "orchestrator",
        priority: 2,
      },
      {
        pattern: /\b(multiple|several|various|different|across)\b/i,
        mode: "orchestrator",
        priority: 1,
      },
    ];
  }

  private getModeKeywords(mode: string): string[] {
    const keywordMap: Record<string, string[]> = {
      architect: [
        "design",
        "architecture",
        "plan",
        "blueprint",
        "structure",
        "schema",
        "strategy",
        "high-level",
        "overview",
        "system design",
        "planning",
      ],
      code: [
        "implement",
        "code",
        "develop",
        "build",
        "create",
        "write",
        "function",
        "method",
        "class",
        "component",
        "feature",
        "api",
        "endpoint",
        "algorithm",
      ],
      debug: [
        "fix",
        "bug",
        "error",
        "issue",
        "problem",
        "debug",
        "troubleshoot",
        "resolve",
        "investigate",
        "diagnose",
        "repair",
        "performance",
      ],
      ask: [
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
        "help",
        "tell",
        "guide",
      ],
      orchestrator: [
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
        "coordinate",
      ],
    };

    return keywordMap[mode] || [];
  }
}
