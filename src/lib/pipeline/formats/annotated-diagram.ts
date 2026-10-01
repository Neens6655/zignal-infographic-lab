/**
 * ANNOTATED DIAGRAM — one hero illustration, callouts radiating on leader lines.
 *
 * Modelled on an editorial reference: a large title, a small-caps kicker over a rule,
 * a single dominant diagram, and labelled callouts around it whose leader lines point
 * at the part they describe.
 *
 * THE HARD PROBLEM, AND HOW THIS SOLVES IT
 * A leader line has to point AT something, and we do not control where the image model
 * puts anything. Asking it to draw the labels too would hand text rendering back to the
 * model — the exact defect this whole rebuild exists to remove.
 *
 * So the causality is inverted. The layout owns the geometry: six callout slots at
 * fixed positions, each with a fixed ANCHOR POINT on the edge of the central diagram
 * zone. The model is then briefed with that same zone map in words — "the primary
 * subject fills the centre; the item for the upper-left anchor sits at 10 o'clock" —
 * and we draw our own leader lines to the anchors we chose.
 *
 * The lines are therefore always crisp, always legible, and always where we said. The
 * residual risk is the model placing a subject somewhere other than its brief, which
 * degrades to a line pointing at a nearby part of the same diagram rather than to a
 * misspelled label. That is the right way for this to fail.
 */
import type { StructuredContent } from "../types";
import {
  PALETTES,
  fitText,
  fitLabel,
  estimateTextHeight,
  type LayoutPlan,
  type TextElement,
  type Band,
  type PaletteName,
  type PlanOptions,
} from "../layout-planner";

type Slot = {
  /** Which side the callout text sits on. */
  side: "left" | "right";
  /** 0 = top of the column, 1 = bottom. */
  row: 0 | 1 | 2;
  /** Clock position described to the model, so its brief matches our geometry. */
  clock: string;
};

const SLOTS: Slot[] = [
  { side: "left", row: 0, clock: "10 o'clock (upper left)" },
  { side: "right", row: 0, clock: "2 o'clock (upper right)" },
  { side: "left", row: 1, clock: "9 o'clock (mid left)" },
  { side: "right", row: 1, clock: "3 o'clock (mid right)" },
  { side: "left", row: 2, clock: "7 o'clock (lower left)" },
  { side: "right", row: 2, clock: "5 o'clock (lower right)" },
];

export function planAnnotatedDiagram(
  content: StructuredContent,
  aspectRatio: string,
  paletteName: PaletteName = "institutional",
  opts: PlanOptions = {},
): LayoutPlan {
  const dims =
    aspectRatio === "1:1"
      ? { width: 1080, height: 1080 }
      : aspectRatio === "9:16"
        ? { width: 1080, height: 1920 }
        : { width: 1920, height: 1080 };
  const { width, height } = dims;
  const C = PALETTES[paletteName];
  const k = width / 1920;
  const margin = Math.round(56 * k);

  const elements: TextElement[] = [];
  const bands: Band[] = [];

  // NOT a full-canvas band. Painting the whole page opaque covers the illustration
  // completely — the exact bug already fixed once in stepped-process and
  // reintroduced here. Only the header strip, the two callout columns and the foot
  // get an opaque backing; the central diagram zone stays clear.

  // ── HEADER: title, kicker, rule ──────────────────────────────────────
  const titleSize = Math.round(40 * k);
  elements.push({
    text: fitLabel(content.title, titleSize, width - margin * 2, 1),
    x: margin,
    y: Math.round(34 * k),
    width: width - margin * 2,
    fontSize: titleSize,
    fontWeight: 700,
    fontFamily: "Arial",
    color: "#14202E",
    align: "left",
    maxLines: 1,
    role: "title",
  });

  const kickerY = Math.round(96 * k);
  elements.push({
    text: fitLabel(
      (content.subtitle || "MECHANISM").toUpperCase(),
      Math.round(14 * k),
      width - margin * 2,
      1,
    ),
    x: margin,
    y: kickerY,
    width: width - margin * 2,
    fontSize: Math.round(14 * k),
    fontWeight: 700,
    fontFamily: "Arial",
    color: "#1B5FA8",
    align: "left",
    maxLines: 1,
    role: "caption",
  });
  bands.push({
    x: 0,
    y: kickerY + Math.round(26 * k),
    width,
    height: Math.round(2 * k),
    color: "#1B5FA8",
  });

  // ── Geometry: central diagram zone + callout columns ─────────────────
  const bodyTop = kickerY + Math.round(46 * k);
  const footH = Math.round(58 * k);
  const bodyBottom = height - footH;

  const colW = Math.round(width * 0.215);
  const diagX = margin + colW + Math.round(26 * k);
  const diagW = width - margin * 2 - (colW + Math.round(26 * k)) * 2;
  const diagY = bodyTop + Math.round(8 * k);
  const diagH = bodyBottom - diagY - Math.round(8 * k);

  const shown = content.sections.slice(
    0,
    Math.max(2, Math.min(SLOTS.length, opts.maxPanels ?? SLOTS.length)),
  );

  // Opaque backing for the text regions only.
  bands.push({ x: 0, y: 0, width, height: bodyTop, color: C.background });
  bands.push({
    x: 0,
    y: bodyTop,
    width: margin + colW + Math.round(13 * k),
    height: bodyBottom - bodyTop,
    color: C.background,
  });
  bands.push({
    x: width - margin - colW - Math.round(13 * k),
    y: bodyTop,
    width: margin + colW + Math.round(13 * k),
    height: bodyBottom - bodyTop,
    color: C.background,
  });
  bands.push({
    x: 0,
    y: bodyBottom,
    width,
    height: height - bodyBottom,
    color: C.background,
  });

  const labelSize = Math.round(17 * k);
  const bodySize = Math.round(15 * k);
  const rowH = Math.round(diagH / 3);

  shown.forEach((section, i) => {
    const slot = SLOTS[i % SLOTS.length];
    const isLeft = slot.side === "left";
    const cx = isLeft ? margin : width - margin - colW;
    const cy = diagY + slot.row * rowH + Math.round(14 * k);

    const label = fitLabel(section.heading.toUpperCase(), labelSize, colW, 2);
    elements.push({
      text: label,
      x: cx,
      y: cy,
      width: colW,
      fontSize: labelSize,
      fontWeight: 700,
      fontFamily: "Arial",
      color: "#14202E",
      align: isLeft ? "right" : "left",
      maxLines: 2,
      role: "label",
    });

    const labelH = estimateTextHeight(label, labelSize, colW, 2);

    const body = fitText(
      section.content[0] || section.keyConcept || "",
      bodySize,
      colW,
      3,
    );
    if (body) {
      elements.push({
        text: body,
        x: cx,
        y: cy + labelH + Math.round(4 * k),
        width: colW,
        fontSize: bodySize,
        fontWeight: 400,
        fontFamily: "Arial",
        color: C.content,
        align: isLeft ? "right" : "left",
        maxLines: 3,
        role: "body",
      });
    }

    // Leader line from the callout toward its anchor on the diagram edge.
    const anchorY = diagY + slot.row * rowH + Math.round(rowH * 0.45);
    const lineY = cy + Math.round(labelH * 0.4);
    const gap = Math.round(14 * k);
    if (isLeft) {
      const x1 = cx + colW + gap;
      bands.push({
        x: x1,
        y: lineY,
        width: Math.max(Math.round(10 * k), diagX - x1),
        height: Math.round(2 * k),
        color: "#5A6B7C",
      });
      bands.push({
        x: diagX - Math.round(5 * k),
        y: anchorY - Math.round(5 * k),
        width: Math.round(10 * k),
        height: Math.round(10 * k),
        color: "#5A6B7C",
        borderRadius: Math.round(5 * k),
      });
    } else {
      const x2 = cx - gap;
      const xEnd = diagX + diagW;
      bands.push({
        x: xEnd,
        y: lineY,
        width: Math.max(Math.round(10 * k), x2 - xEnd),
        height: Math.round(2 * k),
        color: "#5A6B7C",
      });
      bands.push({
        x: xEnd - Math.round(5 * k),
        y: anchorY - Math.round(5 * k),
        width: Math.round(10 * k),
        height: Math.round(10 * k),
        color: "#5A6B7C",
        borderRadius: Math.round(5 * k),
      });
    }
  });

  if (content.sourceAttribution) {
    elements.push({
      text: fitLabel(
        content.sourceAttribution,
        Math.round(13 * k),
        width - margin * 2,
        1,
      ),
      x: margin,
      y: height - Math.round(32 * k),
      width: width - margin * 2,
      fontSize: Math.round(13 * k),
      fontWeight: 400,
      fontFamily: "Arial",
      color: C.source,
      align: "left",
      maxLines: 1,
      role: "caption",
    });
  }

  // ── Illustration brief: the SAME zone map the geometry above assumes ──
  const pctX = (v: number) => Math.round((v / width) * 100);
  const pctY = (v: number) => Math.round((v / height) * 100);
  const subjects = shown
    .map(
      (s, i) =>
        `  - ${SLOTS[i % SLOTS.length].clock}: ${s.visualElement || s.heading}`,
    )
    .join("\n");

  const illustrationZones = `
Draw ONE large, BOLD, fully realised explanatory diagram. It is the whole point of the
image and must dominate the canvas - richly detailed, with clear shapes, icons and
connectors. Restraint applies to the PALETTE, never to how much is drawn: a sparse or
near-empty plate is a failed render.

A text layer with labels and leader lines is composited on top, so:

- Confine the drawing to horizontal ${pctX(diagX)}%-${pctX(diagX + diagW)}% and vertical
  ${pctY(diagY)}%-${pctY(diagY + diagH)}%. Outside that rectangle leave plain pale
  background, because labels sit there. FILL the permitted rectangle edge to edge.
- The PRIMARY SUBJECT fills the centre of that rectangle.
- Place a distinct supporting element near each of these positions, just inside the
  edge of the rectangle, because a leader line points to each one:
${subjects}
- The ENTIRE canvas background must be exactly ${C.background}, flat and edge to edge.
  No white cards, panels or tiles behind the drawing.
- Isometric or three-quarter flat vector, restrained: navy, slate, muted gold, soft
  grey-green. Consistent line weight.
ABSOLUTELY NO TEXT, LABELS, NUMBERS, OR LETTERS OF ANY KIND.`.trim();

  return {
    width,
    height,
    bands,
    elements,
    illustrationZones,
    backgroundColor: C.background,
  };
}
