/**
 * Visual compliance — the gate that decides whether a layout is fit to render.
 *
 * WHY THIS EXISTS
 * The quality score that shipped before this was not a measurement. `visualQuality`
 * returned `60 + dataIntegrity * 0.4` and never looked at anything — it scored a dark,
 * twelve-times-truncated page 100/100, and it scores a BLANK page 100/100 too, because
 * a blank page has no OCR numbers to contradict. A number produced that way is worse
 * than no number, because it stops anyone looking.
 *
 * So this module measures the LAYOUT PLAN, deterministically, before a single token is
 * spent on an image:
 *
 *   - every glyph is above the legibility floor for its role
 *   - every text element is backed by an opaque panel (no type on raw illustration)
 *   - text elements do not overlap each other
 *   - text is inside the canvas
 *   - foreground/background contrast clears WCAG AA
 *   - ellipsis density stays under the cap (prose was cut, not written)
 *
 * No LLM is involved. These are assertions with a right answer, in the spirit of
 * `/eval`: deterministic verification, never a model asked whether it likes the look.
 *
 * Failures are ACTIONABLE — each names the repair the caller should apply — so the
 * pipeline can degrade the plan and re-check rather than shipping something sub-par
 * or giving up.
 */
import type { LayoutPlan, TextElement, Band } from "./layout-planner";

// ── Thresholds ────────────────────────────────────────────────────────

/**
 * Minimum rendered glyph size, expressed against a 1920px-wide canvas and scaled
 * with it. 16px body on a 1920 canvas is roughly 10pt on an A4 print — the floor
 * below which an institutional document stops being readable.
 */
export const FLOOR = {
  body: 14,
  label: 13,
  heading: 18,
  title: 28,
  /** KPI values are large by design but need no title-sized floor. */
  kpi: 22,
  caption: 11,
} as const;

/** Above this share of prose ending in an ellipsis, the page is over-truncated. */
export const MAX_ELLIPSIS_RATIO = 0.34;

/** WCAG AA for normal text. Large text (>=24px bold) may use 3.0. */
export const MIN_CONTRAST = 4.5;
export const MIN_CONTRAST_LARGE = 3.0;

export type ComplianceIssue = {
  check: string;
  severity: "blocker" | "warning";
  detail: string;
  /** What the caller should change to clear it. */
  repair:
    "fewer_sections" | "fewer_lines" | "larger_canvas" | "fix_palette" | "none";
};

export type ComplianceReport = {
  passed: boolean;
  issues: ComplianceIssue[];
  measured: {
    elements: number;
    panels: number;
    smallestFont: number;
    ellipsisRatio: number;
    minContrast: number;
    unbackedText: number;
    overlaps: number;
  };
};

// ── Contrast (WCAG 2.1 relative luminance) ────────────────────────────

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return 0;
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

export function contrastRatio(fg: string, bg: string): number {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

// ── Geometry ──────────────────────────────────────────────────────────

/**
 * The box an element actually occupies.
 *
 * Using `maxLines` here over-measured every short string — a one-line label declared
 * `maxLines: 2` was boxed at double height and appeared to collide with the line
 * beneath it, producing 58 phantom overlaps on a layout with none. Estimate the lines
 * the text really needs, capped by maxLines.
 */
const CHAR_W: Record<TextElement["fontFamily"], number> = {
  Arial: 0.52,
  "Arial Narrow": 0.45,
};

function elementBox(el: TextElement, lineHeight = 1.35) {
  const cpl = Math.max(
    1,
    Math.floor(el.width / (el.fontSize * CHAR_W[el.fontFamily])),
  );
  const needed = Math.max(1, Math.ceil((el.text?.length ?? 0) / cpl));
  const lines = Math.min(el.maxLines ?? 1, needed);
  return {
    x1: el.x,
    y1: el.y,
    x2: el.x + el.width,
    y2: el.y + el.fontSize * lineHeight * lines,
  };
}

function overlaps(
  a: ReturnType<typeof elementBox>,
  b: ReturnType<typeof elementBox>,
): boolean {
  return !(a.x2 <= b.x1 || b.x2 <= a.x1 || a.y2 <= b.y1 || b.y2 <= a.y1);
}

/** The opaque band a text element sits on, if any. Later bands paint over earlier. */
function backingBand(el: TextElement, bands: Band[]): Band | undefined {
  const box = elementBox(el);
  const cx = (box.x1 + box.x2) / 2;
  const cy = (box.y1 + box.y2) / 2;
  let found: Band | undefined;
  for (const b of bands) {
    // A 2px rule is a divider, not a backing surface.
    if (b.height <= 4) continue;
    if (cx >= b.x && cx <= b.x + b.width && cy >= b.y && cy <= b.y + b.height) {
      found = b;
    }
  }
  return found;
}

/**
 * The legibility floor for an element, chosen by its ROLE.
 *
 * This used to infer the role from font size — `if (el.fontSize >= 30) return
 * FLOOR.title` — which is circular: it demanded that anything 30px or larger be at
 * least 34px, so a perfectly good 30px KPI value was reported as "below the 34px
 * floor". Captions were judged against the body floor for the same reason. Roles are
 * declared by the planner; measure against what a thing IS.
 */
function floorFor(el: TextElement): number {
  switch (el.role) {
    case "title":
      return FLOOR.title;
    case "kpi":
      return FLOOR.kpi;
    case "caption":
    case "subtitle":
      return FLOOR.caption;
    case "heading":
      return FLOOR.heading;
    case "label":
      return FLOOR.label;
    case "body":
      return FLOOR.body;
    default:
      // Untagged elements are held to the body floor, the strictest sensible default.
      return FLOOR.body;
  }
}

// ── The gate ──────────────────────────────────────────────────────────

export function checkVisualCompliance(plan: LayoutPlan): ComplianceReport {
  const issues: ComplianceIssue[] = [];
  const scale = plan.width / 1920;
  const els = plan.elements.filter((e) => e.text && e.text.trim().length > 0);
  const bands = plan.bands ?? [];

  // 1. Legibility floor.
  let smallestFont = Infinity;
  for (const el of els) {
    smallestFont = Math.min(smallestFont, el.fontSize);
    const floor = Math.round(floorFor(el) * scale);
    if (el.fontSize < floor) {
      issues.push({
        check: "font-floor",
        severity: "blocker",
        detail: `"${el.text.slice(0, 40)}" is ${el.fontSize}px, below the ${floor}px floor`,
        repair: "fewer_sections",
      });
    }
  }

  // 2. Every text element must sit on an opaque panel. Type over raw illustration
  //    is the defect that made the first institutional render unreadable.
  let unbacked = 0;
  let minContrast = Infinity;
  for (const el of els) {
    const band = backingBand(el, bands);
    if (!band) {
      unbacked++;
      issues.push({
        check: "text-backing",
        severity: "blocker",
        detail: `"${el.text.slice(0, 40)}" sits on raw illustration with no opaque panel behind it`,
        repair: "none",
      });
      continue;
    }
    const ratio = contrastRatio(el.color, band.color);
    minContrast = Math.min(minContrast, ratio);
    const isLarge = el.fontSize >= 24 * scale && el.fontWeight === 700;
    const need = isLarge ? MIN_CONTRAST_LARGE : MIN_CONTRAST;
    if (ratio < need) {
      issues.push({
        check: "contrast",
        severity: "blocker",
        detail: `"${el.text.slice(0, 30)}" ${el.color} on ${band.color} is ${ratio.toFixed(2)}:1, needs ${need}:1`,
        repair: "fix_palette",
      });
    }
  }

  // 3. Text must not collide with other text.
  let overlapCount = 0;
  // NOT `els.map(elementBox)` — map passes (value, index, array), so the index
  // landed in the `lineHeight` parameter: element 0 got lineHeight 0 and a
  // zero-height box that could never overlap, while element 20 got lineHeight 20 and
  // a box that overlapped everything. One bug, two opposite symptoms: a deliberate
  // collision went undetected while a clean layout reported 51 phantom overlaps.
  const boxes = els.map((e) => elementBox(e));
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      if (overlaps(boxes[i], boxes[j])) {
        overlapCount++;
        if (overlapCount <= 3) {
          issues.push({
            check: "text-overlap",
            severity: "blocker",
            detail: `"${els[i].text.slice(0, 24)}" overlaps "${els[j].text.slice(0, 24)}"`,
            repair: "fewer_lines",
          });
        }
      }
    }
  }

  // 4. Nothing outside the canvas.
  for (const el of els) {
    const box = elementBox(el);
    if (
      box.x1 < 0 ||
      box.y1 < 0 ||
      box.x2 > plan.width + 1 ||
      box.y2 > plan.height + 1
    ) {
      issues.push({
        check: "out-of-bounds",
        severity: "blocker",
        detail: `"${el.text.slice(0, 30)}" extends outside the ${plan.width}x${plan.height} canvas`,
        repair: "fewer_lines",
      });
    }
  }

  // 5. Over-truncation. Honest ellipses beat amputation, but a page mostly made of
  //    them means the content was cut rather than written.
  const prose = els.filter(
    (e) => e.role === "body" && e.text.length > 24,
  );
  const cut = prose.filter((e) => e.text.trimEnd().endsWith("…"));
  const ellipsisRatio = prose.length > 0 ? cut.length / prose.length : 0;
  if (ellipsisRatio > MAX_ELLIPSIS_RATIO) {
    issues.push({
      check: "over-truncation",
      severity: "blocker",
      detail: `${cut.length}/${prose.length} prose blocks end in an ellipsis (cap ${Math.round(MAX_ELLIPSIS_RATIO * 100)}%)`,
      repair: "fewer_lines",
    });
  }

  // 6. A page with nothing on it is not a passing page. The blank-artifact case that
  //    every previous gate in this estate waved through.
  if (els.length < 4) {
    issues.push({
      check: "empty-page",
      severity: "blocker",
      detail: `Only ${els.length} text elements — the page is effectively blank`,
      repair: "none",
    });
  }
  if (bands.length === 0) {
    issues.push({
      check: "no-panels",
      severity: "blocker",
      detail:
        "No opaque panels were planned; all text would sit on raw illustration",
      repair: "none",
    });
  }

  const blockers = issues.filter((i) => i.severity === "blocker");

  return {
    passed: blockers.length === 0,
    issues,
    measured: {
      elements: els.length,
      panels: bands.filter((b) => b.height > 4).length,
      smallestFont: Number.isFinite(smallestFont) ? smallestFont : 0,
      ellipsisRatio: Number(ellipsisRatio.toFixed(3)),
      minContrast: Number.isFinite(minContrast)
        ? Number(minContrast.toFixed(2))
        : 0,
      unbackedText: unbacked,
      overlaps: overlapCount,
    },
  };
}

/** One-line summary for the pipeline trace. */
export function formatCompliance(r: ComplianceReport): string {
  const m = r.measured;
  return (
    `${r.passed ? "PASS" : "FAIL"} | ${m.elements} elements, ${m.panels} panels, ` +
    `min font ${m.smallestFont}px, min contrast ${m.minContrast}:1, ` +
    `ellipsis ${Math.round(m.ellipsisRatio * 100)}%, overlaps ${m.overlaps}, ` +
    `unbacked ${m.unbackedText}` +
    (r.passed
      ? ""
      : ` | ${r.issues.filter((i) => i.severity === "blocker").length} blockers`)
  );
}
