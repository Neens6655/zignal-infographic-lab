/**
 * Four consulting-slide layouts for one SlideSpec.
 *
 * Shared chrome on every variant — the McKinsey grammar a C-suite reader has seen a
 * thousand times and therefore reads without effort:
 *   tracker (small caps, top-left) · ACTION TITLE (the conclusion, two lines max) ·
 *   subtitle · hairline rule · body · source line (bottom-left).
 *
 * The four differ in how the BODY makes the argument:
 *   CENTERED  one hero figure the eye cannot miss, supporting figures beneath
 *   ACROSS    the figures as nodes on a horizontal line spanning the slide — a sequence
 *   BOXES     a framework: evidence points as equal cards, figures as a strip above
 *   FLOW      numbered steps with chevrons and a vignette per step — a process
 *
 * White ground, near-black type, one accent. Arial. The illustration is confined to a
 * named zone per variant and is told so; the text carries the slide.
 */
import type { SlideSpec } from "./slide-spec";
import {
  fitLabel,
  fitTextLadder,
  fitText,
  estimateTextHeight,
  type LayoutPlan,
  type TextElement,
  type Band,
} from "../pipeline/layout-planner";

export type SlideVariant = "centered" | "across" | "boxes" | "flow";
export const SLIDE_VARIANTS: SlideVariant[] = [
  "centered",
  "across",
  "boxes",
  "flow",
];

/** Measured on white: ink 16.6:1, grey 7.0:1, accent 10.4:1, rule is decorative. */
export const SLIDE_PALETTE = {
  background: "#FFFFFF",
  ink: "#1A1A1A",
  grey: "#5A5A5A",
  accent: "#1B3A6B",
  rule: "#D9D9D9",
  panel: "#F4F5F7",
  chevron: "#9AA5B5",
};

const W = 1920;
const H = 1080;
const M = 96; // outer margin
const FONT = "Arial" as const;

type Ctx = {
  bands: Band[];
  elements: TextElement[];
  bodyTop: number;
  bodyBottom: number;
};

// ── Shared chrome ─────────────────────────────────────────────────────

function chrome(spec: SlideSpec): Ctx {
  // NO full-canvas band. The text layer composites OVER the plate, so an opaque
  // canvas-sized band here hides the illustration completely — which it did, in six
  // runs, while every gate scored the text and the compositor's output stayed
  // byte-identical across iterations. The white ground comes from the plate itself
  // (the model is told to keep everything outside its zone pure white) and from the
  // compositor's solid fallback when there is no plate. Third occurrence of this bug
  // class (stepped-process, annotated-diagram, now slides); the layouts test now
  // forbids any band covering most of the canvas.
  const bands: Band[] = [];
  const elements: TextElement[] = [];

  elements.push({
    text: spec.tracker,
    x: M,
    y: 56,
    width: 900,
    fontSize: 13,
    fontWeight: 700,
    fontFamily: FONT,
    color: SLIDE_PALETTE.grey,
    align: "left",
    maxLines: 1,
    role: "caption",
  });

  const titleSize = 40;
  const titleW = W - M * 2 - 120;
  const title = fitLabel(spec.actionTitle, titleSize, titleW, 2, FONT);
  elements.push({
    text: title,
    x: M,
    y: 96,
    width: titleW,
    fontSize: titleSize,
    fontWeight: 700,
    fontFamily: FONT,
    color: SLIDE_PALETTE.ink,
    align: "left",
    maxLines: 2,
    role: "title",
  });
  let y = 96 + estimateTextHeight(title, titleSize, titleW, 2, FONT) + 14;

  if (spec.subtitle) {
    const sub = fitLabel(spec.subtitle, 18, titleW, 1, FONT);
    elements.push({
      text: sub,
      x: M,
      y,
      width: titleW,
      fontSize: 18,
      fontWeight: 400,
      fontFamily: FONT,
      color: SLIDE_PALETTE.grey,
      align: "left",
      maxLines: 1,
      role: "subtitle",
    });
    y += 18 * 1.35 + 18;
  } else {
    y += 10;
  }

  bands.push({
    x: M,
    y,
    width: W - M * 2,
    height: 2,
    color: SLIDE_PALETTE.rule,
  });
  const bodyTop = y + 40;

  const sourceY = H - 64;
  bands.push({
    x: M,
    y: sourceY - 18,
    width: W - M * 2,
    height: 1,
    color: SLIDE_PALETTE.rule,
  });
  elements.push({
    text: fitLabel(
      spec.sourceLine || "Source: see citations",
      13,
      W - M * 2,
      1,
      FONT,
    ),
    x: M,
    y: sourceY,
    width: W - M * 2,
    fontSize: 13,
    fontWeight: 400,
    fontFamily: FONT,
    color: SLIDE_PALETTE.grey,
    align: "left",
    maxLines: 1,
    role: "caption",
  });

  return { bands, elements, bodyTop, bodyBottom: sourceY - 40 };
}

type Rect = { x: number; y: number; w: number; h: number };

function finish(ctx: Ctx, rects: Rect[], briefs: string[]): LayoutPlan {
  if (briefs.length !== rects.length) throw new Error("finish: one brief per rect");
  return {
    width: W,
    height: H,
    bands: ctx.bands,
    elements: ctx.elements,
    illustrationZones: briefs.join("\n\n"),
    illustrationBriefs: briefs,
    backgroundColor: SLIDE_PALETTE.background,
    textGround: SLIDE_PALETTE.background,
    illustrationRects: rects.map((r) => ({
      x: Math.round(r.x),
      y: Math.round(r.y),
      w: Math.round(r.w),
      h: Math.round(r.h),
    })),
  };
}

const pct = (v: number, of: number) => Math.round((v / of) * 100);

/**
 * The drawing instruction for a zone. Comes from the spec's visualBriefs — noun
 * phrases describing a picture — and NEVER from slide text. The first live run put
 * the lane headings in the brief and the model rendered them verbatim into the
 * illustration, as text, which the slide then had to reject.
 */
/**
 * Positions in prose. The model transcribes anything that looks like a label into
 * the picture — it rendered "LANE 1 | (5%-35%) | LANE 2" verbatim — so geometry is
 * described without numerals or uppercase tokens.
 */
function region(z: { x: number; y: number; w: number; h: number }): string {
  const cx = (z.x + z.w / 2) / W;
  const cy = (z.y + z.h / 2) / H;
  const horiz = z.w / W > 0.8 ? 'spanning the full width' : cx < 0.4 ? 'on the left side' : cx > 0.6 ? 'on the right side' : 'in the centre';
  const vert = z.h / H > 0.6 ? 'from just under the heading to just above the footer' : cy < 0.4 ? 'in the upper part' : cy > 0.6 ? 'in the lower part' : 'in the middle';
  return `${horiz}, ${vert} of the canvas, leaving the surrounding margin plain white`;
}

function ordinalLane(i: number, n: number): string {
  const names = ['leftmost column', 'second column from the left', 'middle column', 'second column from the right', 'rightmost column'];
  if (n === 2) return i === 0 ? 'left column' : 'right column';
  if (n === 3) return ['left column', 'middle column', 'right column'][i];
  if (n === 4) return ['leftmost column', 'second column from the left', 'second column from the right', 'rightmost column'][i];
  return names[i] ?? `column ${i + 1}`;
}

function visual(spec: SlideSpec, i: number): string {
  const b = spec.visualBriefs ?? [];
  return b[i % Math.max(1, b.length)] || b[0] || "an abstract diagram of connected nodes and flows";
}

function plateBrief(subject: string): string {
  return `DRAW EXACTLY THIS: ${subject}
Draw that and nothing else — no generic server-cloud-chip process art, no decorative extras. The picture must show the comparison, change, flow or structure in the subject line so clearly that a viewer could describe it back without being told.

This image is ONE panel on a consulting slide; the typeset text lives outside it. Fill the canvas edge to edge with the diagram — a sparse or near-empty canvas is a failed render. Restraint applies to the PALETTE, never to how much is drawn.
Style: clean flat vector, thin consistent line weight, restrained palette of navy #1B3A6B, slate grey and one muted accent on a pure white background. No gradients, no glow, no 3D, no photographic texture. Think: a diagram from a McKinsey or BCG report.
ABSOLUTELY NO TEXT, LABELS, NUMBERS, OR LETTERS OF ANY KIND — the slide's own typesetting provides every word.`;
}

// ── CENTERED: one hero figure ─────────────────────────────────────────

export function layoutCentered(spec: SlideSpec): LayoutPlan {
  const ctx = chrome(spec);
  const { bands, elements, bodyTop, bodyBottom } = ctx;
  const hero = spec.keyFigures[0];
  const rest = spec.keyFigures.slice(1, 4);

  // Hero figure centred across the slide.
  const heroSize = 112;
  const heroY = bodyTop + 10;
  elements.push({
    text: hero.value,
    x: M,
    y: heroY,
    width: W - M * 2,
    fontSize: heroSize,
    fontWeight: 700,
    fontFamily: FONT,
    color: SLIDE_PALETTE.accent,
    align: "center",
    maxLines: 1,
    role: "kpi",
  });
  const labelY = heroY + Math.ceil(heroSize * 1.35) + 4;
  elements.push({
    text: fitLabel(hero.label, 20, W - M * 2, 1, FONT),
    x: M,
    y: labelY,
    width: W - M * 2,
    fontSize: 20,
    fontWeight: 400,
    fontFamily: FONT,
    color: SLIDE_PALETTE.grey,
    align: "center",
    maxLines: 1,
    role: "caption",
  });

  // Below the hero: supporting figures stacked on the left, the illustration on the
  // right. The old bottom strip was 9:1 — no image model composes for that, and the
  // crop cut every diagram's top off. A proper rectangle gets a proper picture.
  const rowTop = labelY + Math.ceil(20 * 1.35) + 36;
  const leftW = 560;
  const rowH = 96;
  rest.forEach((f, i) => {
    const y = rowTop + i * rowH;
    if (i > 0)
      bands.push({
        x: M,
        y: y - 14,
        width: leftW,
        height: 1,
        color: SLIDE_PALETTE.rule,
      });
    elements.push({
      text: f.value,
      x: M,
      y,
      width: leftW,
      fontSize: 40,
      fontWeight: 700,
      fontFamily: FONT,
      color: SLIDE_PALETTE.ink,
      align: "left",
      maxLines: 1,
      role: "kpi",
    });
    elements.push({
      text: fitLabel(f.label, 15, leftW, 1, FONT),
      x: M,
      y: y + Math.ceil(40 * 1.35) + 2,
      width: leftW,
      fontSize: 15,
      fontWeight: 400,
      fontFamily: FONT,
      color: SLIDE_PALETTE.grey,
      align: "left",
      maxLines: 1,
      role: "caption",
    });
  });

  const rect: Rect = {
    x: M + leftW + 80,
    y: rowTop - 10,
    w: W - M - (M + leftW + 80),
    h: bodyBottom - (rowTop - 10),
  };
  return finish(ctx, [rect], [plateBrief(visual(spec, 0))]);
}

// ── ACROSS: figures as nodes on a horizontal line ─────────────────────

export function layoutAcross(spec: SlideSpec): LayoutPlan {
  const ctx = chrome(spec);
  const { bands, elements, bodyTop, bodyBottom } = ctx;
  const nodes = spec.keyFigures.slice(0, 4);
  const n = Math.max(2, nodes.length);
  const lineY = bodyTop + 150;
  const innerW = W - M * 2;
  const step = innerW / n;

  bands.push({
    x: M,
    y: lineY - 2,
    width: innerW,
    height: 4,
    color: SLIDE_PALETTE.accent,
  });

  nodes.forEach((f, i) => {
    const cx = Math.round(M + step * i + step / 2);
    bands.push({
      x: cx - 11,
      y: lineY - 11,
      width: 22,
      height: 22,
      color: SLIDE_PALETTE.accent,
      borderRadius: 11,
    });
    const cellW = Math.round(step - 24);
    elements.push({
      text: f.value,
      x: cx - cellW / 2,
      y: lineY - 110,
      width: cellW,
      fontSize: 48,
      fontWeight: 700,
      fontFamily: FONT,
      color: SLIDE_PALETTE.ink,
      align: "center",
      maxLines: 1,
      role: "kpi",
    });
    elements.push({
      text: fitLabel(f.label, 16, cellW, 2, FONT),
      x: cx - cellW / 2,
      y: lineY + 28,
      width: cellW,
      fontSize: 16,
      fontWeight: 400,
      fontFamily: FONT,
      color: SLIDE_PALETTE.grey,
      align: "center",
      maxLines: 2,
      role: "caption",
    });
  });

  // Evidence as two short columns under the line, flanking the illustration zone.
  const evY = lineY + 110;
  const colW = 520;
  spec.evidence.slice(0, 2).forEach((e, i) => {
    const x = i === 0 ? M : W - M - colW;
    elements.push({
      text: fitLabel(e.heading, 18, colW, 1, FONT),
      x,
      y: evY,
      width: colW,
      fontSize: 18,
      fontWeight: 700,
      fontFamily: FONT,
      color: SLIDE_PALETTE.ink,
      align: "left",
      maxLines: 1,
      role: "heading",
    });
    const body = fitText(e.body, 16, colW, 3, FONT);
    if (body) {
      elements.push({
        text: body,
        x,
        y: evY + 30,
        width: colW,
        fontSize: 16,
        fontWeight: 400,
        fontFamily: FONT,
        color: SLIDE_PALETTE.grey,
        align: "left",
        maxLines: 3,
        role: "body",
      });
    }
  });

  const zone = {
    x: M + colW + 40,
    y: evY - 10,
    w: W - M * 2 - colW * 2 - 80,
    h: bodyBottom - evY + 10,
  };
  return finish(ctx, [zone], [plateBrief(`a compact diagram: ${visual(spec, 1)}`)]);
}

// ── BOXES: framework of evidence cards ────────────────────────────────

export function layoutBoxes(spec: SlideSpec): LayoutPlan {
  const ctx = chrome(spec);
  const { bands, elements, bodyTop, bodyBottom } = ctx;

  // Figure strip across the top of the body.
  const figs = spec.keyFigures.slice(0, 4);
  const stripY = bodyTop;
  const stripCell = Math.round((W - M * 2) / Math.max(1, figs.length));
  figs.forEach((f, i) => {
    const x = M + i * stripCell;
    elements.push({
      text: f.value,
      x,
      y: stripY,
      width: stripCell - 20,
      fontSize: 40,
      fontWeight: 700,
      fontFamily: FONT,
      color: SLIDE_PALETTE.accent,
      align: "left",
      maxLines: 1,
      role: "kpi",
    });
    elements.push({
      text: fitLabel(f.label, 15, stripCell - 20, 1, FONT),
      x,
      y: stripY + Math.ceil(40 * 1.35) + 6,
      width: stripCell - 20,
      fontSize: 15,
      fontWeight: 400,
      fontFamily: FONT,
      color: SLIDE_PALETTE.grey,
      align: "left",
      maxLines: 1,
      role: "caption",
    });
  });

  // Cards: evidence points, equal boxes, left two-thirds; illustration right third.
  const cards = spec.evidence.slice(0, 4);
  const cardsTop = stripY + 110;
  const cardsW = Math.round((W - M * 2) * 0.64);
  const gap = 20;
  const cols = cards.length >= 3 ? 2 : cards.length;
  const rows = Math.ceil(cards.length / cols);
  const cardW = Math.round((cardsW - gap * (cols - 1)) / cols);
  const cardH = Math.round((bodyBottom - cardsTop - gap * (rows - 1)) / rows);
  const pad = 24;

  cards.forEach((e, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = M + col * (cardW + gap);
    const y = cardsTop + row * (cardH + gap);
    bands.push({
      x,
      y,
      width: cardW,
      height: cardH,
      color: SLIDE_PALETTE.panel,
    });
    bands.push({ x, y, width: 6, height: cardH, color: SLIDE_PALETTE.accent });
    const head = fitLabel(e.heading, 20, cardW - pad * 2 - 6, 2, FONT);
    elements.push({
      text: head,
      x: x + pad + 6,
      y: y + pad,
      width: cardW - pad * 2 - 6,
      fontSize: 20,
      fontWeight: 700,
      fontFamily: FONT,
      color: SLIDE_PALETTE.ink,
      align: "left",
      maxLines: 2,
      role: "heading",
    });
    const headH = estimateTextHeight(head, 20, cardW - pad * 2 - 6, 2, FONT);
    const lines = Math.max(
      1,
      Math.min(4, Math.floor((cardH - pad * 2 - headH - 12) / (16 * 1.35))),
    );
    const body = fitText(e.body, 16, cardW - pad * 2 - 6, lines, FONT);
    if (body) {
      elements.push({
        text: body,
        x: x + pad + 6,
        y: y + pad + headH + 12,
        width: cardW - pad * 2 - 6,
        fontSize: 16,
        fontWeight: 400,
        fontFamily: FONT,
        color: SLIDE_PALETTE.grey,
        align: "left",
        maxLines: lines,
        role: "body",
      });
    }
  });

  const zone = {
    x: M + cardsW + 48,
    y: cardsTop,
    w: W - M * 2 - cardsW - 48,
    h: bodyBottom - cardsTop,
  };
  return finish(ctx, [zone], [plateBrief(`a vertical diagram: ${visual(spec, 2)}`)]);
}

// ── FLOW: numbered steps with chevrons and a vignette per step ────────

export function layoutFlow(spec: SlideSpec): LayoutPlan {
  const ctx = chrome(spec);
  const { bands, elements, bodyTop, bodyBottom } = ctx;

  const steps = (
    spec.steps.length >= 3 ? spec.steps : spec.evidence.map((e) => e.heading)
  ).slice(0, 5);
  const n = steps.length;
  const innerW = W - M * 2;
  const laneW = innerW / n;
  const badgeD = 56;

  // Figure strip FIRST. Run 4: the blind reader reported 3/4 figures on all eight flow
  // attempts, every time the same one — structurally, because this layout never placed
  // the key figures at all. A process slide still carries the numbers behind its title.
  const figs = spec.keyFigures.slice(0, 4);
  const stripCell = Math.round(innerW / Math.max(1, figs.length));
  const kpiSize = 34;
  const capSize = 14;
  figs.forEach((f, i) => {
    const x = M + i * stripCell;
    elements.push({
      text: f.value,
      x,
      y: bodyTop,
      width: stripCell - 20,
      fontSize: kpiSize,
      fontWeight: 700,
      fontFamily: FONT,
      color: SLIDE_PALETTE.accent,
      align: "left",
      maxLines: 1,
      role: "kpi",
    });
    elements.push({
      text: fitLabel(f.label, capSize, stripCell - 20, 1, FONT),
      x,
      y: bodyTop + Math.ceil(kpiSize * 1.35) + 4,
      width: stripCell - 20,
      fontSize: capSize,
      fontWeight: 400,
      fontFamily: FONT,
      color: SLIDE_PALETTE.grey,
      align: "left",
      maxLines: 1,
      role: "caption",
    });
  });
  const stripH = figs.length
    ? Math.ceil(kpiSize * 1.35) + 4 + Math.ceil(capSize * 1.35) + 30
    : 0;
  if (figs.length) {
    bands.push({
      x: M,
      y: bodyTop + stripH - 16,
      width: innerW,
      height: 1,
      color: SLIDE_PALETTE.rule,
    });
  }
  const badgeY = bodyTop + stripH;

  // Lane bodies: the tallest rung any lane needs sets the block height for all, so
  // the captions align and the vignette band above them yields exactly that room.
  const BODY_LADDER = [
    { fontSize: 15, maxLines: 3 },
    { fontSize: 14, maxLines: 4 },
    { fontSize: 14, maxLines: 5 },
  ];
  const laneTextW = Math.round(laneW - 40);
  const bodyBlockH = Math.max(
    ...steps.map((_, i) => {
      const ev = spec.evidence[i];
      if (!ev) return 0;
      const f = fitTextLadder(ev.body, BODY_LADDER, laneTextW, FONT);
      return Math.ceil(f.fontSize * 1.35 * f.maxLines);
    }),
    Math.ceil(15 * 1.35 * 3),
  );

  steps.forEach((s, i) => {
    const lx = M + laneW * i;
    const cx = Math.round(lx + laneW / 2);
    bands.push({
      x: cx - badgeD / 2,
      y: badgeY,
      width: badgeD,
      height: badgeD,
      color: SLIDE_PALETTE.accent,
      borderRadius: badgeD / 2,
    });
    elements.push({
      text: String(i + 1).padStart(2, "0"),
      x: cx - badgeD / 2,
      y: badgeY + 15,
      width: badgeD,
      fontSize: 22,
      fontWeight: 700,
      fontFamily: FONT,
      color: "#FFFFFF",
      align: "center",
      maxLines: 1,
      role: "label",
    });
    if (i < n - 1) {
      const sx = Math.round(cx + badgeD * 0.75);
      const sw = Math.round(laneW - badgeD * 1.5);
      bands.push({
        x: sx,
        y: badgeY + badgeD / 2 - 1,
        width: sw,
        height: 2,
        color: SLIDE_PALETTE.chevron,
      });
      bands.push({
        x: sx + sw - 12,
        y: badgeY + badgeD / 2 - 6,
        width: 12,
        height: 12,
        color: "transparent",
        borderColor: SLIDE_PALETTE.chevron,
        borderWidth: 2,
        rotate: 45,
      });
    }
    const textW = Math.round(laneW - 40);
    const head = fitLabel(s, 21, textW, 2, FONT);
    elements.push({
      text: head,
      x: lx + 20,
      y: badgeY + badgeD + 22,
      width: textW,
      fontSize: 21,
      fontWeight: 700,
      fontFamily: FONT,
      color: SLIDE_PALETTE.ink,
      align: "center",
      maxLines: 2,
      role: "heading",
    });
    const ev = spec.evidence[i];
    if (ev) {
      const fit = fitTextLadder(ev.body, BODY_LADDER, textW, FONT);
      elements.push({
        text: fit.text,
        x: lx + 20,
        y: bodyBottom - bodyBlockH - 10,
        width: textW,
        fontSize: fit.fontSize,
        fontWeight: 400,
        fontFamily: FONT,
        color: SLIDE_PALETTE.grey,
        align: "center",
        maxLines: fit.maxLines,
        role: "body",
      });
    }
  });

  // Vignette lane band between headings and captions: one plate per lane, each
  // fitted inside its own rectangle, so no vignette can cross into its neighbour.
  const laneTop = badgeY + badgeD + 22 + 21 * 1.35 * 2 + 24;
  const laneBottom = bodyBottom - bodyBlockH - 30;
  const laneRects: Rect[] = steps.map((_, i) => ({
    x: M + laneW * i + 16,
    y: laneTop,
    w: laneW - 32,
    h: laneBottom - laneTop,
  }));
  const laneBriefs = steps.map((_, i) => plateBrief(`a single self-contained vignette: ${visual(spec, i)}`));
  return finish(ctx, laneRects, laneBriefs);
}

export const SLIDE_LAYOUTS: Record<SlideVariant, (s: SlideSpec) => LayoutPlan> =
  {
    centered: layoutCentered,
    across: layoutAcross,
    boxes: layoutBoxes,
    flow: layoutFlow,
  };
