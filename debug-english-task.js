#!/usr/bin/env bun

import { TaskAnalyzer } from "./src/orchestrator/task-analyzer.ts";

const analyzer = new TaskAnalyzer();

const complexTask =
  "Implement a complete user authentication system with JWT token management, refresh functionality, role-based permissions, and integration with multiple OAuth providers including Google and GitHub";

console.log("=== Debug English Complex Task ===");
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
