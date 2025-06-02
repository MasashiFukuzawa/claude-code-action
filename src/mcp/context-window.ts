import type { ContextItem, TokenUsage } from "./orchestration-types";
import { TokenCalculator } from "./token-calculator";

export class ContextWindow {
  private maxTokens: number;
  private content: Map<string, ContextItem>;
  private tokenCalculator: TokenCalculator;

  constructor(maxTokens: number = 4000) {
    this.maxTokens = maxTokens;
    this.content = new Map();
    this.tokenCalculator = new TokenCalculator();
  }

  addContext(key: string, value: any, priority: number = 1): void {
    const tokens = this.tokenCalculator.calculateTokens(value);

    // If a single item exceeds the max tokens, truncate or reject it
    if (tokens > this.maxTokens) {
      // For now, we'll reject items that are too large
      // In practice, you might want to truncate the content
      return;
    }

    // Check if adding would exceed limit
    const existingItem = this.content.get(key);
    const existingTokens = existingItem ? existingItem.tokens : 0;
    const netTokenIncrease = tokens - existingTokens;

    if (this.getCurrentTokens() + netTokenIncrease > this.maxTokens) {
      this.makeSpace(netTokenIncrease);
    }

    this.content.set(key, {
      key,
      value,
      tokens,
      priority,
      timestamp: new Date(),
    });
  }

  removeContext(key: string): void {
    this.content.delete(key);
  }

  getOptimizedContext(): any {
    const context: Record<string, any> = {};

    // Sort by priority (descending) and timestamp (newer first)
    const sortedItems = Array.from(this.content.values()).sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    for (const item of sortedItems) {
      context[item.key] = item.value;
    }

    return context;
  }

  getTokenUsage(): TokenUsage {
    const current = this.getCurrentTokens();
    return {
      current,
      max: this.maxTokens,
      percentage: this.maxTokens > 0 ? (current / this.maxTokens) * 100 : 0,
    };
  }

  getCurrentTokens(): number {
    return Array.from(this.content.values()).reduce(
      (total, item) => total + item.tokens,
      0,
    );
  }

  private makeSpace(requiredTokens: number): void {
    // Sort items by priority (ascending) and timestamp (older first) for removal
    const itemsForRemoval = Array.from(this.content.values()).sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // Lower priority first
      }
      return a.timestamp.getTime() - b.timestamp.getTime(); // Older first
    });

    let tokensToFree = requiredTokens;
    const currentOverage =
      this.getCurrentTokens() + requiredTokens - this.maxTokens;

    if (currentOverage > 0) {
      tokensToFree = Math.max(requiredTokens, currentOverage);
    }

    // Remove items until we have enough space
    for (const item of itemsForRemoval) {
      if (tokensToFree <= 0) break;

      this.content.delete(item.key);
      tokensToFree -= item.tokens;
    }
  }

  clear(): void {
    this.content.clear();
  }

  getItemCount(): number {
    return this.content.size;
  }

  hasContext(key: string): boolean {
    return this.content.has(key);
  }

  getContextItem(key: string): ContextItem | undefined {
    return this.content.get(key);
  }
}
