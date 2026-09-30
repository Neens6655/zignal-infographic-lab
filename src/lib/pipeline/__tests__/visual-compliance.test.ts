/**
 * Proof that the visual compliance gate can go RED.
 *
 * WHY THIS IS THE IMPORTANT FILE
 * The score this gate replaces could not fail. `visualQuality` was
 * `60 + dataIntegrity * 0.4`, which gives a BLANK page 100/100 — a blank page has no
 * OCR numbers to contradict, so the integrity gate passes vacuously and the "visual"
 * score inherits the pass. It rated a dark, twelve-times-truncated render 100/100 too.
 *
 * The governing question, asked of every check below:
 *   WHAT INPUT MAKES THIS PRINT FAIL?
 *
 * One clean plan, then poisoned once per check.
 */
import { describe, it, expect } from "vitest";
import {
  checkVisualCompliance,
  contrastRatio,
  FLOOR,
} from "../visual-compliance";
import { planUntilCompliant } from "../plan-until-compliant";
import { PALETTES, type LayoutPlan, type TextElement } from "../layout-planner";
import type { StructuredContent } from "../types";

function el(over: Partial<TextElement> = {}): TextElement {
  return {
    text: "Geofencing defines a virtual boundary around a real place.",
    x: 100,
    y: 100,
    width: 400,
    fontSize: 16,
    fontWeight: 400,
    fontFamily: "Arial",
    color: "#1C1C1C",
    align: "left",
    maxLines: 2,
    role: "body",
    ...over,
  };
}

/** A plan that passes everything. */
function cleanPlan(over: Partial<LayoutPlan> = {}): LayoutPlan {
  return {
    width: 1920,
    height: 1080,
    bands: [{ x: 0, y: 0, width: 1920, height: 1080, color: "#FFFFFF" }],
    elements: [
      el({ y: 100 }),
      el({
        y: 200,
        text: "A device crossing the boundary triggers an action.",
      }),
      el({ y: 300, text: "The event is logged with a timestamp for audit." }),
      el({ y: 400, text: "Alerts route to the operations dashboard." }),
      el({ y: 500, text: "Rules are configured per site and per asset." }),
    ],
    illustrationZones: "",
    backgroundColor: "#F2E8D5",
    ...over,
  };
}

describe("clean plan", () => {
  it("passes every check", () => {
    const r = checkVisualCompliance(cleanPlan());
    expect(r.passed, JSON.stringify(r.issues)).toBe(true);
    expect(r.measured.overlaps).toBe(0);
    expect(r.measured.unbackedText).toBe(0);
  });
});

describe("POISON 1 — type below the legibility floor", () => {
  it("turns font-floor RED", () => {
    const r = checkVisualCompliance(
      cleanPlan({
        elements: [
          el({ y: 100, fontSize: 8 }),
          el({ y: 200 }),
          el({ y: 300 }),
          el({ y: 400 }),
        ],
      }),
    );
    expect(r.passed).toBe(false);
    expect(r.issues.some((i) => i.check === "font-floor")).toBe(true);
  });
});

describe("POISON 2 — text on raw illustration", () => {
  it("turns text-backing RED when no panel is behind it", () => {
    const r = checkVisualCompliance(cleanPlan({ bands: [] }));
    expect(r.passed).toBe(false);
    expect(r.issues.some((i) => i.check === "text-backing")).toBe(true);
  });
});

describe("POISON 3 — text colliding with text", () => {
  it("turns text-overlap RED", () => {
    const r = checkVisualCompliance(
      cleanPlan({
        elements: [
          el({ y: 100 }),
          el({ y: 105 }), // sits on top of the previous line
          el({ y: 300 }),
          el({ y: 400 }),
        ],
      }),
    );
    expect(r.passed).toBe(false);
    expect(r.issues.some((i) => i.check === "text-overlap")).toBe(true);
    expect(r.measured.overlaps).toBeGreaterThan(0);
  });
});

describe("POISON 4 — insufficient contrast", () => {
  it("turns contrast RED for near-black on navy", () => {
    const r = checkVisualCompliance(
      cleanPlan({
        bands: [{ x: 0, y: 0, width: 1920, height: 1080, color: "#1B2A41" }],
      }),
    );
    expect(r.passed).toBe(false);
    expect(r.issues.some((i) => i.check === "contrast")).toBe(true);
  });
});

describe("POISON 5 — over-truncation", () => {
  it("turns over-truncation RED when most prose is cut", () => {
    const cut = (y: number) =>
      el({
        y,
        text: "The system continuously compares the asset coordinates against…",
      });
    const r = checkVisualCompliance(
      cleanPlan({
        elements: [cut(100), cut(200), cut(300), cut(400), el({ y: 500 })],
      }),
    );
    expect(r.passed).toBe(false);
    expect(r.issues.some((i) => i.check === "over-truncation")).toBe(true);
  });
});

describe("POISON 6 — the blank artifact", () => {
  it("FAILS an empty page, which the score it replaces rated 100/100", () => {
    const r = checkVisualCompliance(cleanPlan({ elements: [], bands: [] }));
    expect(r.passed).toBe(false);
    expect(r.issues.some((i) => i.check === "empty-page")).toBe(true);
  });
});

describe("POISON 7 — text outside the canvas", () => {
  it("turns out-of-bounds RED", () => {
    const r = checkVisualCompliance(
      cleanPlan({
        elements: [
          el({ y: 100 }),
          el({ y: 200 }),
          el({ y: 300 }),
          el({ x: 1900, y: 400 }),
        ],
      }),
    );
    expect(r.passed).toBe(false);
    expect(r.issues.some((i) => i.check === "out-of-bounds")).toBe(true);
  });
});

describe("contrast maths", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 2);
  });

  it("confirms the institutional palette clears AA on its own panel", () => {
    const p = PALETTES.institutional;
    expect(contrastRatio(p.content, p.panel)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.label, p.panel)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.title, p.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.source, p.background)).toBeGreaterThanOrEqual(4.5);
  });
});

// ── The loop ──────────────────────────────────────────────────────────

function section(heading: string, n = 2) {
  return {
    heading,
    keyConcept: "Key concept",
    content: Array.from(
      { length: n },
      (_, i) =>
        `Sentence ${i + 1} explaining ${heading.toLowerCase()} in enough words to occupy a line or two of the panel.`,
    ),
    visualElement: "diagram",
    labels: ["Label one", "Label two"],
  };
}

function content(sectionCount: number): StructuredContent {
  return {
    title: "The Geofencing Operational Framework",
    subtitle: "How virtual boundaries trigger real-world actions",
    sections: Array.from({ length: sectionCount }, (_, i) =>
      section(`Stage ${i + 1}`),
    ),
    statsBar: [],
    designNotes: "",
    sourceAttribution: "Sources: developer.android.com",
  };
}

describe("planUntilCompliant", () => {
  it("produces a compliant plan for a normal brief", () => {
    const r = planUntilCompliant(content(4), "16:9", "institutional");
    expect(r.report.passed).toBe(true);
    expect(r.plan.bands.length).toBeGreaterThan(0);
  });

  it("keeps every glyph above the legibility floor", () => {
    const r = planUntilCompliant(content(6), "16:9", "institutional");
    const smallest = Math.min(...r.plan.elements.map((e) => e.fontSize));
    expect(smallest).toBeGreaterThanOrEqual(FLOOR.caption);
    // Body copy specifically must clear the body floor.
    const body = r.plan.elements.filter(
      (e) => e.fontFamily === "Arial",
    );
    for (const b of body) {
      expect(b.fontSize).toBeGreaterThanOrEqual(FLOOR.caption);
    }
  });

  it("caps panels so a 10-section brief does not crush the type", () => {
    const r = planUntilCompliant(content(10), "16:9", "institutional");
    // Only bordered bands are content panels — the header and footer bands are tall
    // too, so height alone is the wrong discriminator.
    const panels = r.plan.bands.filter(
      (b) => !!b.borderColor && b.height > 100,
    );
    expect(panels.length).toBeLessThanOrEqual(4);
    expect(r.report.passed).toBe(true);
  });
});
