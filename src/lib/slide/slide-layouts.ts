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
  const bands: Band[] = [
    { x: 0, y: 0, width: W, height: H, color: SLIDE_PALETTE.background },
  ];
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

function finish(ctx: Ctx, illustrationZones: string): LayoutPlan {
  return {
    width: W,
    height: H,
    bands: ctx.bands,
    elements: ctx.elements,
    illustrationZones,
    backgroundColor: SLIDE_PALETTE.background,
  };
}

const pct = (v: number, of: number) => Math.round((v / of) * 100);

function zoneBrief(
  zone: { x: number; y: number; w: number; h: number },
  subject: string,
): string {
  return `COMPOSITION — this is a consulting slide. The illustration is a SUPPORTING diagram, not the hero.
- Draw ONLY inside horizontal ${pct(zone.x, W)}%–${pct(zone.x + zone.w, W)}% and vertical ${pct(zone.y, H)}%–${pct(zone.y + zone.h, H)}% of the canvas.
- Everywhere else must be flat, pure WHITE (#FFFFFF). Typeset text sits there and must stay legible.
- Subject: ${subject}
- Style: clean flat vector, thin consistent line weight, restrained palette of navy #1B3A6B, slate grey and one muted accent on white. No gradients, no glow, no 3D, no photographic texture. Think: a diagram from a McKinsey or BCG report.
ABSOLUTELY NO TEXT, LABELS, NUMBERS, OR LETTERS OF ANY KIND — the slide's own typesetting provides every word.`;
}

// ── CENTERED: one hero figure ─────────────────────────────────────────

export function layoutCentered(spec: SlideSpec): LayoutPlan {
  const ctx = chrome(spec);
  const { bands, elements, bodyTop, bodyBottom } = ctx;
  const hero = spec.keyFigures[0];
  const rest = spec.keyFigures.slice(1, 4);

  const heroSize = 150;
  const heroY = bodyTop + 30;
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
  const labelY = heroY + Math.ceil(heroSize * 1.35) + 6;
  elements.push({
    text: fitLabel(hero.label, 22, W - M * 2, 1, FONT),
    x: M,
    y: labelY,
    width: W - M * 2,
    fontSize: 22,
    fontWeight: 400,
    fontFamily: FONT,
    color: SLIDE_PALETTE.grey,
    align: "center",
    maxLines: 1,
    role: "caption",
  });

  // Supporting figures in a centred row.
  const rowY = labelY + 70;
  if (rest.length) {
    const cellW = 360;
    const totalW = cellW * rest.length;
    const startX = Math.round((W - totalW) / 2);
    rest.forEach((f, i) => {
      const x = startX + i * cellW;
      if (i > 0)
        bands.push({
          x: x - 1,
          y: rowY + 6,
          width: 1,
          height: 70,
          color: SLIDE_PALETTE.rule,
        });
      elements.push({
        text: f.value,
        x,
        y: rowY,
        width: cellW,
        fontSize: 44,
        fontWeight: 700,
        fontFamily: FONT,
        color: SLIDE_PALETTE.ink,
        align: "center",
        maxLines: 1,
        role: "kpi",
      });
      elements.push({
        text: fitLabel(f.label, 15, cellW - 24, 1, FONT),
        x: x + 12,
        y: rowY + Math.ceil(44 * 1.35) + 6,
        width: cellW - 24,
        fontSize: 15,
        fontWeight: 400,
        fontFamily: FONT,
        color: SLIDE_PALETTE.grey,
        align: "center",
        maxLines: 1,
        role: "caption",
      });
    });
  }

  // Illustration band along the bottom of the body.
  const zone = {
    x: M,
    y: rowY + 150,
    w: W - M * 2,
    h: Math.max(140, bodyBottom - (rowY + 150)),
  };
  return finish(
    ctx,
    zoneBrief(
      zone,
      `a wide, low horizontal diagram summarising: ${spec.subtitle || spec.actionTitle}`,
    ),
  );
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
  return finish(
    ctx,
    zoneBrief(
      zone,
      `a compact diagram of the sequence: ${spec.subtitle || spec.actionTitle}`,
    ),
  );
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
  return finish(
    ctx,
    zoneBrief(
      zone,
      `a vertical diagram illustrating: ${spec.subtitle || spec.actionTitle}`,
    ),
  );
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
  const badgeY = bodyTop;

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
      const body = fitText(ev.body, 15, textW, 3, FONT);
      if (body) {
        elements.push({
          text: body,
          x: lx + 20,
          y: bodyBottom - 15 * 1.35 * 3 - 10,
          width: textW,
          fontSize: 15,
          fontWeight: 400,
          fontFamily: FONT,
          color: SLIDE_PALETTE.grey,
          align: "center",
          maxLines: 3,
          role: "body",
        });
      }
    }
  });

  // Vignette lane band between headings and captions.
  const laneTop = badgeY + badgeD + 22 + 21 * 1.35 * 2 + 24;
  const laneBottom = bodyBottom - 15 * 1.35 * 3 - 30;
  const laneBrief = steps
    .map(
      (s, i) =>
        `  LANE ${i + 1} (horizontal ${pct(M + laneW * i, W)}%–${pct(M + laneW * (i + 1), W)}%): ${s}`,
    )
    .join("\n");
  const zones = `COMPOSITION — a consulting slide. The canvas is divided into ${n} equal vertical LANES.
- Draw ONLY within vertical ${pct(laneTop, H)}%–${pct(laneBottom, H)}%. Everywhere else is flat, pure WHITE (#FFFFFF).
- One self-contained vignette per lane, centred in its lane, with a clear gutter between lanes. Never let a vignette cross into its neighbour:
${laneBrief}
- Style: clean flat vector, thin consistent line weight, navy #1B3A6B and slate grey on white. No gradients, no glow, no 3D.
ABSOLUTELY NO TEXT, LABELS, NUMBERS, OR LETTERS OF ANY KIND.`;
  return finish(ctx, zones);
}

export const SLIDE_LAYOUTS: Record<SlideVariant, (s: SlideSpec) => LayoutPlan> =
  {
    centered: layoutCentered,
    across: layoutAcross,
    boxes: layoutBoxes,
    flow: layoutFlow,
  };
