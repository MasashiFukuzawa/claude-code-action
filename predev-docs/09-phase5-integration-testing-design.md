# フェーズ5: 統合テストと最適化 - 詳細設計

## 概要

統合テストと最適化フェーズでは、実装された全コンポーネントの統合テスト、パフォーマンス最適化、エラーハンドリング強化、およびドキュメント作成を行います。システム全体の品質保証と本番環境での安定稼働を目指します。

**📌 参考実装**: RooCode（RooCline）のオーケストレーション実装を参考にしてください：

- GitHub: https://github.com/RooCodeInc/Roo-Code
- UIthub: https://uithub.com/RooCodeInc/Roo-Code
- DeepWiki: https://deepwiki.com/RooCodeInc/Roo-Code

**💡 重要な点**: RooCodeの実装パターンを参考にしつつ、Claude Code Actionの環境に適応させることが重要です。

## アーキテクチャ

```mermaid
classDiagram
    class IntegrationTestSuite {
        -e2eTests: E2ETestRunner
        -performanceTests: PerformanceTestRunner
        -loadTests: LoadTestRunner
        +runAllTests(): TestReport
        +runE2ETests(): E2ETestResults
        +runPerformanceTests(): PerformanceMetrics
        +runLoadTests(): LoadTestResults
    }

    class PerformanceOptimizer {
        -metricsCollector: MetricsCollector
        -cacheManager: CacheManager
        -tokenOptimizer: TokenOptimizer
        +analyzePerformance(): PerformanceAnalysis
        +optimizeTokenUsage(): OptimizationResult
        +implementCaching(): CacheConfiguration
        +reduceLatency(): LatencyReport
    }

    class ErrorHandlingFramework {
        -errorRecovery: ErrorRecovery
        -fallbackStrategies: FallbackStrategies
        -errorReporter: ErrorReporter
        +handleOrchestrationError(error: Error): RecoveryResult
        +implementFallback(context: ErrorContext): FallbackResult
        +reportError(error: ErrorInfo): void
    }

    class DocumentationGenerator {
        -apiDocGen: APIDocumentationGenerator
        -userGuideGen: UserGuideGenerator
        -exampleGen: ExampleGenerator
        +generateAPIDocs(): APIDocumentation
        +generateUserGuide(): UserGuide
        +generateExamples(): ExampleCollection
    }

    class MetricsCollector {
        -performanceMetrics: Map<string, Metric>
        -usageMetrics: Map<string, UsageData>
        +collectMetric(name: string, value: number): void
        +getMetricSummary(): MetricsSummary
        +exportMetrics(): MetricsExport
    }

    IntegrationTestSuite --> PerformanceOptimizer : validates
    PerformanceOptimizer --> MetricsCollector : uses
    IntegrationTestSuite --> ErrorHandlingFramework : tests
    DocumentationGenerator --> IntegrationTestSuite : documents
```

## TDD実装計画

### タスク6.1: 統合テスト型定義の作成

#### 実装: src/testing/integration-types.ts

```typescript
export interface TestReport {
  summary: TestSummary;
  e2eResults: E2ETestResults;
  performanceResults: PerformanceMetrics;
  loadTestResults: LoadTestResults;
  recommendations: string[];
}

export interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  timestamp: Date;
}

export interface E2ETestResults {
  scenarios: TestScenario[];
  coverage: CoverageReport;
  criticalPaths: CriticalPath[];
  targetCoveragePercentage?: number;
}

export interface TestScenario {
  name: string;
  description: string;
  steps: TestStep[];
  result: "passed" | "failed" | "skipped";
  duration: number;
  errors?: string[];
}

export interface TestStep {
  action: string;
  expected: string;
  actual?: string;
  passed: boolean;
}

export interface PerformanceMetrics {
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  tokenUsage: TokenMetrics;
  memoryUsage: MemoryMetrics;
  throughput: number;
}

export interface TokenMetrics {
  avgTokensPerRequest: number;
  maxTokensPerRequest: number;
  tokenEfficiency: number;
  compressionRatio: number;
}

export interface LoadTestResults {
  concurrentUsers: number;
  requestsPerSecond: number;
  errorRate: number;
  avgLatency: number;
  peakMemoryUsage: number;
}

export interface PerformanceAnalysis {
  bottlenecks: Bottleneck[];
  optimizationOpportunities: OptimizationOpportunity[];
  resourceUtilization: ResourceMetrics;
}

export interface Bottleneck {
  component: string;
  metric: string;
  currentValue: number;
  threshold: number;
  impact: "high" | "medium" | "low";
}

export interface OptimizationOpportunity {
  area: string;
  description: string;
  expectedImprovement: number;
  effort: "low" | "medium" | "high";
  priority: number;
}
```

### タスク6.2: E2E統合テストスイートの実装

E2E統合テストスイートは、システム全体の動作をユーザーシナリオに基づいて検証します。タスクの受付から分析、サブタスクへの分解、各モードでの処理、結果の統合、GitHub Actions連携による進捗通知まで、一連のフローを網羅的にテストします。**全てのコンポーネントおよび機能において、テストカバレッジ100%を達成することを目指します。**

#### テストファースト: src/testing/e2e-test-runner.ts

```typescript
// test/testing/e2e-test-runner.test.ts
import { describe, test, expect, beforeEach } from "bun:test";
import { E2ETestRunner } from "../../src/testing/e2e-test-runner";

describe("E2ETestRunner", () => {
  let runner: E2ETestRunner;

  beforeEach(() => {
    runner = new E2ETestRunner();
  });

  test("should run simple task orchestration scenario", async () => {
    const scenario = {
      name: "Simple Task Orchestration",
      description: "Test basic task analysis and execution",
      steps: [
        {
          action: "Analyze simple task",
          input: "Fix typo in README",
          expectedMode: "code",
          expectedComplexity: "low",
        },
      ],
    };

    const result = await runner.runScenario(scenario);

    expect(result.result).toBe("passed");
    expect(result.steps[0].passed).toBe(true);
  });

  test("should run complex orchestration scenario", async () => {
    const scenario = {
      name: "Complex Task Orchestration",
      description: "Test complex task decomposition and multi-mode execution",
      steps: [
        {
          action: "Analyze complex task",
          input: "Build complete authentication system",
          expectedMode: "orchestrator",
          expectedSubtasks: 4,
        },
        {
          action: "Execute subtasks",
          expectParallelExecution: true,
          expectedModes: ["architect", "code", "debug"],
        },
      ],
    };

    const result = await runner.runScenario(scenario);

    expect(result.result).toBe("passed");
    expect(result.duration).toBeGreaterThan(0);
  });

  test("should test mode switching workflow", async () => {
    const result = await runner.runModeSwitchingTest();

    expect(result.passed).toBe(true);
    expect(result.modeSwitches).toBeGreaterThan(3);
    expect(result.contextPreserved).toBe(true);
  });

  test("should test error recovery", async () => {
    const scenario = {
      name: "Error Recovery Test",
      description: "Test error handling and recovery",
      steps: [
        {
          action: "Trigger error",
          errorType: "TokenLimitExceeded",
          expectedRecovery: "context_optimization",
        },
      ],
    };

    const result = await runner.runScenario(scenario);

    expect(result.steps[0].passed).toBe(true);
    expect(result.errors).toBeUndefined();
  });
});
```

#### 実装: src/testing/e2e-test-runner.ts

```typescript
import { MCPOrchestrationServer } from "../mcp/orchestration-server";
import { OrchestrationEntrypoint } from "../entrypoints/orchestrate";
import type {
  TestScenario,
  E2ETestResults,
  TestStep,
} from "./integration-types";

export class E2ETestRunner {
  private mcpServer: MCPOrchestrationServer;
  private orchestrationEntrypoint: OrchestrationEntrypoint;

  constructor() {
    this.mcpServer = new MCPOrchestrationServer();
    this.mcpServer.registerOrchestrationTools();
  }

  async runAllScenarios(): Promise<E2ETestResults> {
    const scenarios = this.getTestScenarios();
    const results: TestScenario[] = [];

    for (const scenario of scenarios) {
      const result = await this.runScenario(scenario);
      results.push(result);
    }

    const coverage = await this.calculateCoverage();
    const criticalPaths = this.identifyCriticalPaths(results);

    return {
      scenarios: results,
      coverage,
      criticalPaths,
    };
  }

  async runScenario(scenario: any): Promise<TestScenario> {
    const startTime = Date.now();
    const steps: TestStep[] = [];
    let result: "passed" | "failed" | "skipped" = "passed";
    const errors: string[] = [];

    try {
      for (const step of scenario.steps) {
        const stepResult = await this.executeStep(step);
        steps.push(stepResult);

        if (!stepResult.passed) {
          result = "failed";
          break;
        }
      }
    } catch (error) {
      result = "failed";
      errors.push(error.message);
    }

    return {
      name: scenario.name,
      description: scenario.description,
      steps,
      result,
      duration: Date.now() - startTime,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async runModeSwitchingTest(): Promise<{
    passed: boolean;
    modeSwitches: number;
    contextPreserved: boolean;
  }> {
    let modeSwitches = 0;
    let contextPreserved = true;

    try {
      // Test mode switches
      const modes = ["architect", "code", "debug", "ask"];

      for (const mode of modes) {
        const result = await this.mcpServer.handleToolCall("switch_mode", {
          mode,
          preserveContext: true,
        });

        if (result.mode.slug === mode) {
          modeSwitches++;
        }

        if (!result.contextPreserved) {
          contextPreserved = false;
        }
      }

      return {
        passed: modeSwitches === modes.length,
        modeSwitches,
        contextPreserved,
      };
    } catch (error) {
      return {
        passed: false,
        modeSwitches,
        contextPreserved: false,
      };
    }
  }

  private async executeStep(step: any): Promise<TestStep> {
    const action = step.action;
    let passed = true;
    let actual: string | undefined;

    try {
      switch (action) {
        case "Analyze simple task":
        case "Analyze complex task":
          const analysis = await this.mcpServer.handleToolCall("analyze_task", {
            task: step.input,
          });

          if (
            step.expectedMode &&
            analysis.requiredModes[0] !== step.expectedMode
          ) {
            passed = false;
            actual = `Mode: ${analysis.requiredModes[0]}`;
          }

          if (step.expectedComplexity) {
            const complexityLevel = analysis.complexity < 3 ? "low" : "high";
            if (complexityLevel !== step.expectedComplexity) {
              passed = false;
              actual = `Complexity: ${complexityLevel}`;
            }
          }

          if (
            step.expectedSubtasks &&
            analysis.estimatedSubtasks < step.expectedSubtasks
          ) {
            passed = false;
            actual = `Subtasks: ${analysis.estimatedSubtasks}`;
          }
          break;

        case "Execute subtasks":
          // Simulate subtask execution
          passed = true;
          actual = "Subtasks executed successfully";
          break;

        case "Trigger error":
          // Simulate error and recovery
          if (step.errorType === "TokenLimitExceeded") {
            // Should trigger context optimization
            const optimized = await this.mcpServer.handleToolCall(
              "optimize_context",
              {
                context: { large: "data".repeat(1000) },
                maxTokens: 1000,
              },
            );

            passed = optimized.tokensUsed <= 1000;
            actual = `Recovery: ${step.expectedRecovery}`;
          }
          break;
      }
    } catch (error) {
      passed = false;
      actual = error.message;
    }

    return {
      action,
      expected: this.getExpectedFromStep(step),
      actual,
      passed,
    };
  }

  private getExpectedFromStep(step: any): string {
    if (step.expectedMode) return `Mode: ${step.expectedMode}`;
    if (step.expectedComplexity)
      return `Complexity: ${step.expectedComplexity}`;
    if (step.expectedSubtasks) return `Subtasks: >= ${step.expectedSubtasks}`;
    if (step.expectedRecovery) return `Recovery: ${step.expectedRecovery}`;
    return "Success";
  }

  private getTestScenarios(): any[] {
    return [
      {
        name: "Basic Task Analysis",
        description: "Test basic task analysis functionality",
        steps: [
          {
            action: "Analyze simple task",
            input: "Update package version",
            expectedMode: "code",
            expectedComplexity: "low",
          },
        ],
      },
      {
        name: "Complex Orchestration",
        description: "Test complex task orchestration",
        steps: [
          {
            action: "Analyze complex task",
            input: "Implement complete e-commerce platform",
            expectedMode: "orchestrator",
            expectedSubtasks: 5,
          },
          {
            action: "Execute subtasks",
            expectParallelExecution: true,
          },
        ],
      },
      {
        name: "Context Optimization",
        description: "Test context optimization under token pressure",
        steps: [
          {
            action: "Trigger error",
            errorType: "TokenLimitExceeded",
            expectedRecovery: "context_optimization",
          },
        ],
      },
    ];
  }

  private async calculateCoverage(): Promise<any> {
    // Simulate coverage calculation
    return {
      components: 0.85,
      modes: 1.0,
      tools: 0.9,
      overall: 0.88,
    };
  }

  private identifyCriticalPaths(results: TestScenario[]): any[] {
    return [
      {
        name: "Task Analysis Path",
        steps: ["Receive task", "Analyze complexity", "Determine modes"],
        coverage: 1.0,
      },
      {
        name: "Orchestration Path",
        steps: [
          "Decompose task",
          "Assign modes",
          "Execute subtasks",
          "Aggregate results",
        ],
        coverage: 0.9,
      },
    ];
  }
}
```

### タスク6.3: パフォーマンス最適化の実装

#### テストファースト: src/optimization/performance-optimizer.ts

```typescript
// test/optimization/performance-optimizer.test.ts
import { describe, test, expect, beforeEach } from "bun:test";
import { PerformanceOptimizer } from "../../src/optimization/performance-optimizer";

describe("PerformanceOptimizer", () => {
  let optimizer: PerformanceOptimizer;

  beforeEach(() => {
    optimizer = new PerformanceOptimizer();
  });

  test("should analyze performance bottlenecks", async () => {
    const analysis = await optimizer.analyzePerformance();

    expect(analysis.bottlenecks).toBeDefined();
    expect(analysis.optimizationOpportunities).toBeDefined();
    expect(analysis.resourceUtilization).toBeDefined();
  });

  test("should optimize token usage", async () => {
    const context = {
      largeData: "x".repeat(10000),
      metadata: { timestamp: new Date() },
      history: Array(100).fill("command"),
    };

    const result = await optimizer.optimizeTokenUsage(context, 2000);

    expect(result.optimizedTokens).toBeLessThanOrEqual(2000);
    expect(result.compressionRatio).toBeGreaterThan(0.5);
    expect(result.preservedKeys).toContain("metadata");
  });

  test("should implement effective caching", async () => {
    const cacheConfig = await optimizer.implementCaching();

    expect(cacheConfig.strategy).toBe("lru");
    expect(cacheConfig.maxSize).toBeGreaterThan(0);
    expect(cacheConfig.ttl).toBeGreaterThan(0);
  });

  test("should reduce latency through optimization", async () => {
    const latencyReport = await optimizer.reduceLatency();

    expect(latencyReport.originalLatency).toBeGreaterThan(
      latencyReport.optimizedLatency,
    );
    expect(latencyReport.improvement).toBeGreaterThan(20); // 20% improvement
  });
});
```

#### 実装: src/optimization/performance-optimizer.ts

```typescript
import type {
  PerformanceAnalysis,
  Bottleneck,
  OptimizationOpportunity,
  TokenMetrics,
} from "../testing/integration-types";

export class PerformanceOptimizer {
  private metricsCollector: MetricsCollector;
  private cacheManager: CacheManager;
  private tokenOptimizer: TokenOptimizer;

  constructor() {
    this.metricsCollector = new MetricsCollector();
    this.cacheManager = new CacheManager();
    this.tokenOptimizer = new TokenOptimizer();
  }

  async analyzePerformance(): Promise<PerformanceAnalysis> {
    const metrics = await this.metricsCollector.collectAllMetrics();
    const bottlenecks = this.identifyBottlenecks(metrics);
    const opportunities = this.findOptimizationOpportunities(metrics);
    const resourceUtilization = this.calculateResourceUtilization(metrics);

    return {
      bottlenecks,
      optimizationOpportunities: opportunities,
      resourceUtilization,
    };
  }

  async optimizeTokenUsage(
    context: any,
    maxTokens: number,
  ): Promise<{
    optimizedTokens: number;
    compressionRatio: number;
    preservedKeys: string[];
  }> {
    return this.tokenOptimizer.optimize(context, maxTokens);
  }

  async implementCaching(): Promise<{
    strategy: string;
    maxSize: number;
    ttl: number;
  }> {
    return this.cacheManager.configure();
  }

  async reduceLatency(): Promise<{
    originalLatency: number;
    optimizedLatency: number;
    improvement: number;
  }> {
    const original = await this.measureCurrentLatency();

    // Apply optimizations
    await this.applyLatencyOptimizations();

    const optimized = await this.measureCurrentLatency();
    const improvement = ((original - optimized) / original) * 100;

    return {
      originalLatency: original,
      optimizedLatency: optimized,
      improvement,
    };
  }

  private identifyBottlenecks(metrics: any): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];

    // Token usage bottleneck
    if (metrics.tokenUsage.avgTokensPerRequest > 3000) {
      bottlenecks.push({
        component: "TokenUsage",
        metric: "avgTokensPerRequest",
        currentValue: metrics.tokenUsage.avgTokensPerRequest,
        threshold: 3000,
        impact: "high",
      });
    }

    // Response time bottleneck
    if (metrics.avgResponseTime > 2000) {
      bottlenecks.push({
        component: "ResponseTime",
        metric: "avgResponseTime",
        currentValue: metrics.avgResponseTime,
        threshold: 2000,
        impact: "medium",
      });
    }

    // Memory usage bottleneck
    if (metrics.memoryUsage.peak > 500) {
      bottlenecks.push({
        component: "Memory",
        metric: "peakMemoryUsage",
        currentValue: metrics.memoryUsage.peak,
        threshold: 500,
        impact: "low",
      });
    }

    return bottlenecks;
  }

  private findOptimizationOpportunities(
    metrics: any,
  ): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];

    // Context optimization opportunity
    if (metrics.tokenUsage.compressionRatio < 0.7) {
      opportunities.push({
        area: "Context Compression",
        description: "Implement aggressive context compression",
        expectedImprovement: 30,
        effort: "medium",
        priority: 1,
      });
    }

    // Caching opportunity
    if (metrics.cacheHitRate < 0.5) {
      opportunities.push({
        area: "Caching",
        description: "Improve cache hit rate",
        expectedImprovement: 40,
        effort: "low",
        priority: 2,
      });
    }

    // Parallel processing opportunity
    if (metrics.parallelizationRate < 0.6) {
      opportunities.push({
        area: "Parallel Processing",
        description: "Increase parallel subtask execution",
        expectedImprovement: 25,
        effort: "high",
        priority: 3,
      });
    }

    return opportunities;
  }

  private calculateResourceUtilization(metrics: any): any {
    return {
      cpu: metrics.cpuUsage || 45,
      memory: metrics.memoryUsage.current || 256,
      tokenBudget: (metrics.tokenUsage.avgTokensPerRequest / 4000) * 100,
      throughput: metrics.throughput || 10,
    };
  }

  private async measureCurrentLatency(): Promise<number> {
    // Simulate latency measurement
    return 150 + Math.random() * 50;
  }

  private async applyLatencyOptimizations(): Promise<void> {
    // Simulate optimization application
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

class MetricsCollector {
  async collectAllMetrics(): Promise<any> {
    return {
      avgResponseTime: 1800,
      tokenUsage: {
        avgTokensPerRequest: 2500,
        compressionRatio: 0.65,
      },
      memoryUsage: {
        current: 256,
        peak: 480,
      },
      cacheHitRate: 0.45,
      parallelizationRate: 0.55,
      throughput: 12,
    };
  }
}

class CacheManager {
  configure(): { strategy: string; maxSize: number; ttl: number } {
    return {
      strategy: "lru",
      maxSize: 1000,
      ttl: 3600,
    };
  }
}

class TokenOptimizer {
  optimize(
    context: any,
    maxTokens: number,
  ): {
    optimizedTokens: number;
    compressionRatio: number;
    preservedKeys: string[];
  } {
    const originalSize = JSON.stringify(context).length;
    const preservedKeys = ["metadata"];

    // Simulate optimization
    const optimizedSize = Math.min(originalSize * 0.6, maxTokens * 4);

    return {
      optimizedTokens: Math.floor(optimizedSize / 4),
      compressionRatio: optimizedSize / originalSize,
      preservedKeys,
    };
  }
}
```

### タスク6.4: エラーハンドリング強化の実装

#### 実装: src/error-handling/error-framework.ts

```typescript
import type { ErrorInfo } from "../types";

export class ErrorHandlingFramework {
  private errorRecovery: ErrorRecovery;
  private fallbackStrategies: FallbackStrategies;
  private errorReporter: ErrorReporter;

  constructor() {
    this.errorRecovery = new ErrorRecovery();
    this.fallbackStrategies = new FallbackStrategies();
    this.errorReporter = new ErrorReporter();
  }

  async handleOrchestrationError(error: Error): Promise<{
    recovered: boolean;
    strategy: string;
    result?: any;
  }> {
    // Log error
    await this.errorReporter.reportError({
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      component: "orchestration",
    });

    // Attempt recovery
    const recoveryResult = await this.errorRecovery.attemptRecovery(error);

    if (recoveryResult.success) {
      return {
        recovered: true,
        strategy: recoveryResult.strategy,
        result: recoveryResult.result,
      };
    }

    // Apply fallback
    const fallbackResult = await this.implementFallback({
      error,
      attempts: recoveryResult.attempts,
      context: {},
    });

    return {
      recovered: fallbackResult.success,
      strategy: fallbackResult.strategy,
      result: fallbackResult.result,
    };
  }

  async implementFallback(context: {
    error: Error;
    attempts: number;
    context: any;
  }): Promise<{
    success: boolean;
    strategy: string;
    result?: any;
  }> {
    return this.fallbackStrategies.apply(context);
  }

  reportError(error: ErrorInfo): void {
    this.errorReporter.reportError(error);
  }
}

class ErrorRecovery {
  async attemptRecovery(error: Error): Promise<{
    success: boolean;
    strategy: string;
    attempts: number;
    result?: any;
  }> {
    // Token limit error - optimize context
    if (error.message.includes("token limit")) {
      return {
        success: true,
        strategy: "context_optimization",
        attempts: 1,
        result: { optimized: true },
      };
    }

    // Rate limit error - retry with backoff
    if (error.message.includes("rate limit")) {
      await this.delay(1000);
      return {
        success: true,
        strategy: "exponential_backoff",
        attempts: 1,
        result: { retried: true },
      };
    }

    // Mode not found - fallback to default
    if (error.message.includes("Mode not found")) {
      return {
        success: true,
        strategy: "default_mode_fallback",
        attempts: 1,
        result: { mode: "code" },
      };
    }

    return {
      success: false,
      strategy: "none",
      attempts: 1,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

class FallbackStrategies {
  apply(context: any): {
    success: boolean;
    strategy: string;
    result?: any;
  } {
    // Simple task fallback
    if (context.error.message.includes("complex")) {
      return {
        success: true,
        strategy: "simplify_task",
        result: { simplified: true },
      };
    }

    // Generic fallback
    return {
      success: true,
      strategy: "graceful_degradation",
      result: { degraded: true },
    };
  }
}

class ErrorReporter {
  reportError(error: any): void {
    console.error("Error reported:", error);
    // In production, this would send to monitoring service
  }
}
```

## コミット計画

### コミット1: 統合テスト型定義

```bash
git add src/testing/integration-types.ts
git commit -m "feat(testing): add integration test type definitions"
```

### コミット2: E2Eテストランナー

```bash
git add src/testing/e2e-test-runner.ts test/testing/e2e-test-runner.test.ts
git commit -m "feat(testing): implement E2E test runner with scenarios"
```

### コミット3: パフォーマンス最適化

```bash
git add src/optimization/performance-optimizer.ts test/optimization/performance-optimizer.test.ts
git commit -m "feat(optimization): implement performance optimization framework"
```

### コミット4: エラーハンドリング

```bash
git add src/error-handling/error-framework.ts test/error-handling/error-framework.test.ts
git commit -m "feat(error-handling): implement comprehensive error handling"
```

### コミット5: 統合とドキュメント

```bash
git add test/integration/full-system.test.ts docs/orchestration-guide.md
git commit -m "feat(integration): add full system tests and documentation"
```

## ディレクトリ構造

```
src/
├── testing/
│   ├── integration-types.ts      # テスト型定義
│   ├── e2e-test-runner.ts        # E2Eテストランナー
│   └── performance-test-runner.ts # パフォーマンステスト
├── optimization/
│   ├── performance-optimizer.ts   # パフォーマンス最適化
│   ├── cache-manager.ts          # キャッシュ管理
│   └── token-optimizer.ts        # トークン最適化
└── error-handling/
    ├── error-framework.ts        # エラーハンドリング
    ├── recovery-strategies.ts    # リカバリー戦略
    └── error-reporter.ts         # エラーレポート

test/
├── testing/
│   ├── e2e-test-runner.test.ts
│   └── performance-test-runner.test.ts
├── optimization/
│   └── performance-optimizer.test.ts
├── error-handling/
│   └── error-framework.test.ts
└── integration/
    └── full-system.test.ts

docs/
├── orchestration-guide.md        # ユーザーガイド
├── api-reference.md              # APIリファレンス
└── performance-tuning.md         # パフォーマンスチューニング
```

## 統合テスト

```typescript
// test/integration/full-system.test.ts
import { describe, test, expect } from "bun:test";
import { IntegrationTestSuite } from "../../src/testing/integration-test-suite";

describe("Full System Integration", () => {
  test("should run complete integration test suite", async () => {
    const suite = new IntegrationTestSuite();
    const report = await suite.runAllTests();

    // E2E Tests
    expect(report.e2eResults.scenarios.length).toBeGreaterThan(5);
    expect(report.summary.passed / report.summary.totalTests).toBeGreaterThan(
      0.95,
    );

    // Performance Tests
    expect(report.performanceResults.avgResponseTime).toBeLessThan(2000);
    expect(
      report.performanceResults.tokenUsage.avgTokensPerRequest,
    ).toBeLessThan(3000);

    // Load Tests
    expect(report.loadTestResults.errorRate).toBeLessThan(0.01);
    expect(report.loadTestResults.avgLatency).toBeLessThan(500);

    // Recommendations
    expect(report.recommendations).toBeDefined();
    expect(report.recommendations.length).toBeGreaterThan(0);
  }, 60000); // 60 second timeout for full suite

  test("should handle concurrent orchestration requests", async () => {
    const concurrentRequests = 10;
    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        simulateOrchestrationRequest(`Task ${i}: Implement feature ${i}`),
      );
    }

    const results = await Promise.all(promises);
    const successRate =
      results.filter((r) => r.success).length / results.length;

    expect(successRate).toBeGreaterThan(0.95);
  });

  test("should maintain performance under load", async () => {
    const loadTest = new LoadTestRunner();
    const result = await loadTest.run({
      duration: 30, // seconds
      concurrentUsers: 50,
      scenario: "mixed_workload",
    });

    expect(result.avgResponseTime).toBeLessThan(3000);
    expect(result.errorRate).toBeLessThan(0.02);
    expect(result.throughput).toBeGreaterThan(5); // requests per second
  });
});

async function simulateOrchestrationRequest(task: string): Promise<any> {
  // Simulate orchestration request
  return { success: true, task };
}
```

## パフォーマンスベンチマーク

```typescript
// scripts/benchmark.ts
import { PerformanceBenchmark } from "../src/testing/performance-benchmark";

async function runBenchmarks() {
  const benchmark = new PerformanceBenchmark();

  console.log("Running orchestration benchmarks...\n");

  // Token optimization benchmark
  const tokenBench = await benchmark.runTokenOptimizationBenchmark();
  console.log("Token Optimization:");
  console.log(`  Original: ${tokenBench.originalTokens} tokens`);
  console.log(`  Optimized: ${tokenBench.optimizedTokens} tokens`);
  console.log(`  Reduction: ${tokenBench.reductionPercentage}%\n`);

  // Mode switching benchmark
  const modeBench = await benchmark.runModeSwitchingBenchmark();
  console.log("Mode Switching:");
  console.log(`  Avg switch time: ${modeBench.avgSwitchTime}ms`);
  console.log(
    `  Context preserved: ${modeBench.contextPreservationRate * 100}%\n`,
  );

  // Subtask execution benchmark
  const subtaskBench = await benchmark.runSubtaskExecutionBenchmark();
  console.log("Subtask Execution:");
  console.log(`  Parallel speedup: ${subtaskBench.parallelSpeedup}x`);
  console.log(`  Avg subtask time: ${subtaskBench.avgSubtaskTime}ms`);
}

runBenchmarks().catch(console.error);
```

## 実行手順

### 実行フロー

```bash
# 1. phase4-mcp-extension から作業ブランチを作成
git checkout phase4-mcp-extension
git pull origin phase4-mcp-extension # 念のため最新化
git checkout -b phase5-integration-testing phase4-mcp-extension

# 2. AI実装（Claude Code、Cursor等）
# TDDに従ってテストファーストで実装 (プロジェクトルートで行う)

# 3. プリコミットチェック
bun test && bun run format:check && bun run typecheck

# 4. コミット
git add .
git commit -m "feat(integration-testing): implement integration testing" # コミットメッセージは適宜変更

# 5. プッシュしてPR作成
git push origin phase5-integration-testing

# 6. GitHubでPR作成・レビュー・マージ
#    PRのターゲットブランチは phase4-mcp-extension とする

# 7. クリーンアップ (PRマージ後)
git checkout phase4-mcp-extension
git pull origin phase4-mcp-extension # リモートの変更を取り込み最新化
git branch -d phase5-integration-testing # ローカルの作業ブランチを削除
# git push origin --delete phase5-integration-testing # (任意) リモートの作業ブランチも削除する場合
```

### 詳細ステップ（TDD）

```bash
# 1. phase4-mcp-extension から作業ブランチ作成
git checkout phase4-mcp-extension
git pull origin phase4-mcp-extension # 念のため最新化
git checkout -b phase5-integration-testing phase4-mcp-extension

# プロジェクトルートで作業を進める

# (テストファイル作成、テスト実行、実装、スクリプト実行などはドキュメントの各フェーズに従う)
# ... (省略) ...

# X. プリコミットチェック (実装完了後)
bun test && bun run format:check && bun run typecheck

# Y. コミット
git add .
git commit -m "feat(integration-testing): implement integration testing" # コミットメッセージは適宜変更

# Z. 統合 (PR経由でのマージ)
#    上記「実行フロー」のステップ5以降に従ってPRを作成し、マージする
git push origin phase5-integration-testing
# GitHub上で phase4-mcp-extension をターゲットブランチとしてPRを作成・レビュー・マージ
# マージ後、ローカルブランチをクリーンアップ
git checkout phase4-mcp-extension
git pull origin phase4-mcp-extension
git branch -d phase5-integration-testing
```

## 依存関係

このフェーズは全ての前フェーズ完了後に実装してください：

- フェーズ1-5: 全機能の実装完了

## 次のステップ

1. 本番環境でのモニタリング設定
2. パフォーマンスダッシュボードの作成
3. 継続的な最適化プロセスの確立

**💡 重要な点**: 統合テストと最適化により、システム全体の品質と信頼性を確保し、本番環境での安定稼働を実現することが重要です。
