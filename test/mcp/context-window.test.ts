import { describe, test, expect, beforeEach } from "bun:test";
import { ContextWindow } from "../../src/mcp/context-window";

describe("ContextWindow", () => {
  let contextWindow: ContextWindow;

  beforeEach(() => {
    contextWindow = new ContextWindow(1000); // 1000 token limit
  });

  test("should initialize with correct token limit", () => {
    const usage = contextWindow.getTokenUsage();
    expect(usage.max).toBe(1000);
    expect(usage.current).toBe(0);
    expect(usage.percentage).toBe(0);
  });

  test("should add context item within token limit", () => {
    contextWindow.addContext("test", "Hello, world!", 5);

    const usage = contextWindow.getTokenUsage();
    expect(usage.current).toBeGreaterThan(0);
    expect(usage.current).toBeLessThanOrEqual(1000);
    expect(usage.percentage).toBeGreaterThan(0);
  });

  test("should return optimized context in priority order", () => {
    contextWindow.addContext("low", "low priority content", 1);
    contextWindow.addContext("high", "high priority content", 10);
    contextWindow.addContext("medium", "medium priority content", 5);

    const optimized = contextWindow.getOptimizedContext();
    const keys = Object.keys(optimized);

    // High priority should come first
    expect(keys[0]).toBe("high");
    expect(optimized.high).toBe("high priority content");
  });

  test("should remove context items", () => {
    contextWindow.addContext("test", "content", 5);
    expect(contextWindow.getTokenUsage().current).toBeGreaterThan(0);

    contextWindow.removeContext("test");
    expect(contextWindow.getTokenUsage().current).toBe(0);
  });

  test("should make space when adding would exceed limit", () => {
    // Fill almost to capacity with low-priority items
    const largeContent = "Large content ".repeat(100);
    contextWindow.addContext("low1", largeContent, 1);
    contextWindow.addContext("low2", largeContent, 1);

    // Add high-priority item that might cause eviction
    contextWindow.addContext("important", "Critical data", 10);

    const usageAfterHigh = contextWindow.getTokenUsage();
    expect(usageAfterHigh.current).toBeLessThanOrEqual(1000);

    const optimized = contextWindow.getOptimizedContext();
    expect(optimized).toHaveProperty("important");
  });

  test("should sort by timestamp when priorities are equal", async () => {
    // Add items with same priority but different timestamps
    contextWindow.addContext("first", "first content", 5);

    // Small delay to ensure different timestamp
    await new Promise((resolve) => setTimeout(resolve, 1));

    contextWindow.addContext("second", "second content", 5);

    const optimized = contextWindow.getOptimizedContext();
    const keys = Object.keys(optimized);

    // More recent (second) should come first when priorities are equal
    expect(keys[0]).toBe("second");
  });

  test("should handle empty context window", () => {
    const usage = contextWindow.getTokenUsage();
    const optimized = contextWindow.getOptimizedContext();

    expect(usage.current).toBe(0);
    expect(usage.percentage).toBe(0);
    expect(Object.keys(optimized).length).toBe(0);
  });

  test("should calculate token usage correctly", () => {
    const testContent = "test content";
    contextWindow.addContext("test", testContent, 5);

    const usage = contextWindow.getTokenUsage();
    expect(usage.percentage).toBe((usage.current / usage.max) * 100);
    expect(usage.percentage).toBeGreaterThan(0);
    expect(usage.percentage).toBeLessThanOrEqual(100);
  });

  test("should update context items with same key", () => {
    contextWindow.addContext("key", "original content", 5);

    contextWindow.addContext("key", "updated content", 8);
    const newUsage = contextWindow.getTokenUsage();

    const optimized = contextWindow.getOptimizedContext();
    expect(optimized.key).toBe("updated content");

    // Usage should be updated (may be different due to content change)
    expect(newUsage.current).toBeGreaterThan(0);
  });

  test("should handle very large context that exceeds limit", () => {
    const veryLargeContent = "Very large content ".repeat(1000);

    contextWindow.addContext("huge", veryLargeContent, 1);

    const usage = contextWindow.getTokenUsage();
    // Should reject the item since it's too large, so usage should remain 0
    expect(usage.current).toBe(0);
  });

  test("should preserve high-priority items when making space", () => {
    // Add high-priority item first
    contextWindow.addContext("critical", "Critical information", 100);

    // Try to add many low-priority items
    for (let i = 0; i < 10; i++) {
      contextWindow.addContext(
        `low${i}`,
        "Low priority content ".repeat(50),
        1,
      );
    }

    const optimized = contextWindow.getOptimizedContext();
    expect(optimized).toHaveProperty("critical");
    expect(optimized.critical).toBe("Critical information");
  });
});
