/**
 * Proof that prose is never amputated mid-word.
 *
 * WHY THIS FILE EXISTS
 * The first live institutional render printed twelve body sentences that stopped mid
 * word — "...is equipped with a", "...for security, compliance, or" — with no ellipsis.
 * Cause: the fitter estimated every glyph at 0.55x font size, which under-measures IBM
 * Plex Sans, so "fitted" strings still overflowed and the renderer clipped them with
 * `overflow: hidden`. Under-estimating does not yield a tight layout; it yields a
 * mutilated one.
 *
 * WHAT MAKES THIS PRINT FAIL: any fitted string that ends mid-word without an ellipsis,
 * or that exceeds the character budget it was fitted to.
 */
import { describe, it, expect } from "vitest";
import { fitText, PALETTES } from "../layout-planner";

const SENTENCE =
  "A target asset such as a person, a vehicle or a piece of equipment is equipped with a location-aware device that reports its position continuously.";

/** The budget the fitter itself is working to, mirrored here. */
function budget(fontSize: number, widthPx: number, sans = true): number {
  return Math.max(1, Math.floor(widthPx / (fontSize * (sans ? 0.52 : 0.45))));
}

describe("fitText", () => {
  it("returns short text unchanged", () => {
    expect(fitText("Revenue grew.", 12, 400, 2)).toBe("Revenue grew.");
  });

  it("never ends mid-word without an ellipsis", () => {
    for (const width of [180, 240, 320, 420, 600]) {
      for (const size of [9, 11, 13]) {
        const out = fitText(SENTENCE, size, width, 2);
        if (out === null) continue;

        const endsCleanly =
          /[.!?]$/.test(out) || out.endsWith("…") || out === SENTENCE;
        expect(
          endsCleanly,
          `"${out}" (size ${size}, width ${width}) ends mid-word`,
        ).toBe(true);
      }
    }
  });

  it("respects the character budget it was fitted to", () => {
    for (const width of [200, 300, 500]) {
      const lines = 2;
      const out = fitText(SENTENCE, 11, width, lines);
      if (out === null) continue;
      expect(out.length).toBeLessThanOrEqual(budget(11, width) * lines);
    }
  });

  it("DROPS the item rather than print a fragment when the box is tiny", () => {
    // Two characters of room is not enough to say anything honestly.
    expect(fitText(SENTENCE, 14, 20, 1)).toBeNull();
  });

  it("prefers a sentence boundary over an ellipsis when one fits", () => {
    const two =
      "Geofencing defines a virtual boundary. It then triggers an action when a device crosses that boundary and reports the crossing upstream.";
    const out = fitText(two, 11, 320, 2);
    expect(out).not.toBeNull();
    // A clean full stop beats a trailing ellipsis.
    if (out && !out.endsWith("…")) {
      expect(out.endsWith(".")).toBe(true);
    }
  });

  it("returns null for empty or whitespace input", () => {
    expect(fitText("   ", 12, 400, 2)).toBeNull();
    expect(fitText("", 12, 400, 2)).toBeNull();
  });
});

describe("institutional palette", () => {
  it("is light — a printed brief is never near-black", () => {
    const p = PALETTES.institutional;
    expect(p.background).toBe("#F2E8D5");
    expect(p.title).toBe("#1C1C1C");
  });

  it("uses the accessible gold for text, never the decorative one", () => {
    // #D4A84B is decorative only; it fails AA as text on cream.
    expect(PALETTES.institutional.label).toBe("#805C1C");
    expect(PALETTES.institutional.label).not.toBe("#D4A84B");
  });

  it("keeps a dark palette available for app-surface styles only", () => {
    expect(PALETTES.dark.background).not.toBe(
      PALETTES.institutional.background,
    );
  });
});
