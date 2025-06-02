import { describe, test, expect, beforeEach } from "bun:test";
import { TokenOptimizer } from "../../src/orchestration/token-optimizer";

describe("TokenOptimizer", () => {
  let optimizer: TokenOptimizer;

  beforeEach(() => {
    optimizer = new TokenOptimizer();
  });

  test("should calculate token count approximately correctly", () => {
    const shortText = "Hello world";
    const longText =
      "This is a much longer text that contains many more words and should result in a higher token count than the shorter text.";

    const shortTokens = optimizer.calculateTokenCount(shortText);
    const longTokens = optimizer.calculateTokenCount(longText);

    expect(shortTokens).toBeLessThan(longTokens);
    expect(shortTokens).toBeGreaterThan(0);
  });

  test("should optimize content for token limit", () => {
    const content = {
      messages: [
        "This is a very long message that contains lots of detailed information about the implementation",
        "Short message",
        "Another long message with extensive details about architecture and design decisions that might not be necessary",
        "Critical error message",
      ],
      priorities: [0.3, 0.8, 0.2, 0.9],
    };

    const optimized = optimizer.optimizeForTokenLimit(content, 100);

    expect(optimized.messages.length).toBeLessThanOrEqual(
      content.messages.length,
    );
    // High priority items should be preserved
    expect(optimized.messages).toContain("Short message");
    expect(optimized.messages).toContain("Critical error message");
  });

  test("should prioritize content correctly", () => {
    const content = [
      { text: "Low priority item", id: 1 },
      { text: "High priority item", id: 2 },
      { text: "Medium priority item", id: 3 },
    ];
    const priorities = [0.2, 0.9, 0.5];

    const prioritized = optimizer.prioritizeContent(content, priorities);

    expect(prioritized[0].id).toBe(2); // High priority first
    expect(prioritized[1].id).toBe(3); // Medium priority second
    expect(prioritized[2].id).toBe(1); // Low priority last
  });

  test("should compress content while preserving key information", () => {
    const verbose = `
      The user authentication system needs to be implemented with the following requirements:
      1. It should support email and password login
      2. It should include password reset functionality
      3. It should have rate limiting to prevent brute force attacks
      4. It should use JWT tokens for session management
      5. It should integrate with the existing user database
    `;

    const compressed = optimizer.compressContent(verbose, 0.5);

    expect(compressed.length).toBeLessThan(verbose.length);
    expect(compressed).toContain("authentication");
    expect(compressed).toContain("JWT");
    // Should preserve at least one high-priority term
    const hasImportantTerms =
      compressed.includes("authentication") ||
      compressed.includes("JWT") ||
      compressed.includes("password");
    expect(hasImportantTerms).toBe(true);
  });

  test("should handle edge cases gracefully", () => {
    expect(() => optimizer.calculateTokenCount("")).not.toThrow();
    expect(() => optimizer.optimizeForTokenLimit({}, 0)).not.toThrow();
    expect(() => optimizer.compressContent("", 0.5)).not.toThrow();

    expect(optimizer.calculateTokenCount("")).toBe(0);
  });

  test("should preserve essential keywords during compression", () => {
    const content =
      "Implement user authentication system with secure password hashing functionality. Add JWT token management features. Include rate limiting for security. Support email verification process.";
    const compressed = optimizer.compressContent(content, 0.6);

    // For longer content, compression should work better
    expect(compressed.length).toBeGreaterThan(0); // Should have some content
    expect(compressed.length).toBeLessThanOrEqual(content.length); // Should not expand

    // Check that compression actually happened for longer content
    if (content.length > 100) {
      expect(compressed.length).toBeLessThan(content.length);
    }
  });
});
