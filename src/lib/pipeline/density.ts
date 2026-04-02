/**
 * Content Density Enforcement — ZGNAL Infographic Lab v2
 *
 * Enforces strict content density rules BEFORE image generation.
 * Root cause of bad text rendering is too much text.
 */
import type { StructuredContent } from './types';

export type DensityReport = {
  passed: boolean;
  originalSections: number;
  finalSections: number;
  removedParagraphs: number;
  truncatedLabels: number;
  violations: string[];
};

const MAX_TITLE_WORDS = 7;
const MAX_SUBTITLE_WORDS = 12;
const MAX_SECTIONS = 4; // Was 6 — fewer sections = more breathing room = better illustrations
const MAX_HEADING_WORDS = 4;
const MAX_STATS_BAR = 5;
const MAX_STAT_LABEL_WORDS = 3;
const MAX_CONTENT_ITEMS = 1; // Was 2 — one key point per section, not two
const MAX_CONTENT_ITEM_CHARS = 30; // Was 40 — shorter = renders better
const MAX_LABELS_PER_SECTION = 3; // Was 4
const MAX_LABEL_CHARS = 20; // Was 25

function truncateWords(text: string, max: number): { text: string; truncated: boolean } {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= max) return { text, truncated: false };
  return { text: words.slice(0, max).join(' ') + '...', truncated: true };
}

function truncateChars(text: string, max: number): { text: string; truncated: boolean } {
  if (text.length <= max) return { text, truncated: false };
  return { text: text.slice(0, max - 3).trimEnd() + '...', truncated: true };
}

export function enforceDensity(content: StructuredContent): { content: StructuredContent; report: DensityReport } {
  const violations: string[] = [];
  let removedParagraphs = 0;
  let truncatedLabels = 0;
  const originalSections = content.sections.length;

  // Deep clone to avoid mutating input
  const out: StructuredContent = JSON.parse(JSON.stringify(content));

  // ── Title: max 8 words ──────────────────────────────────────
  const titleResult = truncateWords(out.title, MAX_TITLE_WORDS);
  if (titleResult.truncated) {
    violations.push(`Title truncated from "${out.title}" to "${titleResult.text}"`);
    out.title = titleResult.text;
  }

  // ── Subtitle: max 15 words ──────────────────────────────────
  const subtitleResult = truncateWords(out.subtitle, MAX_SUBTITLE_WORDS);
  if (subtitleResult.truncated) {
    violations.push(`Subtitle truncated from "${out.subtitle}" to "${subtitleResult.text}"`);
    out.subtitle = subtitleResult.text;
  }

  // ── Max 6 sections (drop last ones) ─────────────────────────
  if (out.sections.length > MAX_SECTIONS) {
    const removed = out.sections.length - MAX_SECTIONS;
    violations.push(`Removed ${removed} section(s) beyond limit of ${MAX_SECTIONS}`);
    out.sections = out.sections.slice(0, MAX_SECTIONS);
  }

  // ── Per-section enforcement ─────────────────────────────────
  for (const section of out.sections) {
    // Heading: max 4 words
    const headingResult = truncateWords(section.heading, MAX_HEADING_WORDS);
    if (headingResult.truncated) {
      violations.push(`Heading truncated: "${section.heading}" → "${headingResult.text}"`);
      section.heading = headingResult.text;
      truncatedLabels++;
    }

    // Eliminate keyConcept paragraph text
    if (section.keyConcept && section.keyConcept.length > 0) {
      removedParagraphs++;
      section.keyConcept = '';
    }

    // Content array: max 2 items, max 40 chars each
    if (section.content.length > MAX_CONTENT_ITEMS) {
      const removed = section.content.length - MAX_CONTENT_ITEMS;
      violations.push(`Removed ${removed} content item(s) from section "${section.heading}"`);
      section.content = section.content.slice(0, MAX_CONTENT_ITEMS);
    }
    section.content = section.content.map((item) => {
      const result = truncateChars(item, MAX_CONTENT_ITEM_CHARS);
      if (result.truncated) {
        truncatedLabels++;
        violations.push(`Content item truncated: "${item}" → "${result.text}"`);
      }
      return result.text;
    });

    // Labels: max 4 per section, max 25 chars each
    if (section.labels.length > MAX_LABELS_PER_SECTION) {
      const removed = section.labels.length - MAX_LABELS_PER_SECTION;
      violations.push(`Removed ${removed} label(s) from section "${section.heading}"`);
      section.labels = section.labels.slice(0, MAX_LABELS_PER_SECTION);
    }
    section.labels = section.labels.map((label) => {
      const result = truncateChars(label, MAX_LABEL_CHARS);
      if (result.truncated) {
        truncatedLabels++;
        violations.push(`Label truncated: "${label}" → "${result.text}"`);
      }
      return result.text;
    });
  }

  // ── Stats bar: max 6 items ──────────────────────────────────
  if (out.statsBar.length > MAX_STATS_BAR) {
    const removed = out.statsBar.length - MAX_STATS_BAR;
    violations.push(`Removed ${removed} stats bar item(s) beyond limit of ${MAX_STATS_BAR}`);
    out.statsBar = out.statsBar.slice(0, MAX_STATS_BAR);
  }

  // Stats values: number + max 3-word label
  for (const stat of out.statsBar) {
    if (!stat.value || stat.value.trim() === '') {
      violations.push(`Empty stats bar value for label "${stat.label}"`);
    }
    const labelResult = truncateWords(stat.label, MAX_STAT_LABEL_WORDS);
    if (labelResult.truncated) {
      violations.push(`Stat label truncated: "${stat.label}" → "${labelResult.text}"`);
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

  console.log(`[density] ${passed ? 'PASS' : 'ENFORCED'}: ${violations.length} violations, ${originalSections}→${finalSections} sections, ${removedParagraphs} paragraphs removed, ${truncatedLabels} labels truncated`);

  return { content: out, report };
}
