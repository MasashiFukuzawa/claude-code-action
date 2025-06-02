export class TokenCalculator {
  calculateTokens(value: any): number {
    // Simple token calculation based on string representation
    // In practice, this would use a proper tokenizer like tiktoken
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);

    // Rough approximation: 4 characters = 1 token
    return Math.max(1, Math.floor(stringValue.length / 4));
  }

  calculateTokensFromString(text: string): number {
    // Simple token estimation for strings
    // This is a rough approximation and should be replaced with a proper tokenizer
    return Math.max(1, Math.floor(text.length / 4));
  }

  estimateTokensFromWords(wordCount: number): number {
    // Rough estimation: 1.3 tokens per word on average
    return Math.max(1, Math.floor(wordCount * 1.3));
  }
}
