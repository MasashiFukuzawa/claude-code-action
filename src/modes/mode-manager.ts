import type { Mode } from "./types";
import { BUILT_IN_MODES } from "./built-in-modes";

export class ModeManager {
  private modes: Map<string, Mode>;

  constructor() {
    this.modes = new Map();
    this.initializeBuiltInModes();
  }

  private initializeBuiltInModes(): void {
    Object.values(BUILT_IN_MODES).forEach((mode) => {
      this.modes.set(mode.slug, mode);
    });
  }

  getModeBySlug(slug: string): Mode {
    const mode = this.modes.get(slug);
    if (!mode) {
      throw new Error(`Mode not found: ${slug}`);
    }
    return mode;
  }

  getAllModes(): Mode[] {
    return Array.from(this.modes.values());
  }

  getDefaultMode(): Mode {
    return this.getModeBySlug("code");
  }

  getBuiltInModes(): Mode[] {
    return Object.values(BUILT_IN_MODES);
  }
}

// Singleton instance
export const modeManager = new ModeManager();
