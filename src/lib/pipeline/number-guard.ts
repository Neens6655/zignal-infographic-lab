/**
 * Number correction — applies cross-verified figures to structured content.
 *
 * WHY THIS FILE EXISTS
 * `run.ts` computed `numberCorrections` and then never used it. The comment claimed the
 * corrections were "injected into the prompt suffix"; they were not — the variable was
 * assigned and dropped. Meanwhile provenance still reported `numberAudit.corrections`,
 * so the certificate advertised fixes that never reached the image. A gate that reports
 * a correction it did not apply is worse than no gate.
 *
 * On the hybrid renderer, text is DATA — it is typeset by Satori from this structure,
 * not drawn by a model. So the correct place to fix a number is the structure itself,
 * before layout planning. That makes the fix exact and verifiable rather than a request.
 *
 * INPUT FIDELITY: callers must only run this when the content is NOT self-contained.
 * If the user supplied the figures, their data is authoritative and research may annotate
 * but never overwrite it.
 */
import type { StructuredContent } from "./types";
import type { NumberAudit } from "../types";

export type AppliedCorrection = {
  field: string;
  from: string;
  to: string;
  entity: string;
  metric: string;
};

/** Escape a string for use as a literal in a RegExp. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replace a numeric value inside a text fragment, matching on a word boundary so
 * "12" does not corrupt "120". Returns the original string when nothing matched.
 */
function replaceValue(text: string, from: string, to: string): string {
  if (!from || !to || from === to) return text;
  // Match the number with optional thousands separators, not inside a longer number.
  const pattern = new RegExp(
    `(?<![\\d.,])${escapeRegExp(from)}(?![\\d.,])`,
    "g",
  );
  return text.replace(pattern, to);
}

/**
 * Apply every conflicting-number correction from the audit to the structured content.
 *
 * Returns a NEW content object plus the list of corrections that actually changed
 * something. A correction that matched nothing is reported as unapplied rather than
 * silently counted — that distinction is the whole point of this module.
 */
export function applyNumberCorrections(
  content: StructuredContent,
  audit: NumberAudit | undefined,
): {
  content: StructuredContent;
  applied: AppliedCorrection[];
  unapplied: AppliedCorrection[];
} {
  const applied: AppliedCorrection[] = [];
  const unapplied: AppliedCorrection[] = [];

  if (!audit || audit.conflicting.length === 0) {
    return { content, applied, unapplied };
  }

  // Deep-ish clone of the fields we mutate.
  const next: StructuredContent = {
    ...content,
    sections: content.sections.map((s) => ({
      ...s,
      content: [...s.content],
      labels: [...s.labels],
    })),
    statsBar: content.statsBar.map((s) => ({ ...s })),
  };

  for (const conflict of audit.conflicting) {
    const research = conflict.researchClaim;
    if (!research) continue;

    const from = String(conflict.contentClaim.value);
    const to = String(research.value);
    if (!from || !to || from === to) continue;

    const record: AppliedCorrection = {
      field: "",
      from,
      to,
      entity: conflict.contentClaim.entity,
      metric: conflict.contentClaim.metric,
    };

    let changed = false;

    for (const stat of next.statsBar) {
      const updated = replaceValue(stat.value, from, to);
      if (updated !== stat.value) {
        stat.value = updated;
        record.field = record.field || `statsBar.${stat.label}`;
        changed = true;
      }
    }

    for (const section of next.sections) {
      for (let i = 0; i < section.content.length; i++) {
        const updated = replaceValue(section.content[i], from, to);
        if (updated !== section.content[i]) {
          section.content[i] = updated;
          record.field = record.field || `sections.${section.heading}.content`;
          changed = true;
        }
      }
      for (let i = 0; i < section.labels.length; i++) {
        const updated = replaceValue(section.labels[i], from, to);
        if (updated !== section.labels[i]) {
          section.labels[i] = updated;
          record.field = record.field || `sections.${section.heading}.labels`;
          changed = true;
        }
      }
    }

    if (changed) {
      applied.push(record);
    } else {
      unapplied.push({ ...record, field: "no match in rendered text" });
    }
  }

  return { content: next, applied, unapplied };
}
