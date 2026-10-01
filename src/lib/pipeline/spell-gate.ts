/**
 * Spell gate — the one text defect the hybrid renderer cannot prevent.
 *
 * Typesetting the text ourselves guarantees the GLYPHS match the data. It cannot make
 * the data right. A live render titled "GEQFENCING: THE VIRTUAL PERIMETER STRATEGY"
 * proved the point: Satori reproduced the structurer's typo flawlessly, at 40px, as
 * the first thing a reader sees. Every gate passed it — the contrast was fine, the
 * layout was clean, the figure was sourced. The word was simply wrong.
 *
 * A general spell-checker is the wrong tool here: infographic copy is full of proper
 * nouns, tickers and coined terms that a dictionary would reject, and a gate that
 * cries wolf gets switched off. So this checks a NARROW, high-confidence class:
 *
 *   1. the brief's own vocabulary — if the user wrote "geofencing" and the title says
 *      "geqfencing", that is a typo by definition, not a stylistic choice;
 *   2. single-character corruptions of a word the brief uses (edit distance 1 on a
 *      word of 6+ characters), which is the exact signature of a model slip;
 *   3. structural damage — doubled letters inside a word that has none, stray
 *      punctuation mid-word, a lone capital adrift in lowercase.
 *
 * It only inspects the loud text: title, subtitle and section headings. Body copy is
 * lower stakes and higher variance, and flagging it would produce the noise that
 * kills the gate.
 */
import type { StructuredContent } from "./types";

export type SpellIssue = {
  field: string;
  found: string;
  /** The brief's spelling, when the typo is a corruption of a word the user wrote. */
  expected?: string;
  reason: "brief-mismatch" | "structural";
};

/** Levenshtein, capped — we only care about distance 1. */
function isOneEdit(a: string, b: string): boolean {
  if (a === b) return false;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;

  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (la > lb) i++;
    else if (lb > la) j++;
    else {
      i++;
      j++;
    }
  }
  if (i < la || j < lb) edits++;
  return edits === 1;
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? [];
}

/** Loud text only — the lines a reader sees first and judges the document by. */
function headlineFields(
  content: StructuredContent,
): { field: string; text: string }[] {
  const out = [{ field: "title", text: content.title }];
  if (content.subtitle) out.push({ field: "subtitle", text: content.subtitle });
  content.sections.forEach((s, i) => {
    out.push({ field: `sections[${i}].heading`, text: s.heading });
  });
  return out.filter((f) => !!f.text?.trim());
}

export function checkSpelling(
  content: StructuredContent,
  briefText: string,
): SpellIssue[] {
  const issues: SpellIssue[] = [];
  const brief = new Set(words(briefText));
  // Words the brief uses that are long enough for a one-edit slip to be meaningful.
  const briefLong = [...brief].filter((w) => w.length >= 6);

  for (const { field, text } of headlineFields(content)) {
    for (const raw of text.split(/\s+/)) {
      const w = raw.toLowerCase().replace(/[^a-z'-]/g, "");
      if (w.length < 6) continue;
      if (brief.has(w)) continue;

      // 1-2. A near-miss of a word the brief actually used.
      const near = briefLong.find((b) => isOneEdit(w, b));
      if (near) {
        issues.push({
          field,
          found: raw,
          expected: near,
          reason: "brief-mismatch",
        });
        continue;
      }

      // 3. Structural damage that is wrong in any vocabulary.
      if (/(.)\1\1/.test(w) || /[a-z][.,;:][a-z]/.test(raw)) {
        issues.push({ field, found: raw, reason: "structural" });
      }
    }
  }

  return issues;
}

/**
 * Apply the corrections we are confident about: a headline word that is one edit from
 * a word the brief itself used. Case is preserved so an UPPERCASE title stays upper.
 */
export function applySpellFixes(
  content: StructuredContent,
  issues: SpellIssue[],
): { content: StructuredContent; fixed: SpellIssue[] } {
  const fixable = issues.filter(
    (i) => i.reason === "brief-mismatch" && i.expected,
  );
  if (fixable.length === 0) return { content, fixed: [] };

  const matchCase = (src: string, target: string) => {
    if (src === src.toUpperCase()) return target.toUpperCase();
    if (src[0] === src[0]?.toUpperCase()) {
      return target[0].toUpperCase() + target.slice(1);
    }
    return target;
  };

  const repair = (text: string) => {
    let out = text;
    for (const issue of fixable) {
      const bare = issue.found.replace(/[^A-Za-z'-]/g, "");
      if (!bare) continue;
      out = out.replace(
        new RegExp(`\\b${bare.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"),
        matchCase(bare, issue.expected!),
      );
    }
    return out;
  };

  const next: StructuredContent = {
    ...content,
    title: repair(content.title),
    subtitle: repair(content.subtitle),
    sections: content.sections.map((s) => ({
      ...s,
      heading: repair(s.heading),
    })),
  };

  return { content: next, fixed: fixable };
}
