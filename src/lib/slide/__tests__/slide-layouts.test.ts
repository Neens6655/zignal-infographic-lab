/**
 * Every slide layout must pass the hygiene gate on a realistic spec.
 *
 * Run 3 found three KPI-value-over-caption collisions across two layouts, all from
 * caption offsets written as magic numbers a pixel or two short of the value's
 * rendered height. The gate caught them live, at image-generation cost. This catches
 * them at test cost, with figures of the shape the structurer actually emits.
 */
import { describe, it, expect } from "vitest";
import { SLIDE_LAYOUTS, SLIDE_VARIANTS, layoutFlow } from "../slide-layouts";
import { elementBox } from "../../pipeline/visual-compliance";
import { checkVisualCompliance } from "../../pipeline/visual-compliance";
import type { SlideSpec } from "../slide-spec";

const SPEC: SlideSpec = {
  tracker: "GCC DATA CENTRES",
  actionTitle:
    "Saudi Arabia targets tripling its data-centre capacity to 1.3–1.5 GW by 2030, driven by national strategy.",
  subtitle: "Live capacity, announced investment and the largest operators across the Gulf",
  keyFigures: [
    { value: "467 MW", label: "Saudi live capacity, Q1 2026" },
    { value: "1.3–1.5 GW", label: "Saudi 2030 capacity target" },
    { value: ">400 MW", label: "UAE live capacity, Jan 2026" },
    { value: "$30bn+", label: "Announced investment to 2030" },
  ],
  evidence: [
    { heading: "Capacity is concentrated in two markets", body: "The UAE and Saudi Arabia together hold the large majority of the region's live colocation capacity today." },
    { heading: "Investment commitments are already made", body: "Announced programmes from sovereign and private operators exceed thirty billion dollars through the decade." },
    { heading: "One operator sets the pace", body: "HUMAIN's stated 2030 target alone would make it the largest single operator in the region." },
    { heading: "Power, not land, is the constraint", body: "Grid allocation and cooling capacity, not real estate, determine how fast announced sites come online." },
  ],
  steps: ["Secure grid allocation", "Break ground on hyperscale sites", "Commission in phases", "Scale to 2030 target"],
  visualBriefs: [
    "two server racks side by side, the right one taller, a rising dashed arrow between them",
    "a map outline with two highlighted regions and a cluster of small building icons in each",
    "a horizontal timeline of three growing bars",
  ],
  sourceLine: "Source: vision2030.ai; pwc.com; agbi.com (2025–26)",
  sources: [],
};

describe("slide layouts pass the hygiene gate", () => {
  for (const v of SLIDE_VARIANTS) {
    it(`${v}: no overlaps, no unbacked text, fonts above floor, AA contrast`, () => {
      const r = checkVisualCompliance(SLIDE_LAYOUTS[v](SPEC));
      expect(r.passed, r.issues.map((i) => `[${i.check}] ${i.detail}`).join("\n")).toBe(true);
      expect(r.measured.overlaps).toBe(0);
      expect(r.measured.unbackedText).toBe(0);
    });
  }

  it("flow falls back to evidence headings when the spec has no steps", () => {
    const r = checkVisualCompliance(SLIDE_LAYOUTS.flow({ ...SPEC, steps: [] }));
    expect(r.passed, r.issues.map((i) => i.detail).join("\n")).toBe(true);
  });

  it("centered survives a single key figure", () => {
    const r = checkVisualCompliance(SLIDE_LAYOUTS.centered({ ...SPEC, keyFigures: SPEC.keyFigures.slice(0, 1) }));
    expect(r.passed, r.issues.map((i) => i.detail).join("\n")).toBe(true);
  });
});

describe("flow — carries the numbers", () => {
  it("places every key figure on the slide (run-4: >120 MW was missing 8/8, structurally)", () => {
    const texts = layoutFlow(SPEC).elements.map((e) => e.text);
    for (const f of SPEC.keyFigures) {
      expect(texts, `missing figure ${f.value}`).toContain(f.value);
    }
  });
});

describe("no band may cover the canvas", () => {
  // Third occurrence of the same bug: an opaque full-size band in the text layer hid
  // the illustration in every run while every score was computed on the text alone.
  it.each(SLIDE_VARIANTS)("%s has no band covering most of the slide", (v) => {
    const plan = SLIDE_LAYOUTS[v](SPEC);
    const canvas = plan.width * plan.height;
    const offenders = plan.bands.filter(
      (b) => b.color !== "transparent" && (b.width * b.height) / canvas > 0.5,
    );
    expect(offenders, JSON.stringify(offenders)).toHaveLength(0);
  });
});

describe("illustration rectangles", () => {
  // The guarantee that replaces "please keep the text area white": the plate is cut
  // to these rectangles, so if none of them intersects a text box the illustration
  // cannot touch the text. Run 7: the model drew under the key figures on every
  // attempt of every variant.
  it.each(SLIDE_VARIANTS)("%s: every rect is inside the canvas and clear of every text box", (v) => {
    const plan = SLIDE_LAYOUTS[v](SPEC);
    const rects = plan.illustrationRects ?? [];
    expect(rects.length, "at least one rect").toBeGreaterThan(0);
    for (const r of rects) {
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.w).toBeLessThanOrEqual(plan.width);
      expect(r.y + r.h).toBeLessThanOrEqual(plan.height);
      expect(r.w * r.h, "rect has area").toBeGreaterThan(10000);
      for (const el of plan.elements) {
        if (!el.text?.trim()) continue;
        const b = elementBox(el);
        const hit = !(b.x2 <= r.x || r.x + r.w <= b.x1 || b.y2 <= r.y || r.y + r.h <= b.y1);
        expect(hit, `${v}: rect ${JSON.stringify(r)} intersects "${el.text.slice(0, 30)}" ${JSON.stringify(b)}`).toBe(false);
      }
    }
  });
});

describe("one brief per rect", () => {
  it.each(SLIDE_VARIANTS)("%s", (v) => {
    const plan = SLIDE_LAYOUTS[v](SPEC);
    expect(plan.illustrationBriefs?.length).toBe(plan.illustrationRects?.length);
    for (const b of plan.illustrationBriefs ?? []) expect(b).toContain("DRAW EXACTLY THIS");
  });
});

describe("flow bodies never end in an ellipsis (run 9 blocker)", () => {
  it("fits the run-9 sentences by stepping down the ladder", () => {
    const bodies: string[] = ["The Kingdom’s official national objective is to reach approximately 1.5 GW of data-centre capacity by 2030, driving a large-scale construction pipeline.","The UAE is the current regional hub with over 400 MW of operational capacity, representing more than 45% of total GCC IT power.","Publicly announced AI-related data-centre investments across the GCC exceed $30 billion through 2030, fueling development of purpose-built, high-density facilities.","A concentrated group of large operators including Khazna, center3, and DataVolt lead capacity expansion, though announced projects often precede operational commissioning."];
    const spec = {
      ...SPEC,
      steps: [],
      evidence: bodies.map((body, i) => ({ heading: `Point ${i + 1}`, body })),
    };
    const plan = layoutFlow(spec);
    const lane = plan.elements.filter((e) => e.role === "body");
    expect(lane.length).toBe(4);
    for (const e of lane) expect(e.text.endsWith("…"), e.text).toBe(false);
    const c = checkVisualCompliance(plan);
    expect(c.passed, JSON.stringify(c.issues)).toBe(true);
  });
});
