import { describe, test, expect } from "bun:test";
import { modeManager } from "../../src/modes";

describe("Mode System Integration", () => {
  test("should handle mode switching workflow", () => {
    // デフォルトモードから開始
    const defaultMode = modeManager.getDefaultMode();
    expect(defaultMode.slug).toBe("code");

    // アーキテクトモードに切り替え
    const architectMode = modeManager.getModeBySlug("architect");
    expect(architectMode.groups).not.toContain("write_operations");

    // デバッグモードに切り替え
    const debugMode = modeManager.getModeBySlug("debug");
    expect(debugMode.groups).toContain("diagnostic_tools");
  });
});
