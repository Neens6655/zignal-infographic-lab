/**
 * STEPPED PROCESS — the "how it works, in N steps" format.
 *
 * Modelled on an institutional reference: a dark header bar carrying a full thesis
 * SENTENCE (not a title), gold numbered badges joined by chevrons, one illustration
 * per step inside its own lane, a complete caption under each, and a KPI strip along
 * the foot.
 *
 * Two things make this different from the panel grid, and both matter:
 *
 *  1. THE ILLUSTRATION IS PER-LANE, not one shared band. Each step gets its own
 *     rectangle of canvas, and the model is told what belongs in each. A reader
 *     follows one column top to bottom instead of hunting a shared picture for the
 *     bit that matches step 3.
 *
 *  2. THE CAPTION IS A WHOLE SENTENCE. The grid's job is to fill panels; this
 *     format's job is to say one complete thing per step. A caption that would need
 *     an ellipsis is replaced by the shorter of the section's sentences instead of
 *     being cut.
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

/** Pick the longest sentence that fits whole — never a truncated one. */
function completeCaption(
  candidates: string[],
  fontSize: number,
  width: number,
  maxLines: number,
): string | null {
  const whole = candidates
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => {
      const fitted = fitText(c, fontSize, width, maxLines);
      return fitted && !fitted.endsWith("…") ? fitted : null;
    })
    .filter((c): c is string => !!c);

  if (whole.length === 0) {
    // Nothing fits whole — fall back to the shortest available, truncated honestly.
    const shortest = [...candidates].sort((a, b) => a.length - b.length)[0];
    return shortest ? fitText(shortest, fontSize, width, maxLines) : null;
  }
  return whole.sort((a, b) => b.length - a.length)[0];
}

export function planSteppedProcess(
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

  // ── HEADER: dark bar with a thesis sentence ──────────────────────────
  const headerH = Math.round(112 * k);
  bands.push({ x: 0, y: 0, width, height: headerH, color: "#14202E" });
  // Gold rule at the left of the statement, as in the reference.
  bands.push({
    x: margin,
    y: Math.round(34 * k),
    width: Math.round(5 * k),
    height: headerH - Math.round(56 * k),
    color: "#C8A84B",
  });

  elements.push({
    text: "PROCESS / HOW IT WORKS",
    x: margin,
    y: Math.round(12 * k),
    width: Math.round(600 * k),
    fontSize: Math.round(12 * k),
    fontWeight: 700,
    fontFamily: "Arial",
    color: "#C8A84B",
    align: "left",
    maxLines: 1,
    role: "caption",
  });

  const stepsTotal = Math.min(
    content.sections.length,
    Math.max(1, Math.min(5, opts.maxPanels ?? 5)),
  );

  elements.push({
    text: `01 / ${String(stepsTotal).padStart(2, "0")} STEPS`,
    x: width - margin - Math.round(320 * k),
    y: Math.round(12 * k),
    width: Math.round(320 * k),
    fontSize: Math.round(12 * k),
    fontWeight: 700,
    fontFamily: "Arial",
    color: "#8FA3B8",
    align: "right",
    maxLines: 1,
    role: "caption",
  });

  // The thesis: a sentence, not a title. Subtitle first if it reads as one.
  const thesisSource =
    content.subtitle && content.subtitle.length > 40
      ? `${content.title}. ${content.subtitle}`
      : content.title;
  const thesisSize = Math.round(29 * k);
  const thesisW = width - margin * 2 - Math.round(24 * k);
  elements.push({
    text: fitLabel(thesisSource, thesisSize, thesisW, 2),
    x: margin + Math.round(20 * k),
    y: Math.round(38 * k),
    width: thesisW,
    fontSize: thesisSize,
    fontWeight: 700,
    fontFamily: "Arial",
    color: "#FFFFFF",
    align: "left",
    maxLines: 2,
    role: "title",
  });

  // ── BODY ─────────────────────────────────────────────────────────────
  // NOT a full-body band. Painting the whole body opaque covered the illustration
  // completely — the plate was generated, measured OK by the plate check, and then
  // hidden under our own background. Only the TEXT strips get an opaque backing; the
  // lane band between them is left clear for the diagram to show through.

  const shown = content.sections.slice(0, stepsTotal);
  const cols = shown.length;
  const laneW = Math.round((width - margin * 2) / cols);

  const badgeD = Math.round(58 * k);
  const badgeY = headerH + Math.round(46 * k);
  const headingSize = Math.round(23 * k);
  const captionSize = Math.round(16 * k);
  const textW = laneW - Math.round(34 * k);

  // Foot: KPI strip if the brief has figures, otherwise a source line.
  const footH = Math.round(96 * k);
  const footTop = height - footH;

  // Measure the tallest heading so every lane's illustration starts at one line.
  let headingBottom = 0;
  const headings = shown.map((s) => fitLabel(s.heading, headingSize, textW, 2));
  const headingTop = badgeY + badgeD + Math.round(22 * k);
  for (const h of headings) {
    headingBottom = Math.max(
      headingBottom,
      headingTop + estimateTextHeight(h, headingSize, textW, 2),
    );
  }

  const captionH = Math.round(captionSize * 1.4 * 3);
  const captionTop = footTop - Math.round(26 * k) - captionH;
  const illTop = headingBottom + Math.round(20 * k);
  const illBottom = captionTop - Math.round(18 * k);

  // Opaque strips behind the text only: badges + headings at the top, captions and
  // the foot at the bottom. The illustration band between them stays clear.
  bands.push({
    x: 0,
    y: headerH,
    width,
    height: illTop - headerH,
    color: C.background,
  });
  bands.push({
    x: 0,
    y: illBottom,
    width,
    height: height - illBottom,
    color: C.background,
  });

  shown.forEach((section, i) => {
    const lx = margin + i * laneW;
    const cx = lx + laneW / 2;

    // Gold numbered badge.
    bands.push({
      x: Math.round(cx - badgeD / 2),
      y: badgeY,
      width: badgeD,
      height: badgeD,
      color: "#C8A84B",
      borderRadius: Math.round(badgeD / 2),
    });
    elements.push({
      text: String(i + 1).padStart(2, "0"),
      x: Math.round(cx - badgeD / 2),
      y: badgeY + Math.round(badgeD * 0.27),
      width: badgeD,
      fontSize: Math.round(22 * k),
      fontWeight: 700,
      fontFamily: "Arial",
      // White on this gold measures 2.29:1 and fails AA outright. Navy on the same
      // gold is 7.18:1 and reads better on a printed page besides.
      color: "#14202E",
      align: "center",
      maxLines: 1,
      role: "label",
    });

    // Chevron to the next step — a shaft plus a rotated corner, since Satori has no
    // triangle primitive and an arrow glyph may be missing from the face.
    if (i < cols - 1) {
      const shaftY = badgeY + Math.round(badgeD / 2);
      const shaftX = Math.round(cx + badgeD * 0.75);
      const shaftW = Math.round(laneW - badgeD * 1.5);
      if (shaftW > 20 * k) {
        bands.push({
          x: shaftX,
          y: shaftY - 1,
          width: shaftW,
          height: Math.round(2 * k),
          color: "#C8A84B",
        });
        const head = Math.round(12 * k);
        bands.push({
          x: shaftX + shaftW - head,
          y: shaftY - Math.round(head / 2),
          width: head,
          height: head,
          color: "transparent",
          borderColor: "#C8A84B",
          borderWidth: Math.round(2 * k),
          rotate: 45,
        });
      }
    }

    elements.push({
      text: headings[i],
      x: lx + Math.round(17 * k),
      y: headingTop,
      width: textW,
      fontSize: headingSize,
      fontWeight: 700,
      fontFamily: "Arial",
      color: "#1B3A4B",
      align: "center",
      maxLines: 2,
      role: "heading",
    });

    // Caption: one COMPLETE sentence per step.
    const caption = completeCaption(
      [...section.content, section.keyConcept].filter(Boolean),
      captionSize,
      textW,
      3,
    );
    if (caption) {
      elements.push({
        text: caption,
        x: lx + Math.round(17 * k),
        y: captionTop,
        width: textW,
        fontSize: captionSize,
        fontWeight: 400,
        fontFamily: "Arial",
        color: C.content,
        align: "center",
        maxLines: 3,
        role: "body",
      });
    }
  });

  // ── FOOT ─────────────────────────────────────────────────────────────
  bands.push({
    x: margin,
    y: footTop,
    width: width - margin * 2,
    height: Math.round(1 * k),
    color: "#C9BFAE",
  });

  const numeric = content.statsBar.filter((s) => /[0-9]/.test(s.value));
  if (numeric.length >= 2) {
    const n = Math.min(numeric.length, 5);
    const cellW = Math.round((width - margin * 2) / n);
    numeric.slice(0, n).forEach((stat, i) => {
      const sx = margin + i * cellW;
      elements.push({
        text: fitLabel(
          stat.value,
          Math.round(26 * k),
          Math.round(cellW * 0.42),
          1,
        ),
        x: sx,
        y: footTop + Math.round(28 * k),
        width: Math.round(cellW * 0.42),
        fontSize: Math.round(26 * k),
        fontWeight: 700,
        fontFamily: "Arial",
        color: "#1B3A4B",
        align: "right",
        maxLines: 1,
        role: "kpi",
      });
      elements.push({
        text: fitLabel(
          stat.label,
          Math.round(14 * k),
          Math.round(cellW * 0.52),
          1,
        ),
        x: sx + Math.round(cellW * 0.46),
        y: footTop + Math.round(36 * k),
        width: Math.round(cellW * 0.52),
        fontSize: Math.round(14 * k),
        fontWeight: 400,
        fontFamily: "Arial",
        color: C.statLabel,
        align: "left",
        maxLines: 1,
        role: "caption",
      });
      if (i > 0) {
        bands.push({
          x: sx - Math.round(6 * k),
          y: footTop + Math.round(26 * k),
          width: Math.round(1 * k),
          height: Math.round(30 * k),
          color: "#C9BFAE",
        });
      }
    });
  }

  if (content.sourceAttribution) {
    elements.push({
      text: fitLabel(
        content.sourceAttribution,
        Math.round(13 * k),
        width - margin * 2,
        1,
      ),
      x: margin,
      y: height - Math.round(26 * k),
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

  // ── Illustration brief: one lane per step ────────────────────────────
  const pct = (v: number) => Math.round((v / height) * 100);
  const lanes = shown
    .map(
      (s, i) =>
        `  LANE ${i + 1} (horizontal ${Math.round((i / cols) * 100)}%-${Math.round(((i + 1) / cols) * 100)}%): ${s.visualElement || s.heading}`,
    )
    .join("\n");

  const illustrationZones = `
COMPOSITION - a text layer is composited on top and must never be obscured.
The canvas is divided into ${cols} equal vertical LANES, one per step.

- Vertical ${pct(illTop)}%-${pct(illBottom)}% is the ONLY band you may draw in.
  Everything above and below it must be left as plain pale background.
- Within that band, draw ONE self-contained vignette per lane, centred in its lane:
${lanes}
- Keep a clear gutter between lanes. Do not let a vignette bleed into its neighbour.
- The ENTIRE canvas background must be exactly ${C.background} — the same flat colour
  edge to edge, including behind every vignette. Do NOT place vignettes on white cards,
  panels or tiles; they sit directly on that background with nothing behind them.
- Flat vector style, restrained palette: deep teal, muted gold, soft grey-green.
  Consistent line weight across lanes.
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
