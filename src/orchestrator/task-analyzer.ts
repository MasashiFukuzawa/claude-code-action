import type {
  ComplexityAnalysis,
  JapanesePatterns,
  EnglishPatterns,
  ComplexityIndicators,
  SubTask,
} from "./types";

/**
 * TaskAnalyzer class for analyzing task complexity
 */
export class TaskAnalyzer {
  private _japanesePatterns: JapanesePatterns;
  private _englishPatterns: EnglishPatterns;

  constructor() {
    // Initialize TaskAnalyzer
    this._japanesePatterns = {
      multipleActions: [
        "と.*と",
        "また",
        "さらに",
        "ついでに",
        "合わせて",
        "同時に",
        ".*して.*して",
        ".*と.*を",
      ],
      conditionals: [
        "もし",
        "場合",
        "条件",
        "なら",
        "であれば",
        "ときは",
        "際は",
        "状況",
      ],
      designKeywords: [
        "設計",
        "アーキテクチャ",
        "構造",
        "パターン",
        "フレームワーク",
        "ライブラリ",
        "技術選定",
        "方針",
      ],
      implementKeywords: [
        "実装",
        "コード",
        "関数",
        "メソッド",
        "クラス",
        "コンポーネント",
        "機能",
        "追加",
      ],
    };

    this._englishPatterns = {
      multipleActions: [
        "and.*and",
        "also",
        "additionally",
        "furthermore",
        "moreover",
        "as well as",
        "along with",
        ".*and.*",
      ],
      conditionals: [
        "if",
        "when",
        "unless",
        "provided",
        "assuming",
        "in case",
        "should",
        "depending",
      ],
      designKeywords: [
        "design",
        "architecture",
        "structure",
        "pattern",
        "framework",
        "library",
        "approach",
        "strategy",
      ],
      implementKeywords: [
        "implement",
        "code",
        "function",
        "method",
        "class",
        "component",
        "feature",
        "add",
      ],
    };
  }

  /**
   * Analyze the complexity of a given task
   * @param task - The task description to analyze
   * @returns Analysis result with complexity determination
   */
  analyze(task: string): ComplexityAnalysis {
    const indicators = this.analyzeIndicators(task);
    const score = this.calculateComplexityScore(indicators);
    const isComplex = score > 0.5;

    let reasons: string[] = [];
    if (indicators.hasMultipleActions)
      reasons.push("複数の操作が含まれています");
    if (indicators.hasConditionals) reasons.push("条件分岐が含まれています");
    if (indicators.hasDesignKeywords)
      reasons.push("設計・アーキテクチャ要素が含まれています");
    if (indicators.hasImplementKeywords && indicators.hasTestKeywords) {
      reasons.push("実装とテストの両方が必要です");
    }

    if (reasons.length === 0) {
      reasons.push("シンプルなタスクです");
    }

    const suggestedSubtasks = this.generateSubtasks(task, indicators, isComplex);

    return {
      isComplex,
      confidence: Math.max(Math.min(score * 1.5, 1.0), 0.1),
      reason: reasons.join("、"),
      suggestedSubtasks,
    };
  }

  /**
   * Generate subtasks for complex tasks
   * @param task - Original task description
   * @param indicators - Complexity indicators
   * @param isComplex - Whether the task is complex
   * @returns Array of suggested subtasks
   */
  private generateSubtasks(
    task: string,
    indicators: ComplexityIndicators,
    isComplex: boolean,
  ): SubTask[] {
    // For simple tasks, return empty array
    if (!isComplex) {
      return [];
    }

    const isJapanese = this.detectJapanese(task);
    const subtasks: SubTask[] = [];

    // Add design/architecture subtask if needed
    if (indicators.hasDesignKeywords) {
      subtasks.push({
        mode: "architect",
        description: isJapanese
          ? "設計とアーキテクチャの決定"
          : "Design and architecture decisions",
      });
    }

    // Add implementation subtask if needed
    if (indicators.hasImplementKeywords) {
      subtasks.push({
        mode: "code",
        description: isJapanese ? "実装" : "Implementation",
      });
    }

    // Add test subtask if testing is mentioned or if it's a complex implementation
    if (indicators.hasTestKeywords || (indicators.hasImplementKeywords && isComplex)) {
      subtasks.push({
        mode: "code",
        description: isJapanese ? "テストの作成" : "Test creation",
      });
    }

    return subtasks;
  }

  /**
   * Calculate complexity score based on indicators
   * @param indicators - Complexity indicators
   * @returns Score between 0 and 1
   */
  private calculateComplexityScore(indicators: ComplexityIndicators): number {
    let score = 0;

    if (indicators.hasMultipleActions) score += 0.3;
    if (indicators.hasConditionals) score += 0.2;
    if (indicators.hasDesignKeywords) score += 0.25;
    if (indicators.hasImplementKeywords) score += 0.15;
    if (indicators.hasTestKeywords) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Detect if the given text contains Japanese characters
   * @param text - Text to analyze
   * @returns True if Japanese characters are detected
   */
  private detectJapanese(text: string): boolean {
    // Regular expression to match Japanese characters
    // \u3040-\u309F: Hiragana
    // \u30A0-\u30FF: Katakana
    // \u4E00-\u9FAF: Kanji
    const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    return japanesePattern.test(text);
  }

  /**
   * Public wrapper for testing detectJapanese (temporary)
   * @param text - Text to analyze
   * @returns True if Japanese characters are detected
   */
  public testDetectJapanese(text: string): boolean {
    return this.detectJapanese(text);
  }

  /**
   * Get Japanese patterns (temporary for testing)
   * @returns Japanese patterns object
   */
  public getJapanesePatterns(): JapanesePatterns {
    return this._japanesePatterns;
  }

  /**
   * Get English patterns (temporary for testing)
   * @returns English patterns object
   */
  public getEnglishPatterns(): EnglishPatterns {
    return this._englishPatterns;
  }

  /**
   * Analyze indicators for task complexity
   * @param task - Task description to analyze
   * @returns Complexity indicators
   */
  private analyzeIndicators(task: string): ComplexityIndicators {
    const isJapanese = this.detectJapanese(task);
    const patterns = isJapanese
      ? this._japanesePatterns
      : this._englishPatterns;

    const lowerTask = task.toLowerCase();

    return {
      hasMultipleActions: this.matchPatterns(
        lowerTask,
        patterns.multipleActions || [],
      ),
      hasConditionals: this.matchPatterns(
        lowerTask,
        patterns.conditionals || [],
      ),
      hasDesignKeywords: this.matchPatterns(
        lowerTask,
        patterns.designKeywords || [],
      ),
      hasImplementKeywords: this.matchPatterns(
        lowerTask,
        patterns.implementKeywords || [],
      ),
      hasTestKeywords: this.matchPatterns(lowerTask, [
        "test",
        "テスト",
        "testing",
        "spec",
      ]),
    };
  }

  /**
   * Match patterns against text
   * @param text - Text to match against
   * @param patterns - Patterns to test
   * @returns True if any pattern matches
   */
  private matchPatterns(text: string, patterns: string[]): boolean {
    return patterns.some((pattern) => {
      try {
        const regex = new RegExp(pattern, "i");
        return regex.test(text);
      } catch {
        // If pattern is invalid regex, use simple includes
        return text.includes(pattern.toLowerCase());
      }
    });
  }

  /**
   * Test method for analyzeIndicators (temporary)
   * @param task - Task description to analyze
   * @returns Complexity indicators
   */
  public testAnalyzeIndicators(task: string): ComplexityIndicators {
    return this.analyzeIndicators(task);
  }

  /**
   * Test method for calculateComplexityScore (temporary)
   * @param indicators - Complexity indicators
   * @returns Score between 0 and 1
   */
  public testCalculateComplexityScore(
    indicators: ComplexityIndicators,
  ): number {
    return this.calculateComplexityScore(indicators);
  }
}
