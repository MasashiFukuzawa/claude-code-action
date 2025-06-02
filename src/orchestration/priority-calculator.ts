import type { ModePriorities, ContextWeights } from "./context-types";

export class PriorityCalculator {
  private modePriorities: Map<string, ModePriorities>;
  private contextWeights: ContextWeights;

  constructor() {
    this.modePriorities = this.initializeModePriorities();
    this.contextWeights = {
      recency: 0.3,
      relevance: 0.4,
      specificity: 0.2,
      actionability: 0.1,
    };
  }

  calculatePriority(info: any, mode: string): number {
    const modePriorities = this.getModePriorities(mode);
    const infoType = this.normalizeInfoType(info.type);

    // Base priority from mode-specific weights
    let basePriority = modePriorities[infoType as keyof ModePriorities] || 0.1;

    // Apply context weights
    const recencyWeight = this.calculateRecencyWeight(info.timestamp);
    const relevanceWeight = this.calculateRelevanceWeight(info, mode);
    const specificityWeight = this.calculateSpecificityWeight(info);
    const actionabilityWeight = this.calculateActionabilityWeight(info, mode);

    const finalPriority =
      basePriority *
      (this.contextWeights.recency * recencyWeight +
        this.contextWeights.relevance * relevanceWeight +
        this.contextWeights.specificity * specificityWeight +
        this.contextWeights.actionability * actionabilityWeight);

    return Math.min(Math.max(finalPriority, 0), 1);
  }

  getModePriorities(mode: string): ModePriorities {
    return this.modePriorities.get(mode) || this.modePriorities.get("code")!;
  }

  rankInformationByPriority(items: any[], mode: string): any[] {
    return items
      .map((item) => ({
        ...item,
        priority: this.calculatePriority(item, mode),
      }))
      .sort((a, b) => b.priority - a.priority);
  }

  updateModePriorities(mode: string, overrides: Partial<ModePriorities>): void {
    const current = this.getModePriorities(mode);
    const updated = { ...current, ...overrides };
    this.modePriorities.set(mode, updated);
  }

  private initializeModePriorities(): Map<string, ModePriorities> {
    const map = new Map<string, ModePriorities>();

    // Code mode priorities
    map.set("code", {
      design_decision: 0.4,
      technical_detail: 0.9,
      dependency_info: 0.7,
      file_change: 0.8,
      error_info: 0.8,
      performance_data: 0.5,
      security_concern: 0.7,
      test_result: 0.6,
    });

    // Architect mode priorities
    map.set("architect", {
      design_decision: 0.9,
      technical_detail: 0.6,
      dependency_info: 0.8,
      file_change: 0.3,
      error_info: 0.4,
      performance_data: 0.7,
      security_concern: 0.8,
      test_result: 0.3,
    });

    // Debug mode priorities
    map.set("debug", {
      design_decision: 0.2,
      technical_detail: 0.7,
      dependency_info: 0.6,
      file_change: 0.5,
      error_info: 0.9,
      performance_data: 0.8,
      security_concern: 0.6,
      test_result: 0.7,
    });

    // Ask mode priorities
    map.set("ask", {
      design_decision: 0.7,
      technical_detail: 0.8,
      dependency_info: 0.6,
      file_change: 0.2,
      error_info: 0.3,
      performance_data: 0.4,
      security_concern: 0.5,
      test_result: 0.4,
    });

    // Orchestrator mode priorities
    map.set("orchestrator", {
      design_decision: 0.8,
      technical_detail: 0.5,
      dependency_info: 0.9,
      file_change: 0.4,
      error_info: 0.6,
      performance_data: 0.6,
      security_concern: 0.7,
      test_result: 0.5,
    });

    return map;
  }

  private normalizeInfoType(type: string): string {
    const typeMapping: Record<string, string> = {
      code_change: "file_change",
      file_modification: "file_change",
      architecture: "design_decision",
      design: "design_decision",
      bug: "error_info",
      exception: "error_info",
      perf: "performance_data",
      benchmark: "performance_data",
      security: "security_concern",
      vulnerability: "security_concern",
      test: "test_result",
      spec: "test_result",
    };

    return typeMapping[type] || type;
  }

  private calculateRecencyWeight(timestamp?: Date): number {
    if (!timestamp) return 0.5; // Default for items without timestamp

    const now = new Date();
    const ageInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

    // More recent = higher weight
    if (ageInHours < 1) return 1.0;
    if (ageInHours < 24) return 0.8;
    if (ageInHours < 168) return 0.6; // 1 week
    return 0.3;
  }

  private calculateRelevanceWeight(info: any, mode: string): number {
    const content = (info.content || "").toLowerCase();
    const modeKeywords = this.getModeKeywords(mode);

    let relevanceScore = 0;
    for (const keyword of modeKeywords) {
      if (content.includes(keyword.toLowerCase())) {
        relevanceScore += 0.1;
      }
    }

    return Math.min(relevanceScore, 1.0);
  }

  private calculateSpecificityWeight(info: any): number {
    const content = info.content || "";

    // More specific content has higher weight
    const hasNumbers = /\d/.test(content);
    const hasFileNames = /\.[a-z]{2,4}/.test(content);
    const hasSpecificTerms =
      /\b(function|class|variable|method|component)\b/i.test(content);

    let specificity = 0.3; // Base specificity
    if (hasNumbers) specificity += 0.2;
    if (hasFileNames) specificity += 0.3;
    if (hasSpecificTerms) specificity += 0.2;

    return Math.min(specificity, 1.0);
  }

  private calculateActionabilityWeight(info: any, mode: string): number {
    const content = (info.content || "").toLowerCase();

    // Different modes have different actionability indicators
    const actionableIndicators = this.getActionableIndicators(mode);

    let actionabilityScore = 0.2; // Base score
    for (const indicator of actionableIndicators) {
      if (content.includes(indicator)) {
        actionabilityScore += 0.2;
      }
    }

    return Math.min(actionabilityScore, 1.0);
  }

  private getModeKeywords(mode: string): string[] {
    const keywordMap: Record<string, string[]> = {
      code: ["implement", "function", "class", "method", "algorithm", "code"],
      architect: ["design", "architecture", "pattern", "structure", "system"],
      debug: ["error", "bug", "exception", "fix", "problem", "issue"],
      ask: ["explain", "how", "what", "why", "documentation", "guide"],
      orchestrator: ["coordinate", "manage", "organize", "workflow", "process"],
    };

    return keywordMap[mode] || [];
  }

  private getActionableIndicators(mode: string): string[] {
    const indicatorMap: Record<string, string[]> = {
      code: ["todo", "implement", "fix", "update", "create"],
      architect: ["design", "plan", "decide", "choose", "define"],
      debug: ["investigate", "reproduce", "fix", "test", "verify"],
      ask: ["research", "document", "explain", "clarify", "define"],
      orchestrator: [
        "coordinate",
        "assign",
        "delegate",
        "schedule",
        "prioritize",
      ],
    };

    return indicatorMap[mode] || [];
  }
}
