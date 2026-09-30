/**
 * Content Density Enforcement — ZGNAL Infographic Lab v2
 *
 * Enforces strict content density rules BEFORE image generation.
 * Root cause of bad text rendering is too much text.
 */
import type { StructuredContent } from "./types";

export type DensityReport = {
  passed: boolean;
  originalSections: number;
  finalSections: number;
  removedParagraphs: number;
  truncatedLabels: number;
  violations: string[];
};

// Hybrid renderer (Satori) handles text programmatically — no garbling risk.
// Limits exist to prevent visual clutter, not to avoid AI text rendering errors.
const MAX_TITLE_WORDS = 12;
const MAX_SUBTITLE_WORDS = 20;
const MAX_SECTIONS = 4; // Overview default — intent-aware override applies
const MAX_HEADING_WORDS = 16; // high enough that a COMPLETE heading renders in full; only runaway headings get cut (and never with an ellipsis)
const MAX_STATS_BAR = 6;
const MAX_STAT_LABEL_WORDS = 4;
const MAX_CONTENT_ITEMS = 3; // Rich detail from research
const MAX_CONTENT_ITEM_CHARS = 80; // Full sentences, not fragments
const MAX_LABELS_PER_SECTION = 4;
const MAX_LABEL_CHARS = 50; // "1,300-1,600°C under extreme pressure" fits now

function truncateWords(
  text: string,
  max: number,
): { text: string; truncated: boolean } {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= max) return { text, truncated: false };
  return { text: words.slice(0, max).join(" ") + "...", truncated: true };
}

/**
 * Shorten prose WITHOUT leaving a sentence hanging.
 *
 * The previous version cut at a word boundary and deliberately dropped the ellipsis,
 * on the reasoning that a visible "..." reads as broken on a clean McKinsey layout.
 * That was half right and made things worse: removing the ellipsis did not remove the
 * defect, it concealed it. The live render printed twelve sentences ending
 * "...or dwelling within a" and "...is aligned with a specific" — which reads not as
 * shortened but as a bug in the document.
 *
 * Order of preference:
 *   1. a complete sentence fits           → use it, no marker needed
 *   2. a clause boundary (; : ,) fits     → use it, closed with an ellipsis
 *   3. nothing honest fits                → return empty, and the caller DROPS the line
 */
function truncateChars(
  text: string,
  max: number,
): { text: string; truncated: boolean } {
  const clean = text.trim();
  if (clean.length <= max) return { text: clean, truncated: false };

  const window = clean.slice(0, max);

  // 1. Last complete sentence inside the budget.
  const sentences = [...window.matchAll(/[.!?](?=\s|$)/g)];
  if (sentences.length > 0) {
    const end = sentences[sentences.length - 1].index! + 1;
    if (end > max * 0.4) {
      return { text: window.slice(0, end).trim(), truncated: true };
    }
  }

  // 2. Clause boundary, closed honestly with an ellipsis.
  const clause = Math.max(
    window.lastIndexOf("; "),
    window.lastIndexOf(": "),
    window.lastIndexOf(", "),
  );
  if (clause > max * 0.5) {
    return {
      text:
        window
          .slice(0, clause)
          .trimEnd()
          .replace(/[,;:]$/, "") + "…",
      truncated: true,
    };
  }

  // 3. Word boundary with an ellipsis, only if there is room to say something.
  const lastSpace = window.lastIndexOf(" ");
  if (lastSpace > max * 0.55) {
    return {
      text:
        window
          .slice(0, lastSpace)
          .trimEnd()
          .replace(/[,;:\-–—]+$/, "") + "…",
      truncated: true,
    };
  }

  // 4. Too small to say anything without mutilating it.
  return { text: "", truncated: true };
}

/**
 * Intent-aware density enforcement.
 * Rankings/comparisons need more sections (up to 10) to show all entities.
 * Process/overview can stay tight at 4-6.
 */
export function enforceDensity(
  content: StructuredContent,
  intent?: string,
): { content: StructuredContent; report: DensityReport } {
  // Intent-aware section limits
  const maxSections = (() => {
    switch (intent) {
      case "ranking":
        return 10;
      case "comparison":
        return 8;
      case "metrics":
        return 6;
      case "process":
        return 6;
      default:
        return MAX_SECTIONS; // 4 for overview
    }
  })();
  const violations: string[] = [];
  let removedParagraphs = 0;
  let truncatedLabels = 0;
  const originalSections = content.sections.length;

  // Deep clone to avoid mutating input
  const out: StructuredContent = JSON.parse(JSON.stringify(content));

  // ── Title: max 8 words ──────────────────────────────────────
  const titleResult = truncateWords(out.title, MAX_TITLE_WORDS);
  if (titleResult.truncated) {
    violations.push(
      `Title truncated from "${out.title}" to "${titleResult.text}"`,
    );
    out.title = titleResult.text;
  }

  // ── Subtitle: max 15 words ──────────────────────────────────
  const subtitleResult = truncateWords(out.subtitle, MAX_SUBTITLE_WORDS);
  if (subtitleResult.truncated) {
    violations.push(
      `Subtitle truncated from "${out.subtitle}" to "${subtitleResult.text}"`,
    );
    out.subtitle = subtitleResult.text;
  }

  // ── Max 6 sections (drop last ones) ─────────────────────────
  if (out.sections.length > maxSections) {
    const removed = out.sections.length - maxSections;
    violations.push(
      `Removed ${removed} section(s) beyond limit of ${maxSections} (intent: ${intent || "overview"})`,
    );
    out.sections = out.sections.slice(0, maxSections);
  }

  // ── Per-section enforcement ─────────────────────────────────
  for (const section of out.sections) {
    // Heading: cap words, but NEVER leave a heading ending in "..." — a cut-off
    // headline reads as broken (worst on the clean McKinsey style). Strip any ellipsis.
    const headingResult = truncateWords(section.heading, MAX_HEADING_WORDS);
    if (headingResult.truncated) {
      violations.push(
        `Heading truncated: "${section.heading}" → "${headingResult.text}"`,
      );
      truncatedLabels++;
    }
    section.heading = headingResult.text
      .replace(/\s*(\.\.\.|…)\s*$/, "")
      .trim();

    // keyConcept: keep for ranking/comparison (truncate to 1 sentence), remove for overview
    if (section.keyConcept && section.keyConcept.length > 0) {
      if (intent === "ranking" || intent === "comparison") {
        // Keep first sentence only
        const firstSentence = section.keyConcept.split(/[.!?]\s/)[0];
        if (firstSentence.length < section.keyConcept.length) {
          section.keyConcept = firstSentence + ".";
        }
      } else {
        removedParagraphs++;
        section.keyConcept = "";
      }
    }

    // Content array: max 2 items, max 40 chars each
    if (section.content.length > MAX_CONTENT_ITEMS) {
      const removed = section.content.length - MAX_CONTENT_ITEMS;
      violations.push(
        `Removed ${removed} content item(s) from section "${section.heading}"`,
      );
      section.content = section.content.slice(0, MAX_CONTENT_ITEMS);
    }
    // An empty result means nothing could be said honestly in the space — drop the
    // line rather than print a fragment of a sentence.
    section.content = section.content
      .map((item) => {
        const result = truncateChars(item, MAX_CONTENT_ITEM_CHARS);
        if (result.truncated) {
          truncatedLabels++;
          violations.push(
            result.text
              ? `Content item shortened: "${item}" → "${result.text}"`
              : `Content item DROPPED (no honest fit): "${item}"`,
          );
        }
        return result.text;
      })
      .filter((t) => t.length > 0);

    // Labels: max 4 per section, max 25 chars each
    if (section.labels.length > MAX_LABELS_PER_SECTION) {
      const removed = section.labels.length - MAX_LABELS_PER_SECTION;
      violations.push(
        `Removed ${removed} label(s) from section "${section.heading}"`,
      );
      section.labels = section.labels.slice(0, MAX_LABELS_PER_SECTION);
    }
    section.labels = section.labels
      .map((label) => {
        const result = truncateChars(label, MAX_LABEL_CHARS);
        if (result.truncated) {
          truncatedLabels++;
          violations.push(
            result.text
              ? `Label shortened: "${label}" → "${result.text}"`
              : `Label DROPPED (no honest fit): "${label}"`,
          );
        }
        return result.text;
      })
      .filter((t) => t.length > 0);
  }

  // ── Stats bar: max 6 items ──────────────────────────────────
  if (out.statsBar.length > MAX_STATS_BAR) {
    const removed = out.statsBar.length - MAX_STATS_BAR;
    violations.push(
      `Removed ${removed} stats bar item(s) beyond limit of ${MAX_STATS_BAR}`,
    );
    out.statsBar = out.statsBar.slice(0, MAX_STATS_BAR);
  }

  // Stats values: number + max 3-word label
  for (const stat of out.statsBar) {
    if (!stat.value || stat.value.trim() === "") {
      violations.push(`Empty stats bar value for label "${stat.label}"`);
    }
    const labelResult = truncateWords(stat.label, MAX_STAT_LABEL_WORDS);
    if (labelResult.truncated) {
      violations.push(
        `Stat label truncated: "${stat.label}" → "${labelResult.text}"`,
      );
      stat.label = labelResult.text;
      truncatedLabels++;
    }
  }

  const finalSections = out.sections.length;
  const passed = violations.length === 0;

  const report: DensityReport = {
    passed,
    originalSections,
    finalSections,
    removedParagraphs,
    truncatedLabels,
    violations,
  };

  console.log(
    `[density] ${passed ? "PASS" : "ENFORCED"}: ${violations.length} violations, ${originalSections}→${finalSections} sections, ${removedParagraphs} paragraphs removed, ${truncatedLabels} labels truncated`,
  );

  return { content: out, report };
}
