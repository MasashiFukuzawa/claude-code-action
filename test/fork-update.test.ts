import { describe, test, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

describe("Fork Update Validation", () => {
  const rootDir = join(__dirname, "..");

  test("README.md should reference forked action", () => {
    const readme = readFileSync(join(rootDir, "README.md"), "utf-8");
    expect(readme).not.toContain("anthropics/claude-code-action@beta");
    expect(readme).toContain(
      "MasashiFukuzawa/claude-code-action@orchestrator-alpha",
    );
  });

  test("all example files should reference forked action", () => {
    const exampleFiles = [
      "claude.yml",
      "claude-auto-review.yml",
      "claude-pr-path-specific.yml",
      "claude-review-from-author.yml",
    ];

    exampleFiles.forEach((file) => {
      const content = readFileSync(join(rootDir, "examples", file), "utf-8");
      expect(content).not.toContain("anthropics/claude-code-action@beta");
      expect(content).toContain(
        "MasashiFukuzawa/claude-code-action@orchestrator-alpha",
      );
    });
  });

  test("should maintain YAML structure integrity", () => {
    const exampleFiles = [
      "claude.yml",
      "claude-auto-review.yml",
      "claude-pr-path-specific.yml",
      "claude-review-from-author.yml",
    ];

    exampleFiles.forEach((file) => {
      const content = readFileSync(join(rootDir, "examples", file), "utf-8");
      // YAMLの基本構造が保たれていることを確認
      expect(content).toMatch(/^name:/m);
      expect(content).toMatch(/^\s+uses:/m);
      expect(content).toMatch(/^\s+with:/m);
    });
  });
});
