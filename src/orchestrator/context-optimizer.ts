import type { ContextOptimizationResult } from "./types";

export class ContextOptimizer {
  /**
   * Optimizes the given context by applying various optimization techniques.
   * @param context The context string to optimize
   * @returns ContextOptimizationResult object with optimized content and metadata
   */
  optimize(context: string): ContextOptimizationResult {
    // Step 1: Split text into sentences
    const sentences = this.splitIntoSentences(context);

    // Step 2: Calculate importance scores
    const sentenceScores = this.calculateImportanceScores(sentences);

    // Step 3: Sort by score and extract top sentences
    const sortedSentences = [...sentenceScores].sort(
      (a, b) => b.score - a.score,
    );

    // Target 50% compression
    const targetCount = Math.ceil(sentences.length * 0.5);
    const topSentences = sortedSentences
      .slice(0, targetCount)
      .map((item) => item.sentence);

    // Step 4: Reconstruct optimized context
    const optimizedContext = topSentences.join(" ");
    const reductionPercentage = Math.round(
      (1 - optimizedContext.length / context.length) * 100,
    );

    return {
      optimizedContext,
      reductionPercentage,
      summary: `Compressed from ${sentences.length} to ${targetCount} sentences`,
      detectedLanguage: "unknown", // Will be updated in future tasks
    };
  }

  /**
   * Splits text into sentences using basic punctuation.
   * @param text The text to split
   * @returns Array of sentences
   */
  private splitIntoSentences(text: string): string[] {
    // より高度な文分割ロジック
    return text
      .replace(/(\s)([A-Z]\.\s?[A-Z]\.)/g, "$1_abbr_$2") // 省略形を一時的にマスク
      .split(/(?<!\b\w\.\w.)(?<!\b[A-Z][a-z]\.)(?<=\.|\?|\!)\s+/)
      .map((sentence) =>
        sentence
          .replace(/_abbr_([A-Z]\.\s?[A-Z]\.)/g, "$1") // 省略形を復元
          .trim(),
      )
      .filter(Boolean);
  }

  /**
   * Calculates importance scores for sentences (TF-IDF placeholder).
   * Currently uses simple word frequency as a placeholder.
   * @param sentences Array of sentences
   * @returns Array of {sentence, score} objects
   */
  private calculateImportanceScores(
    sentences: string[],
  ): { sentence: string; score: number }[] {
    // Enhanced scoring with rare word emphasis and stop words exclusion
    const documentFrequency: Record<string, number> = {};
    const stopWords = new Set([
      "the",
      "and",
      "or",
      "is",
      "in",
      "it",
      "to",
      "a",
      "an",
      "of",
      "this",
      "that",
      "with",
      "for",
      "on",
      "at",
      "by",
    ]);
    const totalSentences = sentences.length;

    // First pass: count sentence frequency for each term (skip stop words)
    sentences.forEach((sentence) => {
      const terms = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      const uniqueTerms = new Set(terms.filter((term) => !stopWords.has(term)));

      uniqueTerms.forEach((term) => {
        documentFrequency[term] = (documentFrequency[term] || 0) + 1;
      });
    });

    // Second pass: score sentences
    return sentences.map((sentence) => {
      const terms = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      const termFrequency: Record<string, number> = {};

      // Count term frequency in this sentence (skip stop words)
      terms.forEach((term) => {
        if (!stopWords.has(term)) {
          termFrequency[term] = (termFrequency[term] || 0) + 1;
        }
      });

      // Calculate TF-IDF score with rare word emphasis
      let score = 0;
      Object.entries(termFrequency).forEach(([term, freq]) => {
        const idf = Math.log(totalSentences / (documentFrequency[term] || 1));
        const weight = documentFrequency[term] === 1 ? 10 : 1;
        score += freq * idf * weight;
      });

      return { sentence, score };
    });
  }
}
