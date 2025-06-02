import { describe, test, expect, beforeEach } from "bun:test";
import { ModeManager } from "../../src/modes/mode-manager";
import { BUILT_IN_MODES } from "../../src/modes/built-in-modes";

describe("ModeManager", () => {
  let manager: ModeManager;

  beforeEach(() => {
    manager = new ModeManager();
  });

  test("should initialize with built-in modes", () => {
    const allModes = manager.getAllModes();
    expect(allModes.length).toBe(5);

    const slugs = allModes.map((m) => m.slug);
    expect(slugs).toContain("code");
    expect(slugs).toContain("architect");
    expect(slugs).toContain("debug");
    expect(slugs).toContain("ask");
    expect(slugs).toContain("orchestrator");
  });

  test("should get mode by slug", () => {
    const codeMode = manager.getModeBySlug("code");
    expect(codeMode).toEqual(BUILT_IN_MODES.CODE);

    const architectMode = manager.getModeBySlug("architect");
    expect(architectMode).toEqual(BUILT_IN_MODES.ARCHITECT);
  });

  test("should throw error for unknown mode", () => {
    expect(() => manager.getModeBySlug("unknown")).toThrow(
      "Mode not found: unknown",
    );
  });

  test("should get default mode", () => {
    const defaultMode = manager.getDefaultMode();
    expect(defaultMode.slug).toBe("code");
  });
});
