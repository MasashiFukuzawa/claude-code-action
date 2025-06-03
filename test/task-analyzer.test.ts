#!/usr/bin/env bun

import { describe, test, expect } from "bun:test";
import { TaskAnalyzer } from "../src/orchestrator";

describe("TaskAnalyzer", () => {
  test("analyze returns stubbed result", () => {
    const analyzer = new TaskAnalyzer();
    const result = analyzer.analyze("do something");
    expect(result).toEqual({
      isComplex: false,
      confidence: 0,
      reason: "stub",
      suggestedSubtasks: [],
    });
  });
});
