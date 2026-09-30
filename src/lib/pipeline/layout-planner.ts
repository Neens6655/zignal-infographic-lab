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
  fontFamily: "IBM Plex Mono" | "IBM Plex Sans";
  color: string;
  align: "left" | "center" | "right";
  maxLines?: number;
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
  }
> = {
  institutional: {
    title: "#1C1C1C",
    subtitle: "#4A4A4A",
    heading: "#1C1C1C",
    content: "#2E2E2E",
    // The accessible gold. Decorative #D4A84B is never used as text.
    label: "#A67C32",
    stat: "#1C1C1C",
    statLabel: "#5A5A5A",
    source: "#6B6B6B",
    background: "#F2E8D5",
  },
  dark: {
    title: "#FFFFFF",
    subtitle: "#B0C4DE",
    heading: "#FFFFFF",
    content: "#CBD5E1",
    label: "#D4A84B",
    stat: "#FFFFFF",
    statLabel: "#90A4AE",
    source: "#78909C",
    background: "#0D1B2A",
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
  "IBM Plex Mono": 0.62, // monospace advance is exactly 0.6; a hair more for safety
  "IBM Plex Sans": 0.58,
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
  family: TextElement["fontFamily"] = "IBM Plex Sans",
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
  family: TextElement["fontFamily"] = "IBM Plex Sans",
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
  family: TextElement["fontFamily"] = "IBM Plex Sans",
): string {
  return fitText(text, fontSize, widthPx, maxLines, family) ?? text.trim();
}

export function planLayout(
  content: StructuredContent,
  aspectRatio: string,
  paletteName: PaletteName = "institutional",
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
    "IBM Plex Mono",
  );
  elements.push({
    text: titleText,
    x: margin,
    y: cursor,
    width: width - margin * 2,
    fontSize: titleFontSize,
    fontWeight: 700,
    fontFamily: "IBM Plex Mono",
    color: COLORS.title,
    align: "left",
    maxLines: 2,
  });
  cursor +=
    estimateTextHeight(titleText, titleFontSize, width - margin * 2, 2, "IBM Plex Mono") + 4;

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
      fontFamily: "IBM Plex Sans",
      color: COLORS.subtitle,
      align: "left",
      maxLines: 1,
    });
    cursor +=
      estimateTextHeight(subText, subFontSize, width - margin * 2, 2) + 8;
  }

  // ── CONTENT GRID ───────────────────────────────────────────
  // Header band spans everything measured above — title + subtitle — so the type on
  // it is legible whatever the plate does behind it.
  bands.push({
    x: 0,
    y: headerTop,
    width,
    height: Math.ceil(cursor + 6),
    color: COLORS.background,
  });

  const contentTop = cursor + 10;
  const footerHeight = 100; // Reserve for stats bar + source
  const contentBottom = height - footerHeight;
  const contentAvailable = contentBottom - contentTop;

  // Grid dimensions
  const maxCols =
    sectionCount <= 2
      ? 2
      : sectionCount <= 3
        ? 3
        : sectionCount <= 6
          ? 3
          : sectionCount <= 8
            ? 4
            : 5;
  const rows = Math.ceil(sectionCount / maxCols);
  const colWidth = Math.round((width - margin * 2) / maxCols);
  const rowHeight = Math.round(contentAvailable / rows);
  const textWidth = colWidth - 24;

  // Font sizes that scale with available space
  const headingSize = Math.max(11, Math.min(14, Math.round(textWidth / 25)));
  const labelSize = Math.max(9, Math.min(11, Math.round(textWidth / 30)));
  const contentSize = Math.max(8, Math.min(10, Math.round(textWidth / 35)));

  content.sections.forEach((section, i) => {
    const col = i % maxCols;
    const row = Math.floor(i / maxCols);
    const sx = margin + col * colWidth + 12;
    const cellTop = contentTop + row * rowHeight;
    let cy = cellTop; // Cell Y cursor

    // Heading (max 2 lines)
    const headingText = fitLabel(
      section.heading,
      headingSize,
      textWidth,
      2,
      "IBM Plex Mono",
    );
    elements.push({
      text: headingText,
      x: sx,
      y: cy,
      width: textWidth,
      fontSize: headingSize,
      fontWeight: 700,
      fontFamily: "IBM Plex Mono",
      color: COLORS.heading,
      align: "left",
      maxLines: 2,
    });
    cy += estimateTextHeight(headingText, headingSize, textWidth, 2, "IBM Plex Mono") + 4;

    // Labels (gold metrics — max 3, 1 line each)
    for (const label of section.labels.slice(0, 3)) {
      const labelText = fitLabel(label, labelSize, textWidth, 1, 'IBM Plex Mono');
      elements.push({
        text: labelText,
        x: sx,
        y: cy,
        width: textWidth,
        fontSize: labelSize,
        fontWeight: 700,
        fontFamily: "IBM Plex Mono",
        color: COLORS.label,
        align: "left",
      });
      cy += labelSize * 1.4;
    }

    cy += 3; // Small gap before content

    // Content items (max 3 items, max 2 lines each — but respect cell boundary)
    const cellBottom = cellTop + rowHeight - 8;
    for (const item of section.content.slice(0, 3)) {
      if (cy + contentSize > cellBottom) break; // Stop if we'd overflow the cell
      const maxContentLines = Math.min(
        2,
        Math.floor((cellBottom - cy) / (contentSize * 1.3)),
      );
      if (maxContentLines < 1) break;
      // fitText returns null when nothing honest fits — skip the bullet entirely
      // rather than print half a sentence.
      const itemText = fitText(item, contentSize, textWidth, maxContentLines);
      if (!itemText) continue;
      elements.push({
        text: itemText,
        x: sx,
        y: cy,
        width: textWidth,
        fontSize: contentSize,
        fontWeight: 400,
        fontFamily: "IBM Plex Sans",
        color: COLORS.content,
        align: "left",
        maxLines: maxContentLines,
      });
      cy +=
        estimateTextHeight(itemText, contentSize, textWidth, maxContentLines) +
        2;
    }
  });

  // ── FOOTER — stats bar + source ────────────────────────────
  const statsY = contentBottom + 12;
  bands.push({
    x: 0,
    y: statsY - 14,
    width,
    height: height - (statsY - 14),
    color: COLORS.background,
  });
  const statsCount = Math.min(content.statsBar.length, 6);
  const statWidth = Math.round((width - margin * 2) / Math.max(statsCount, 1));

  content.statsBar.slice(0, 6).forEach((stat, i) => {
    elements.push({
      text: fitLabel(stat.value, 20, statWidth - 10, 1, 'IBM Plex Mono'),
      x: margin + i * statWidth,
      y: statsY,
      width: statWidth - 10,
      fontSize: 20,
      fontWeight: 700,
      fontFamily: "IBM Plex Mono",
      color: COLORS.stat,
      align: "center",
    });
    elements.push({
      text: fitLabel(stat.label, 10, statWidth - 10, 1),
      x: margin + i * statWidth,
      y: statsY + 26,
      width: statWidth - 10,
      fontSize: 10,
      fontWeight: 400,
      fontFamily: "IBM Plex Sans",
      color: COLORS.statLabel,
      align: "center",
    });
  });

  if (content.sourceAttribution) {
    elements.push({
      text: fitLabel(content.sourceAttribution, 9, width - margin * 2, 1),
      x: margin,
      y: height - 22,
      width: width - margin * 2,
      fontSize: 9,
      fontWeight: 400,
      fontFamily: "IBM Plex Sans",
      color: COLORS.source,
      align: "left",
    });
  }

  // ── Illustration zones (no pixel values, no numbers) ───────
  const illustrationZones = `
Dark executive background. Subtle topic-related illustrations only.
TOP STRIP: Dark navy gradient. Mostly empty — title text overlaid.
MIDDLE GRID: ${sectionCount} visual zones in a ${maxCols}-column, ${rows}-row grid. Place a subtle icon or diagram per zone related to the topic. Keep at very low opacity — white text overlaid.
BOTTOM STRIP: Dark solid bar for key statistics.
Palette: navy, dark charcoal, muted gold accents. Everything low-contrast against dark background.
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
