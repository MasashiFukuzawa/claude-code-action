#!/usr/bin/env bun

import { TaskAnalyzer } from "./src/orchestrator/task-analyzer.ts";

const analyzer = new TaskAnalyzer();

const complexTask =
  "新しいユーザー認証システムを実装し、JWTトークンの管理、リフレッシュ機能、権限管理を含む完全なシステムを構築してください";

console.log("=== Debug Task Analyzer ===");
console.log("Task:", complexTask);

const result = analyzer.analyze(complexTask);

console.log("\n=== Analysis Result ===");
console.log("isComplex:", result.isComplex);
console.log("confidence:", result.confidence);
console.log("reason:", result.reason);

// Check indicators directly
const indicators = analyzer.analyzeIndicators(complexTask);
console.log("\n=== Indicators ===");
console.log(JSON.stringify(indicators, null, 2));

const score = analyzer.calculateComplexityScore(indicators);
console.log("\n=== Score ===");
console.log("Raw score:", score);
console.log("Threshold check (score > 0.5):", score > 0.5);
