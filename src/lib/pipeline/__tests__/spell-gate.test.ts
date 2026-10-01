/**
 * Proof the spell gate catches the typo that actually shipped.
 *
 * A live render went out titled "GEQFENCING: THE VIRTUAL PERIMETER STRATEGY" — set
 * perfectly, at 40px, as the first thing a reader sees. Every gate passed it. The
 * glyphs matched the data exactly; the data was wrong.
 *
 * WHAT MAKES THIS PRINT FAIL: a headline word one edit away from a word the brief
 * itself used.
 */
import { describe, it, expect } from "vitest";
import { checkSpelling, applySpellFixes } from "../spell-gate";
import type { StructuredContent } from "../types";

const BRIEF =
  "Explain geofencing: what it is, how it works, and how businesses use it.";

function content(over: Partial<StructuredContent> = {}): StructuredContent {
  return {
    title: "Geofencing: The Virtual Perimeter Strategy",
    subtitle: "An executive overview of location-based triggers",
    sections: [
      {
        heading: "Establish the digital boundary",
        keyConcept: "",
        content: ["A geofence is a software-defined boundary."],
        visualElement: "",
        labels: [],
      },
    ],
    statsBar: [],
    designNotes: "",
    sourceAttribution: "",
    ...over,
  };
}

describe("spell gate", () => {
  it("passes clean copy", () => {
    expect(checkSpelling(content(), BRIEF)).toHaveLength(0);
  });

  it("CATCHES the GEQFENCING typo that shipped", () => {
    const bad = content({ title: "GEQFENCING: The Virtual Perimeter Strategy" });
    const issues = checkSpelling(bad, BRIEF);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].expected).toBe("geofencing");
  });

  it("corrects it and preserves the title's casing", () => {
    const bad = content({ title: "GEQFENCING: The Virtual Perimeter Strategy" });
    const { content: fixed, fixed: applied } = applySpellFixes(
      bad,
      checkSpelling(bad, BRIEF),
    );
    expect(applied).toHaveLength(1);
    expect(fixed.title).toBe("GEOFENCING: The Virtual Perimeter Strategy");
  });

  it("catches a corrupted section heading too", () => {
    const bad = content({
      sections: [
        {
          heading: "Establish the geofencng boundary",
          keyConcept: "",
          content: [],
          visualElement: "",
          labels: [],
        },
      ],
    });
    const issues = checkSpelling(bad, BRIEF);
    expect(issues.some((i) => i.expected === "geofencing")).toBe(true);
  });

  it("does NOT flag legitimate words absent from the brief", () => {
    // A gate that cries wolf gets switched off. Proper nouns and domain terms the
    // brief never used must pass untouched.
    const ok = content({
      title: "Geofencing Across Singapore And Rotterdam Terminals",
    });
    expect(checkSpelling(ok, BRIEF)).toHaveLength(0);
  });

  it("leaves body copy alone — only headlines are judged", () => {
    const bad = content({
      sections: [
        {
          heading: "Establish the boundary",
          keyConcept: "",
          content: ["A geqfence is a software-defined boundary."],
          visualElement: "",
          labels: [],
        },
      ],
    });
    expect(checkSpelling(bad, BRIEF)).toHaveLength(0);
  });
});
