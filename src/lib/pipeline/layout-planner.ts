/**
 * Layout Planner v2 — dynamic text flow.
 * Each element's Y position is calculated from the previous element's actual height.
 * No hardcoded pixel offsets. Text never overlaps.
 */
import type { StructuredContent } from "./types";

export type TextElement = {
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  fontWeight: 400 | 700;
  fontFamily: "Arial" | "Arial Narrow";
  color: string;
  align: "left" | "center" | "right";
  maxLines?: number;
  /**
   * What this text IS. The compliance gate needs the role to pick the right
   * legibility floor — inferring it from font size was circular ("anything 30px or
   * larger must be at least 34px"), which blocked valid KPI rows and captions.
   */
  role?: "title" | "subtitle" | "heading" | "label" | "body" | "kpi" | "caption";
};

/**
 * An opaque band painted UNDER the text, in the same Satori layer.
 *
 * WHY THESE EXIST
 * The plate and the text layer are planned independently — the image model does not
 * know where the type goes. On the first institutional render it painted a navy
 * header and footer, and the near-black title composited on top was unreadable.
 * Asking the model more nicely does not fix that; it is a race we do not control.
 * Painting our own band guarantees contrast by construction.
 */
export type Band = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  /** Optional 2px Bauhaus rule around the panel. */
  borderColor?: string;
  borderWidth?: number;
};

export type LayoutPlan = {
  width: number;
  height: number;
  /** Painted first, beneath every text element. */
  bands: Band[];
  elements: TextElement[];
  illustrationZones: string;
  backgroundColor: string;
};

/**
 * Palettes. An institutional deliverable is printed, read in a boardroom and put in a
 * deck — it is cream and white, never near-black. The house rule allows dark only for
 * live app dashboards.
 */
export type PaletteName = "institutional" | "dark";

export const PALETTES: Record<
  PaletteName,
  {
    title: string;
    subtitle: string;
    heading: string;
    content: string;
    label: string;
    stat: string;
    statLabel: string;
    source: string;
    background: string;
    /** Fill behind a text panel. */
    panel: string;
    /** 2px Bauhaus rule. */
    border: string;
  }
> = {
  institutional: {
    title: "#1C1C1C",
    subtitle: "#4A4A4A",
    heading: "#1C1C1C",
    content: "#2E2E2E",
    // #A67C32 is named "gold-accessible" in the design system but measures 3.78:1
    // on white and 3.11:1 on cream — it fails WCAG AA (4.5:1) on BOTH surfaces.
    // #805C1C clears it on both (6.06 / 4.99). Decorative #D4A84B is never text.
    label: "#805C1C",
    stat: "#1C1C1C",
    statLabel: "#4A4A4A",
    source: "#4A4A4A",
    background: "#F2E8D5",
    panel: "#FFFFFF",
    border: "#1C1C1C",
  },
  dark: {
    title: "#FFFFFF",
    subtitle: "#B0C4DE",
    heading: "#FFFFFF",
    content: "#CBD5E1",
    label: "#D4A84B",
    stat: "#FFFFFF",
    statLabel: "#90A4AE",
    source: "#B0C4DE",
    background: "#0D1B2A",
    panel: "#152A3F",
    border: "#3A5570",
  },
};

/**
 * Average glyph width as a fraction of font size, per family.
 *
 * WHY THIS MATTERS MORE THAN IT LOOKS
 * Both families were previously assumed to be 0.55. IBM Plex Sans is wider than that
 * in running prose, so every "fitted" string still overflowed its box — and the text
 * renderer clips with `overflow: hidden`, no ellipsis. The visible result was twelve
 * body sentences amputated mid-word ("...is equipped with a"). Under-estimating here
 * does not produce a tight layout, it produces a mutilated one, so these are
 * deliberately conservative.
 */
const CHAR_WIDTH: Record<TextElement["fontFamily"], number> = {
  // Arial/Arimo average advance in running prose, measured conservatively.
  // Under-estimating here does not make a tight layout, it makes a clipped one.
  Arial: 0.52,
  "Arial Narrow": 0.45,
};

const LINE_HEIGHT = 1.35;

function charsPerLine(
  fontSize: number,
  widthPx: number,
  family: TextElement["fontFamily"],
): number {
  return Math.max(1, Math.floor(widthPx / (fontSize * CHAR_WIDTH[family])));
}

function estimateTextHeight(
  text: string,
  fontSize: number,
  widthPx: number,
  maxLines: number | undefined,
  family: TextElement["fontFamily"] = "Arial",
): number {
  const cpl = charsPerLine(fontSize, widthPx, family);
  const lines = Math.min(
    maxLines || 99,
    Math.max(1, Math.ceil(text.length / cpl)),
  );
  return Math.ceil(lines * fontSize * LINE_HEIGHT);
}

/**
 * Fit prose into a box WITHOUT amputating a sentence.
 *
 * Order of preference, best first:
 *   1. it already fits — use it whole
 *   2. a prefix ending at a sentence boundary fits — use that, no ellipsis needed
 *   3. a prefix ending at a word boundary fits — use that with an ellipsis
 *   4. nothing sensible fits — return null, and the caller DROPS the item
 *
 * Returning null is the important case. Two complete sentences read better in a
 * boardroom than three mutilated ones, and a sentence that stops mid-word reads as a
 * bug in the document — which is precisely what it is.
 */
export function fitText(
  text: string,
  fontSize: number,
  widthPx: number,
  maxLines: number,
  family: TextElement["fontFamily"] = "Arial",
): string | null {
  const clean = text.trim();
  if (!clean) return null;

  const maxChars = charsPerLine(fontSize, widthPx, family) * maxLines;
  if (clean.length <= maxChars) return clean;

  // 2. Sentence boundary inside budget.
  const sentenceEnd = clean
    .slice(0, maxChars)
    .search(/[.!?](?=\s|$)(?!.*[.!?](?=\s|$))/);
  if (sentenceEnd > maxChars * 0.45) {
    return clean.slice(0, sentenceEnd + 1).trim();
  }

  // 3. Word boundary, leaving room for the ellipsis.
  const budget = maxChars - 1;
  if (budget > 8) {
    const cut = clean.slice(0, budget);
    const lastSpace = cut.lastIndexOf(" ");
    if (lastSpace > budget * 0.5) {
      return cut.slice(0, lastSpace).trimEnd() + "…";
    }
  }

  // 4. Too small to say anything honestly.
  return null;
}

/** Headings and labels must never be dropped, so they fall back to a hard clamp. */
function fitLabel(
  text: string,
  fontSize: number,
  widthPx: number,
  maxLines: number,
  family: TextElement["fontFamily"] = "Arial",
): string {
  return fitText(text, fontSize, widthPx, maxLines, family) ?? text.trim();
}

/** Degradation levers the compliance loop can pull when a plan does not pass. */
export type PlanOptions = {
  /** Cap the number of panels, so type can stay above the legibility floor. */
  maxPanels?: number;
  /** Cap body bullets per panel, to relieve over-truncation and overlap. */
  maxItemsPerPanel?: number;
};

export function planLayout(
  content: StructuredContent,
  aspectRatio: string,
  paletteName: PaletteName = "institutional",
  opts: PlanOptions = {},
): LayoutPlan {
  const COLORS = PALETTES[paletteName];
  const dims =
    aspectRatio === "1:1"
      ? { width: 1080, height: 1080 }
      : aspectRatio === "9:16"
        ? { width: 1080, height: 1920 }
        : { width: 1920, height: 1080 };

  const { width, height } = dims;
  const elements: TextElement[] = [];
  // Opaque backing for the header and footer, so contrast never depends on what the
  // image model decided to paint there.
  const bands: Band[] = [];
  const margin = 50;
  const sectionCount = content.sections.length;

  // ── HEADER ─────────────────────────────────────────────────
  let cursor = 24; // Y cursor tracks current vertical position

  const headerTop = 0;
  const titleFontSize = Math.min(36, Math.round(width / 40));
  const titleText = fitLabel(
    content.title,
    titleFontSize,
    width - margin * 2,
    2,
    "Arial",
  );
  elements.push({
    text: titleText,
    x: margin,
    y: cursor,
    width: width - margin * 2,
    fontSize: titleFontSize,
    fontWeight: 700,
    fontFamily: "Arial",
    color: COLORS.title,
    role: "title",
    align: "left",
    maxLines: 2,
  });
  cursor +=
    estimateTextHeight(
      titleText,
      titleFontSize,
      width - margin * 2,
      2,
      "Arial",
    ) + 4;

  if (content.subtitle) {
    const subFontSize = Math.min(14, Math.round(width / 100));
    const subText = fitLabel(
      content.subtitle,
      subFontSize,
      width - margin * 2,
      2,
    );
    elements.push({
      text: subText,
      x: margin,
      y: cursor,
      width: width - margin * 2,
      fontSize: subFontSize,
      fontWeight: 400,
      fontFamily: "Arial",
      color: COLORS.subtitle,
      role: "subtitle",
      align: "left",
      maxLines: 1,
    });
    cursor +=
      estimateTextHeight(subText, subFontSize, width - margin * 2, 2) + 8;
  }

  // -- CONTENT GRID -------------------------------------------
  // Header band spans everything measured above so the type on it is legible
  // whatever the plate does behind it.
  bands.push({
    x: 0,
    y: headerTop,
    width,
    height: Math.ceil(cursor + 14),
    color: COLORS.background,
  });

  const contentTop = cursor + 22;
  const footerHeight = Math.round(height * 0.11);
  const contentBottom = height - footerHeight;

  // An institutional page reserves a BAND for the illustration instead of running it
  // full-bleed behind the type. Overlap then becomes impossible by construction,
  // rather than something the image model has to be politely asked to avoid.
  const panelZoneHeight = Math.round((contentBottom - contentTop) * 0.56);

  /**
   * Type scale derived from the CANVAS, not from column width.
   *
   * Sizes used to fall out of `textWidth / 35`, which on a six-column grid produced
   * 8px body copy on a 1920px canvas - unreadable in print and on screen alike. A
   * boardroom page says LESS, LARGER.
   */
  const k = width / 1920;
  const headingSize = Math.round(23 * k);
  const labelSize = Math.round(17 * k);
  const contentSize = Math.round(16 * k);

  // Cap the grid so type stays large. More than four panels on a 16:9 page means
  // shrinking below the legibility floor, so surplus sections are DROPPED rather
  // than crushed - the compliance gate treats an undersized glyph as a hard fail.
  const maxPanels = Math.max(
    1,
    Math.min(width >= height ? 4 : 3, opts.maxPanels ?? 99),
  );
  const shown = content.sections.slice(0, maxPanels);
  const cols = Math.max(1, Math.min(shown.length, maxPanels));
  const gutter = Math.round(18 * k);
  const panelW = Math.round((width - margin * 2 - gutter * (cols - 1)) / cols);
  const pad = Math.round(18 * k);
  const textWidth = panelW - pad * 2;

  // Panel bands are emitted first (so text composites on top) but their height is
  // only known after the text is laid out. Remember each band's index and patch the
  // heights in a second pass — otherwise every card is fixed-height and the ones
  // with less content end up half empty, which is what the first panelled render did.
  const panelBandIdx: number[] = [];
  let tallestPanel = 0;

  shown.forEach((section, i) => {
    const px = margin + i * (panelW + gutter);

    // Opaque panel. This is what stops body copy landing on raw illustration.
    panelBandIdx.push(bands.length);
    bands.push({
      x: px,
      y: contentTop,
      width: panelW,
      height: panelZoneHeight,
      color: COLORS.panel,
      borderColor: COLORS.border,
      borderWidth: 2,
    });

    let cy = contentTop + pad;

    // Step number - institutional pages are numbered.
    elements.push({
      text: String(i + 1).padStart(2, "0"),
      x: px + pad,
      y: cy,
      width: textWidth,
      fontSize: Math.round(15 * k),
      fontWeight: 700,
      fontFamily: "Arial",
      color: COLORS.label,
      role: "label",
      align: "left",
      maxLines: 1,
    });
    cy += Math.round(15 * k * 1.7);

    const headingText = fitLabel(
      section.heading,
      headingSize,
      textWidth,
      2,
      "Arial",
    );
    elements.push({
      text: headingText,
      x: px + pad,
      y: cy,
      width: textWidth,
      fontSize: headingSize,
      fontWeight: 700,
      fontFamily: "Arial",
      color: COLORS.heading,
      role: "heading",
      align: "left",
      maxLines: 2,
    });
    cy +=
      estimateTextHeight(
        headingText,
        headingSize,
        textWidth,
        2,
        "Arial",
      ) + Math.round(10 * k);

    // Rule under the heading.
    bands.push({
      x: px + pad,
      y: cy,
      width: textWidth,
      height: 2,
      color: COLORS.border,
    });
    cy += Math.round(14 * k);

    for (const label of section.labels.slice(0, 2)) {
      const labelText = fitLabel(
        label,
        labelSize,
        textWidth,
        1,
        "Arial",
      );
      elements.push({
        text: labelText,
        x: px + pad,
        y: cy,
        width: textWidth,
        fontSize: labelSize,
        fontWeight: 700,
        fontFamily: "Arial",
        color: COLORS.label,
      role: "label",
        align: "left",
        maxLines: 1,
      });
      cy += Math.round(labelSize * 1.55);
    }

    cy += Math.round(8 * k);

    const panelTextBottom = contentTop + panelZoneHeight - pad;
    for (const item of section.content.slice(0, opts.maxItemsPerPanel ?? 2)) {
      const room = Math.floor(
        (panelTextBottom - cy) / (contentSize * LINE_HEIGHT),
      );
      if (room < 1) break;
      const lines = Math.min(4, room);
      const itemText = fitText(item, contentSize, textWidth, lines);
      if (!itemText) continue;
      elements.push({
        text: itemText,
        x: px + pad,
        y: cy,
        width: textWidth,
        fontSize: contentSize,
        fontWeight: 400,
        fontFamily: "Arial",
        color: COLORS.content,
        role: "body",
        align: "left",
        maxLines: lines,
      });
      cy +=
        estimateTextHeight(itemText, contentSize, textWidth, lines) +
        Math.round(8 * k);
    }

    tallestPanel = Math.max(tallestPanel, cy - contentTop + pad);
  });

  // Uniform height across the row — institutional cards align — but sized to the
  // content actually in them, never to whatever space happens to be free. The first
  // panelled render used a fixed height and every card was half empty.
  const fittedPanelHeight = Math.min(
    panelZoneHeight,
    Math.max(Math.round(120 * k), tallestPanel),
  );
  for (const idx of panelBandIdx) {
    bands[idx].height = fittedPanelHeight;
  }

  // -- FOOTER --------------------------------------------------
  const footerTop = contentBottom + Math.round(10 * k);
  const footerBandTop = footerTop - Math.round(10 * k);
  bands.push({
    x: 0,
    y: footerBandTop,
    width,
    height: height - footerBandTop,
    color: COLORS.background,
  });
  bands.push({
    x: margin,
    y: footerBandTop,
    width: width - margin * 2,
    height: 2,
    color: COLORS.border,
  });

  /**
   * A stats bar is a KPI pattern: a large VALUE above a small caption. When the brief
   * carries no figures, setting categorical words at KPI size is the wrong pattern and
   * reads as filler. The footer then becomes a SOURCE strip instead, which is what an
   * institutional reader actually wants in that position.
   */
  const numericStats = content.statsBar.filter((s) => /[0-9]/.test(s.value));
  const useKpiRow = numericStats.length >= 2;

  if (useKpiRow) {
    const statsCount = Math.min(numericStats.length, 5);
    const statWidth = Math.round((width - margin * 2) / statsCount);
    numericStats.slice(0, statsCount).forEach((stat, i) => {
      elements.push({
        text: fitLabel(
          stat.value,
          Math.round(30 * k),
          statWidth - 12,
          1,
          "Arial",
        ),
        x: margin + i * statWidth,
        y: footerTop + Math.round(8 * k),
        width: statWidth - 12,
        fontSize: Math.round(30 * k),
        fontWeight: 700,
        fontFamily: "Arial",
        color: COLORS.stat,
        role: "kpi",
        align: "left",
        maxLines: 1,
      });
      elements.push({
        text: fitLabel(stat.label, Math.round(13 * k), statWidth - 12, 1),
        x: margin + i * statWidth,
        // 30px value at 1.35 line-height ends at +48.5, so the caption must clear 48.
        y: footerTop + Math.round(56 * k),
        width: statWidth - 12,
        fontSize: Math.round(13 * k),
        fontWeight: 400,
        fontFamily: "Arial",
        color: COLORS.statLabel,
        role: "caption",
        align: "left",
        maxLines: 1,
      });
    });
  }

  if (content.sourceAttribution) {
    elements.push({
      text: fitLabel(
        content.sourceAttribution,
        Math.round(14 * k),
        width - margin * 2,
        2,
      ),
      x: margin,
      y: useKpiRow
        ? height - Math.round(36 * k)
        : footerTop + Math.round(16 * k),
      width: width - margin * 2,
      fontSize: Math.round(14 * k),
      fontWeight: 400,
      fontFamily: "Arial",
      color: COLORS.source,
      role: "caption",
      align: "left",
      maxLines: 2,
    });
  }

  // ── Illustration zones (no pixel values, no numbers) ───────
  const illustrationTopFitted =
    contentTop + fittedPanelHeight + Math.round(20 * k);
  const illPctTop = Math.round((illustrationTopFitted / height) * 100);
  const illustrationZones = `
COMPOSITION - a text layer is composited on top and must never be obscured:
- TOP ${illPctTop}% of the canvas: keep essentially EMPTY and very pale. Panels of text sit
  here. A faint grid, a light wash or a hairline rule is welcome; nothing dense, nothing dark.
- BOTTOM ${100 - illPctTop}%: this is the ILLUSTRATION BAND. Put the diagram here - the single
  strongest visual that explains the topic, drawn edge to edge across this band.
- Leave the outermost 3% of every side clear.
ABSOLUTELY NO TEXT, LABELS, NUMBERS, OR LETTERS OF ANY KIND.`.trim();

  return {
    width,
    height,
    bands,
    elements,
    illustrationZones,
    backgroundColor: COLORS.background,
  };
}
