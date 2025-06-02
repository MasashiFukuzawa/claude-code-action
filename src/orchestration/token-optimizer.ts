import type { CompressionStrategy, OptimizationResult } from "./context-types";

interface TokenCounter {
  count(text: string): number;
}

export class TokenOptimizer {
  private tokenCounter: TokenCounter;
  private compressionStrategies: CompressionStrategy[];

  constructor() {
    this.tokenCounter = new SimpleTokenCounter();
    this.compressionStrategies = this.initializeCompressionStrategies();
  }

  optimizeForTokenLimit(content: any, limit: number): any {
    if (!content || limit <= 0) {
      return content;
    }

    const currentTokens = this.calculateContentTokens(content);
    if (currentTokens <= limit) {
      return content;
    }

    // Apply optimization strategies in order of effectiveness
    let optimizedContent = content;

    // 1. Remove low priority items first
    optimizedContent = this.removeLowPriorityItems(optimizedContent, limit);

    // 2. Compress verbose content
    optimizedContent = this.compressVerboseContent(optimizedContent, limit);

    // 3. Apply summarization
    optimizedContent = this.applySummarization(optimizedContent, limit);

    return optimizedContent;
  }

  calculateTokenCount(content: string): number {
    if (!content) return 0;
    return this.tokenCounter.count(content);
  }

  prioritizeContent(content: any[], priorities: number[]): any[] {
    if (content.length !== priorities.length) {
      return content;
    }

    const indexed = content.map((item, index) => ({
      item,
      priority: priorities[index],
      index,
    }));

    return indexed
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .map(({ item }) => item);
  }

  compressContent(content: string, targetRatio: number): string {
    if (!content || targetRatio >= 1) {
      return content;
    }

    const targetLength = Math.floor(content.length * targetRatio);

    // Extract key sentences and phrases
    const sentences = this.extractSentences(content);
    const keyPhrases = this.extractKeyPhrases(content);

    // Rank sentences by importance
    const rankedSentences = this.rankSentencesByImportance(
      sentences,
      keyPhrases,
    );

    // Select sentences until we reach target length
    let compressedLength = 0;
    const selectedSentences: string[] = [];

    for (const sentence of rankedSentences) {
      if (compressedLength + sentence.length <= targetLength) {
        selectedSentences.push(sentence);
        compressedLength += sentence.length;
      } else {
        break;
      }
    }

    return selectedSentences.join(" ").trim();
  }

  generateOptimizationReport(
    original: any,
    optimized: any,
  ): OptimizationResult {
    const originalTokens = this.calculateContentTokens(original);
    const optimizedTokens = this.calculateContentTokens(optimized);
    const reductionRatio = (originalTokens - optimizedTokens) / originalTokens;

    return {
      originalTokens,
      optimizedTokens,
      reductionRatio,
      preservedInfo: [], // TODO: Track preserved information
      removedInfo: [], // TODO: Track removed information
      optimizationStrategies: [], // TODO: Track applied strategies
    };
  }

  private calculateContentTokens(content: any): number {
    if (typeof content === "string") {
      return this.calculateTokenCount(content);
    }

    if (Array.isArray(content)) {
      return content.reduce(
        (total: number, item) => total + this.calculateContentTokens(item),
        0,
      );
    }

    if (typeof content === "object" && content !== null) {
      return Object.values(content).reduce(
        (total: number, value) => total + this.calculateContentTokens(value),
        0,
      );
    }

    return 0;
  }

  private removeLowPriorityItems(content: any, limit: number): any {
    if (
      Array.isArray(content) &&
      content.length > 0 &&
      typeof content[0] === "object"
    ) {
      // If content has priority information, filter by priority
      const sortedByPriority = content
        .filter((item) => item.priority !== undefined)
        .sort((a, b) => b.priority - a.priority);

      const result = [];
      let currentTokens = 0;

      for (const item of sortedByPriority) {
        const itemTokens = this.calculateContentTokens(item);
        if (currentTokens + itemTokens <= limit) {
          result.push(item);
          currentTokens += itemTokens;
        }
      }

      return result;
    }

    return content;
  }

  private compressVerboseContent(content: any, limit: number): any {
    if (typeof content === "string") {
      const currentTokens = this.calculateTokenCount(content);
      if (currentTokens > limit) {
        const targetRatio = limit / currentTokens;
        return this.compressContent(content, targetRatio);
      }
    }

    if (typeof content === "object" && content !== null) {
      const compressed: any = {};
      for (const [key, value] of Object.entries(content)) {
        compressed[key] = this.compressVerboseContent(
          value,
          Math.floor(limit * 0.3),
        );
      }
      return compressed;
    }

    return content;
  }

  private applySummarization(content: any, limit: number): any {
    // Apply summarization strategies
    for (const strategy of this.compressionStrategies) {
      if (this.calculateContentTokens(content) <= limit) {
        break;
      }
      content = this.applyCompressionStrategy(content, strategy);
    }

    return content;
  }

  private extractSentences(content: string): string[] {
    return content
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  private extractKeyPhrases(content: string): string[] {
    // Simple key phrase extraction
    const keywords = [
      "implement",
      "create",
      "design",
      "fix",
      "error",
      "function",
      "component",
      "service",
      "authentication",
      "database",
      "api",
      "security",
      "performance",
      "test",
      "user",
      "system",
      "jwt",
      "password",
      "token",
      "email",
      "login",
      "secure",
    ];

    return keywords.filter((keyword) =>
      content.toLowerCase().includes(keyword.toLowerCase()),
    );
  }

  private rankSentencesByImportance(
    sentences: string[],
    keyPhrases: string[],
  ): string[] {
    return sentences
      .map((sentence) => ({
        sentence,
        score: this.calculateSentenceScore(sentence, keyPhrases),
      }))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.sentence);
  }

  private calculateSentenceScore(
    sentence: string,
    keyPhrases: string[],
  ): number {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();

    // Score based on key phrase presence (higher weight for important phrases)
    for (const phrase of keyPhrases) {
      if (lowerSentence.includes(phrase.toLowerCase())) {
        // Give higher scores to security/auth related terms
        if (
          ["jwt", "authentication", "password", "secure", "token"].includes(
            phrase.toLowerCase(),
          )
        ) {
          score += 3;
        } else {
          score += 1;
        }
      }
    }

    // Bonus for sentences with numbers (often specific)
    if (/\d/.test(sentence)) {
      score += 0.5;
    }

    // Bonus for sentences with technical terms
    if (
      /\b(function|class|method|api|database|component|authentication|jwt|password|token)\b/i.test(
        sentence,
      )
    ) {
      score += 0.8;
    }

    // Penalty for very short sentences
    if (sentence.length < 20) {
      score *= 0.5;
    }

    return score;
  }

  private applyCompressionStrategy(
    content: any,
    strategy: CompressionStrategy,
  ): any {
    // Apply specific compression strategies
    switch (strategy.algorithm) {
      case "summarize":
        return this.summarizeContent(content, strategy);
      case "extract_key_points":
        return this.extractKeyPoints(content, strategy);
      case "deduplicate":
        return this.deduplicateContent(content, strategy);
      default:
        return content;
    }
  }

  private summarizeContent(content: any, strategy: CompressionStrategy): any {
    if (typeof content === "string") {
      return this.compressContent(content, strategy.compressionRatio);
    }
    return content;
  }

  private extractKeyPoints(content: any, strategy: CompressionStrategy): any {
    if (typeof content === "string") {
      const sentences = this.extractSentences(content);
      const keyPhrases = strategy.preserveKeywords;

      const importantSentences = sentences.filter((sentence) =>
        keyPhrases.some((keyword) =>
          sentence.toLowerCase().includes(keyword.toLowerCase()),
        ),
      );

      return importantSentences
        .slice(0, Math.ceil(sentences.length * strategy.compressionRatio))
        .join(". ");
    }
    return content;
  }

  private deduplicateContent(
    content: any,
    _strategy: CompressionStrategy,
  ): any {
    if (Array.isArray(content)) {
      const seen = new Set();
      return content.filter((item) => {
        const key = JSON.stringify(item);
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    }
    return content;
  }

  private initializeCompressionStrategies(): CompressionStrategy[] {
    return [
      {
        name: "remove_duplicates",
        applicableTypes: ["all"],
        compressionRatio: 0.9,
        preserveKeywords: [],
        algorithm: "deduplicate",
      },
      {
        name: "summarize_verbose",
        applicableTypes: ["design_decision", "technical_detail"],
        compressionRatio: 0.6,
        preserveKeywords: ["important", "critical", "key", "main"],
        algorithm: "summarize",
      },
      {
        name: "extract_error_essentials",
        applicableTypes: ["error_info"],
        compressionRatio: 0.4,
        preserveKeywords: ["error", "exception", "failed", "critical"],
        algorithm: "extract_key_points",
      },
    ];
  }
}

// Simple token counter implementation
class SimpleTokenCounter implements TokenCounter {
  count(text: string): number {
    if (!text) return 0;

    // Rough approximation: ~4 characters per token for English text
    // This is a simplified approach; in production, use a proper tokenizer
    const words = text.trim().split(/\s+/).length;
    const chars = text.length;

    // Estimate tokens based on word count and character count
    return Math.ceil(Math.max(words * 0.75, chars / 4));
  }
}
