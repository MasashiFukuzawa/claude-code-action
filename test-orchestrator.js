#!/usr/bin/env node

/**
 * Orchestrator Performance Testing Script
 *
 * Phase 3 - L-2. MCPサーバーテスト用のスクリプト
 * orchestratorサーバーの基本動作確認を行う
 */

import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// テスト設定
const TEST_CONFIG = {
  serverPath: join(__dirname, "src/orchestrator/index.ts"),
  timeout: 10000, // 10秒
  testCases: [
    {
      name: "simple_japanese_task",
      task: "README.mdのタイポを修正してください",
      expectedComplex: false,
    },
    {
      name: "complex_japanese_task",
      task: "新しいユーザー認証システムを実装し、JWTトークンの管理、リフレッシュ機能、権限管理を含む完全なシステムを構築してください",
      expectedComplex: true,
    },
    {
      name: "english_simple_task",
      task: "Fix typo in README.md",
      expectedComplex: false,
    },
    {
      name: "english_complex_task",
      task: "Implement a complete user authentication system with JWT token management, refresh functionality, role-based permissions, and integration with multiple OAuth providers including Google and GitHub",
      expectedComplex: true,
    },
  ],
};

class OrchestratorTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const prefix = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async spawnServer() {
    return new Promise((resolve, reject) => {
      this.log("Starting orchestrator server...");

      const serverProcess = spawn("bun", ["run", TEST_CONFIG.serverPath], {
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          ORCHESTRATOR_STATE_DIR: __dirname,
          DEBUG: "true",
          USER_LANGUAGE: "ja",
        },
      });

      let stdoutData = "";
      let stderrData = "";

      serverProcess.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      serverProcess.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      // サーバー起動のタイムアウト
      const startupTimeout = setTimeout(() => {
        serverProcess.kill();
        reject(new Error("Server startup timeout"));
      }, TEST_CONFIG.timeout);

      serverProcess.on("exit", (code) => {
        clearTimeout(startupTimeout);

        if (code === 0) {
          this.log("Server started successfully", "success");
          resolve({
            process: serverProcess,
            stdout: stdoutData,
            stderr: stderrData,
          });
        } else {
          this.log(`Server failed to start with exit code: ${code}`, "error");
          this.log(`STDOUT: ${stdoutData}`);
          this.log(`STDERR: ${stderrData}`);
          reject(new Error(`Server startup failed with code ${code}`));
        }
      });

      serverProcess.on("error", (error) => {
        clearTimeout(startupTimeout);
        this.log(`Server spawn error: ${error.message}`, "error");
        reject(error);
      });
    });
  }

  async testTaskAnalysis(testCase) {
    this.log(`Testing: ${testCase.name}`);

    const testStartTime = Date.now();

    try {
      // TaskAnalyzerの直接テスト（MCPサーバー経由ではなく）
      const { TaskAnalyzer } = await import(
        "./src/orchestrator/task-analyzer.ts"
      );
      const analyzer = new TaskAnalyzer();

      const result = await analyzer.analyze(testCase.task);
      const duration = Date.now() - testStartTime;

      // 結果の検証
      const passed = result.isComplex === testCase.expectedComplex;

      const testResult = {
        name: testCase.name,
        task: testCase.task,
        result,
        duration,
        passed,
        expectedComplex: testCase.expectedComplex,
      };

      this.results.push(testResult);

      if (passed) {
        this.log(`✅ ${testCase.name}: PASSED (${duration}ms)`, "success");
      } else {
        this.log(
          `❌ ${testCase.name}: FAILED - Expected complex: ${testCase.expectedComplex}, Got: ${result.isComplex}`,
          "error",
        );
      }

      this.log(`   Confidence: ${result.confidence}`);
      this.log(`   Reason: ${result.reason}`);

      return testResult;
    } catch (error) {
      const duration = Date.now() - testStartTime;
      this.log(`❌ ${testCase.name}: ERROR - ${error.message}`, "error");

      const testResult = {
        name: testCase.name,
        task: testCase.task,
        error: error.message,
        duration,
        passed: false,
      };

      this.results.push(testResult);
      return testResult;
    }
  }

  async runAllTests() {
    this.log("🚀 Starting Orchestrator Performance Tests");
    this.log(`Test cases: ${TEST_CONFIG.testCases.length}`);

    // TaskAnalyzer テスト
    this.log("\n📊 Phase 1: TaskAnalyzer Unit Tests");
    for (const testCase of TEST_CONFIG.testCases) {
      await this.testTaskAnalysis(testCase);
    }

    // 結果サマリー
    await this.generateReport();
  }

  async generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const passedTests = this.results.filter((r) => r.passed);
    const failedTests = this.results.filter((r) => !r.passed);

    this.log("\n📈 Performance Test Report");
    this.log("=" * 50);
    this.log(`Total duration: ${totalDuration}ms`);
    this.log(`Tests run: ${this.results.length}`);
    this.log(`Passed: ${passedTests.length}`, "success");
    this.log(
      `Failed: ${failedTests.length}`,
      failedTests.length > 0 ? "error" : "info",
    );

    if (failedTests.length > 0) {
      this.log("\n❌ Failed Tests:");
      failedTests.forEach((test) => {
        this.log(`  - ${test.name}: ${test.error || "Assertion failed"}`);
      });
    }

    // パフォーマンス統計
    const durations = this.results
      .filter((r) => r.duration)
      .map((r) => r.duration);
    if (durations.length > 0) {
      const avgDuration =
        durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);

      this.log("\n⏱️ Performance Statistics:");
      this.log(`  Average: ${avgDuration.toFixed(2)}ms`);
      this.log(`  Maximum: ${maxDuration}ms`);
      this.log(`  Minimum: ${minDuration}ms`);
    }

    // 結果をファイルに保存
    const reportData = {
      timestamp: new Date().toISOString(),
      totalDuration,
      testCases: this.results,
      summary: {
        total: this.results.length,
        passed: passedTests.length,
        failed: failedTests.length,
        successRate:
          ((passedTests.length / this.results.length) * 100).toFixed(2) + "%",
      },
    };

    await this.saveReport(reportData);
  }

  async saveReport(reportData) {
    try {
      const fs = await import("fs/promises");
      await fs.writeFile(
        join(__dirname, "orchestrator-test-report.json"),
        JSON.stringify(reportData, null, 2),
      );
      this.log("📄 Report saved to orchestrator-test-report.json", "success");
    } catch (error) {
      this.log(`Failed to save report: ${error.message}`, "error");
    }
  }
}

// スクリプト実行
async function main() {
  const tester = new OrchestratorTester();

  try {
    await tester.runAllTests();

    // 成功した場合の終了コード
    const failedCount = tester.results.filter((r) => !r.passed).length;
    process.exit(failedCount > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Test execution failed:", error.message);
    process.exit(1);
  }
}

// 直接実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { OrchestratorTester, TEST_CONFIG };
