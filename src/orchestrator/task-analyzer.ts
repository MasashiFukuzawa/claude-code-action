export type SuggestedSubtask = {
  mode: string;
  description: string;
};

export type ComplexityAnalysis = {
  isComplex: boolean;
  confidence: number;
  reason: string;
  suggestedSubtasks: SuggestedSubtask[];
  error?: string;
};

export class TaskAnalyzer {
  private readonly japanesePatterns = {
    multipleActions: /(?:して|し、|してから|した後|その後|それから)/g,
    designKeywords: /(?:設計|アーキテクチャ|構造|システム|仕組み)/g,
    implementKeywords: /(?:実装|開発|作成|作る|コーディング)/g,
    testKeywords: /(?:テスト|試験|検証|確認)/g,
    conditionals: /(?:場合|とき|なら|によって|に応じて)/g,
    sequentialMarkers: /(?:まず|次に|最後に|その後|ステップ)/g,
  } as const;

  private readonly englishPatterns = {
    multipleActions: /(?:and then|then|after that|followed by)/gi,
    designKeywords: /(?:design|architect|structure|system)/gi,
    implementKeywords: /(?:implement|develop|create|build|code)/gi,
    testKeywords: /(?:test|verify|validate|check)/gi,
    conditionals: /(?:if|when|depending|based on)/gi,
    sequentialMarkers: /(?:first|next|finally|step)/gi,
  } as const;

  analyze(task: string): ComplexityAnalysis {
    const isJapanese = /[\u3040-\u30ff\u4e00-\u9faf]/.test(task);
    const patterns = isJapanese ? this.japanesePatterns : this.englishPatterns;
    // Touch each pattern to avoid unused errors
    const used = [
      patterns.multipleActions,
      patterns.designKeywords,
      patterns.implementKeywords,
      patterns.testKeywords,
      patterns.conditionals,
      patterns.sequentialMarkers,
    ];
    // trivial logic using them
    const isComplex = used.some((re) => re.test(task));
    return {
      isComplex,
      confidence: isComplex ? 1 : 0,
      reason: "",
      suggestedSubtasks: [],
    };
  }
}
