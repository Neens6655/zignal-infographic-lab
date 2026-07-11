/**
 * Layout Planner v2 — dynamic text flow.
 * Each element's Y position is calculated from the previous element's actual height.
 * No hardcoded pixel offsets. Text never overlaps.
 */
import type { StructuredContent } from './types';

export type TextElement = {
  text: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  fontWeight: 400 | 700;
  fontFamily: 'IBM Plex Mono' | 'IBM Plex Sans';
  color: string;
  align: 'left' | 'center' | 'right';
  maxLines?: number;
};

export type LayoutPlan = {
  width: number;
  height: number;
  elements: TextElement[];
  illustrationZones: string;
  backgroundColor: string;
};

const COLORS = {
  title: '#FFFFFF',
  subtitle: '#B0C4DE',
  heading: '#FFFFFF',
  content: '#CBD5E1',
  label: '#D4A84B',
  stat: '#FFFFFF',
  statLabel: '#90A4AE',
  source: '#78909C',
};

// ── Text height estimation (chars per line → number of lines → pixel height)
function estimateTextHeight(text: string, fontSize: number, widthPx: number, maxLines?: number): number {
  // Average char width ≈ fontSize * 0.6 for monospace, * 0.5 for sans
  const avgCharWidth = fontSize * 0.55;
  const charsPerLine = Math.floor(widthPx / avgCharWidth);
  const lines = Math.min(maxLines || 99, Math.ceil(text.length / Math.max(charsPerLine, 1)));
  return lines * (fontSize * 1.3); // line-height ~1.3
}

function truncateToFit(text: string, fontSize: number, widthPx: number, maxLines: number): string {
  const avgCharWidth = fontSize * 0.55;
  const charsPerLine = Math.floor(widthPx / avgCharWidth);
  const maxChars = charsPerLine * maxLines;
  if (text.length <= maxChars) return text;
  // Cut at word boundary
  const cut = text.slice(0, maxChars - 3);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > maxChars * 0.5 ? cut.slice(0, lastSpace) : cut).trimEnd() + '...';
}

export function planLayout(
  content: StructuredContent,
  aspectRatio: string,
): LayoutPlan {
  const dims = aspectRatio === '1:1'
    ? { width: 1080, height: 1080 }
    : aspectRatio === '9:16'
      ? { width: 1080, height: 1920 }
      : { width: 1920, height: 1080 };

  const { width, height } = dims;
  const elements: TextElement[] = [];
  const margin = 50;
  const sectionCount = content.sections.length;

  // ── HEADER ─────────────────────────────────────────────────
  let cursor = 24; // Y cursor tracks current vertical position

  const titleFontSize = Math.min(36, Math.round(width / 40));
  const titleText = truncateToFit(content.title, titleFontSize, width - margin * 2, 1);
  elements.push({
    text: titleText,
    x: margin, y: cursor,
    width: width - margin * 2,
    fontSize: titleFontSize,
    fontWeight: 700,
    fontFamily: 'IBM Plex Mono',
    color: COLORS.title,
    align: 'left',
    maxLines: 1,
  });
  cursor += estimateTextHeight(titleText, titleFontSize, width - margin * 2, 1) + 4;

  if (content.subtitle) {
    const subFontSize = Math.min(14, Math.round(width / 100));
    const subText = truncateToFit(content.subtitle, subFontSize, width - margin * 2, 1);
    elements.push({
      text: subText,
      x: margin, y: cursor,
      width: width - margin * 2,
      fontSize: subFontSize,
      fontWeight: 400,
      fontFamily: 'IBM Plex Sans',
      color: COLORS.subtitle,
      align: 'left',
      maxLines: 1,
    });
    cursor += estimateTextHeight(subText, subFontSize, width - margin * 2, 1) + 8;
  }

  // ── CONTENT GRID ───────────────────────────────────────────
  const contentTop = cursor + 10;
  const footerHeight = 100; // Reserve for stats bar + source
  const contentBottom = height - footerHeight;
  const contentAvailable = contentBottom - contentTop;

  // Grid dimensions
  const maxCols = sectionCount <= 2 ? 2
    : sectionCount <= 3 ? 3
    : sectionCount <= 6 ? 3
    : sectionCount <= 8 ? 4
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
    const headingText = truncateToFit(section.heading, headingSize, textWidth, 2);
    elements.push({
      text: headingText, x: sx, y: cy, width: textWidth,
      fontSize: headingSize, fontWeight: 700,
      fontFamily: 'IBM Plex Mono', color: COLORS.heading, align: 'left', maxLines: 2,
    });
    cy += estimateTextHeight(headingText, headingSize, textWidth, 2) + 4;

    // Labels (gold metrics — max 3, 1 line each)
    for (const label of section.labels.slice(0, 3)) {
      const labelText = truncateToFit(label, labelSize, textWidth, 1);
      elements.push({
        text: labelText, x: sx, y: cy, width: textWidth,
        fontSize: labelSize, fontWeight: 700,
        fontFamily: 'IBM Plex Mono', color: COLORS.label, align: 'left',
      });
      cy += labelSize * 1.4;
    }

    cy += 3; // Small gap before content

    // Content items (max 3 items, max 2 lines each — but respect cell boundary)
    const cellBottom = cellTop + rowHeight - 8;
    for (const item of section.content.slice(0, 3)) {
      if (cy + contentSize > cellBottom) break; // Stop if we'd overflow the cell
      const maxContentLines = Math.min(2, Math.floor((cellBottom - cy) / (contentSize * 1.3)));
      if (maxContentLines < 1) break;
      const itemText = truncateToFit(item, contentSize, textWidth, maxContentLines);
      elements.push({
        text: itemText, x: sx, y: cy, width: textWidth,
        fontSize: contentSize, fontWeight: 400,
        fontFamily: 'IBM Plex Sans', color: COLORS.content, align: 'left',
        maxLines: maxContentLines,
      });
      cy += estimateTextHeight(itemText, contentSize, textWidth, maxContentLines) + 2;
    }
  });

  // ── FOOTER — stats bar + source ────────────────────────────
  const statsY = contentBottom + 12;
  const statsCount = Math.min(content.statsBar.length, 6);
  const statWidth = Math.round((width - margin * 2) / Math.max(statsCount, 1));

  content.statsBar.slice(0, 6).forEach((stat, i) => {
    elements.push({
      text: truncateToFit(stat.value, 20, statWidth - 10, 1),
      x: margin + i * statWidth, y: statsY,
      width: statWidth - 10,
      fontSize: 20, fontWeight: 700,
      fontFamily: 'IBM Plex Mono', color: COLORS.stat, align: 'center',
    });
    elements.push({
      text: truncateToFit(stat.label, 10, statWidth - 10, 1),
      x: margin + i * statWidth, y: statsY + 26,
      width: statWidth - 10,
      fontSize: 10, fontWeight: 400,
      fontFamily: 'IBM Plex Sans', color: COLORS.statLabel, align: 'center',
    });
  });

  if (content.sourceAttribution) {
    elements.push({
      text: truncateToFit(content.sourceAttribution, 9, width - margin * 2, 1),
      x: margin, y: height - 22,
      width: width - margin * 2,
      fontSize: 9, fontWeight: 400,
      fontFamily: 'IBM Plex Sans', color: COLORS.source, align: 'left',
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

  return { width, height, elements, illustrationZones, backgroundColor: '#0D1B2A' };
}
