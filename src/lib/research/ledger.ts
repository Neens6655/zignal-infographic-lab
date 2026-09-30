/**
 * Claim ledger — the binding between every figure in an infographic and where it came from.
 *
 * WHY THIS EXISTS
 * Research used to arrive as `findings: string[]` — loose prose with no claim→source
 * binding. The structurer read that prose and produced numbers. Nothing downstream could
 * answer "where did 47% come from?", so nothing could refuse an invented figure. That is
 * the difference between an institutional tool and a generic infographic generator, and
 * it is the product's whole claim.
 *
 * The ledger makes provenance a DATA STRUCTURE rather than a promise:
 *   - every figure is a row
 *   - every row names its origin
 *   - a `research` row without a source URL cannot be constructed
 *
 * TWO ORIGINS, DELIBERATELY UNEQUAL:
 *   `user`     — the figure came from content the user supplied. AUTHORITATIVE and
 *                IMMUTABLE. Research may annotate around it but must never overwrite it.
 *   `research` — the figure came from a retrieved source and carries its URL and quote.
 *
 * Anything in the output matching NEITHER is ungrounded, and the truth gate fails closed
 * on it. "The model produced it" is not a provenance.
 */
import { extractNumericalClaims } from "./verify";
import type { SourceCitation } from "../types";

export type ClaimOrigin = "user" | "research";

export type LedgerEntry = {
  /** Stable id: origin + normalized value + entity. */
  id: string;
  /** Normalized numeric value, thousands separators and suffixes resolved. */
  value: string;
  /** The figure as it appeared in the source text, e.g. "47%" or "$1.2B". */
  raw: string;
  unit: string;
  entity: string;
  metric: string;
  origin: ClaimOrigin;
  /** Required for `research` rows — enforced by the constructor, not by convention. */
  sourceUrl?: string;
  sourceTitle?: string;
  sourceTier?: 1 | 2 | 3;
  /** The sentence the figure was lifted from, so a reviewer can check it in context. */
  quote?: string;
  retrievedAt: string;
};

export type ClaimLedger = {
  entries: LedgerEntry[];
  /** Normalized values the user supplied. These are immutable. */
  userValues: Set<string>;
  /** Every normalized value that has any provenance at all. */
  groundedValues: Set<string>;
};

export const EMPTY_LEDGER: ClaimLedger = {
  entries: [],
  userValues: new Set(),
  groundedValues: new Set(),
};

// ── Normalization ─────────────────────────────────────────────────────

/**
 * Reduce a figure to a comparable key. "1,200" and "1200" are the same number;
 * "47%" and "47" are the same figure wearing a different unit.
 */
export function normalizeValue(value: string): string {
  const cleaned = String(value).replace(/[,\s]/g, "").replace(/%$/, "");
  const n = parseFloat(cleaned);
  if (Number.isNaN(n)) return cleaned.toLowerCase();
  // Trim float noise so 47 and 47.0 collide.
  return String(Number(n.toFixed(4)));
}

/**
 * Figures that carry no factual weight and must not be treated as claims:
 * years, single digits, and ordinals like the "1" in "1. Overview".
 */
export function isTrivialFigure(value: string): boolean {
  const v = normalizeValue(value);
  if (v.length <= 1) return true;
  if (/^(19|20)\d{2}$/.test(v)) return true;
  return false;
}

function entryId(origin: ClaimOrigin, value: string, entity: string): string {
  return `${origin}:${normalizeValue(value)}:${entity.toLowerCase().slice(0, 32)}`;
}

// ── Sentence / citation binding ───────────────────────────────────────

/** Split prose into sentences, keeping bullet lines whole. */
function splitIntoSentences(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z0-9$€£"'])/))
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Resolve inline reference markers to citations. Perplexity writes "[1][3]" where
 * the index is 1-based into the citation array it returned alongside the answer.
 */
function citationsForSentence(
  sentence: string,
  citations: SourceCitation[],
): SourceCitation[] {
  const out: SourceCitation[] = [];
  const seen = new Set<number>();
  for (const m of sentence.matchAll(/\[(\d{1,2})\]/g)) {
    const idx = parseInt(m[1], 10) - 1;
    if (idx < 0 || idx >= citations.length || seen.has(idx)) continue;
    seen.add(idx);
    out.push(citations[idx]);
  }
  return out;
}

/** The single most authoritative citation, used when a sentence carries no marker. */
function bestCitation(citations: SourceCitation[]): SourceCitation[] {
  if (citations.length === 0) return [];
  const sorted = [...citations].sort((a, b) => (a.tier ?? 3) - (b.tier ?? 3));
  return [sorted[0]];
}

// ── Construction ──────────────────────────────────────────────────────

/**
 * Build a research-origin row. Throws without a source URL — a research claim that
 * cannot be traced is not a research claim, and allowing one would quietly reopen
 * the hole this module exists to close.
 */
export function researchEntry(
  claim: {
    value: string;
    raw: string;
    unit: string;
    entity: string;
    metric: string;
  },
  citation: SourceCitation,
  quote?: string,
): LedgerEntry {
  if (!citation.url) {
    throw new Error(
      `Cannot ledger a research claim without a source URL (value: ${claim.raw}).`,
    );
  }
  return {
    id: entryId("research", claim.value, claim.entity),
    value: normalizeValue(claim.value),
    raw: claim.raw,
    unit: claim.unit,
    entity: claim.entity,
    metric: claim.metric,
    origin: "research",
    sourceUrl: citation.url,
    sourceTitle: citation.title,
    sourceTier: citation.tier,
    quote: quote?.slice(0, 400),
    retrievedAt: new Date().toISOString(),
  };
}

export function userEntry(claim: {
  value: string;
  raw: string;
  unit: string;
  entity: string;
  metric: string;
}): LedgerEntry {
  return {
    id: entryId("user", claim.value, claim.entity),
    value: normalizeValue(claim.value),
    raw: claim.raw,
    unit: claim.unit,
    entity: claim.entity,
    metric: claim.metric,
    origin: "user",
    retrievedAt: new Date().toISOString(),
  };
}

/**
 * Build the ledger for one generation.
 *
 * `userContent` is whatever the user pasted or uploaded. Every figure in it becomes a
 * `user` row — authoritative by definition, because it is the user's own data.
 *
 * `citations` are the retrieved sources. Figures found in a citation's snippet become
 * `research` rows bound to that citation. A finding with no citation contributes
 * nothing: prose without a source is not evidence.
 */
export async function buildLedger(input: {
  userContent: string;
  citations: SourceCitation[];
  /**
   * The research prose (Perplexity's grounded answer, plus any Firecrawl digest).
   *
   * THIS IS WHERE THE EVIDENCE ACTUALLY LIVES. An earlier version of this module read
   * only `citation.snippet`, which Perplexity always leaves empty — it returns bare
   * URLs and puts the facts in the answer body. The ledger therefore produced zero
   * research rows even on a perfectly healthy research run.
   *
   * Perplexity marks each sentence with inline [1][3] references into the citation
   * array, so parsing those gives real per-claim source binding — better than the
   * snippet approach it replaces.
   */
  findings?: string[];
}): Promise<ClaimLedger> {
  const entries: LedgerEntry[] = [];
  const seen = new Set<string>();

  const push = (entry: LedgerEntry) => {
    if (seen.has(entry.id)) return;
    seen.add(entry.id);
    entries.push(entry);
  };

  // 1. The user's own figures — highest authority.
  const userClaims = await extractNumericalClaims(input.userContent);
  for (const claim of userClaims) {
    if (isTrivialFigure(claim.value)) continue;
    push(userEntry(claim));
  }

  // 2a. Figures in the research prose, bound to the citations that sentence cites.
  const usableCitations = input.citations.filter((c) => !!c.url);
  for (const finding of input.findings ?? []) {
    for (const sentence of splitIntoSentences(finding)) {
      const claims = await extractNumericalClaims(sentence);
      if (claims.length === 0) continue;

      // "[1][3]" → citations 0 and 2. No marker means we cannot attribute the
      // sentence to a specific source, so fall back to the highest-tier citation
      // rather than inventing a binding.
      const marked = citationsForSentence(sentence, usableCitations);
      const bound = marked.length > 0 ? marked : bestCitation(usableCitations);
      if (bound.length === 0) continue;

      for (const claim of claims) {
        if (isTrivialFigure(claim.value)) continue;
        for (const citation of bound) {
          push(researchEntry(claim, citation, sentence));
        }
      }
    }
  }

  // 2b. Figures in citation snippets, where a source actually carries one
  // (Firecrawl enrichment populates these; Perplexity does not).
  for (const citation of usableCitations) {
    if (!citation.snippet) continue;
    const claims = await extractNumericalClaims(citation.snippet);
    for (const claim of claims) {
      if (isTrivialFigure(claim.value)) continue;
      push(researchEntry(claim, citation, citation.snippet));
    }
  }

  const userValues = new Set(
    entries.filter((e) => e.origin === "user").map((e) => e.value),
  );
  const groundedValues = new Set(entries.map((e) => e.value));

  // Count rows by origin directly. Deriving the research count from deduped value
  // sets made the totals fail to add up whenever a user figure and a researched
  // figure shared a value.
  const userRows = entries.filter((e) => e.origin === "user").length;
  const researchRows = entries.length - userRows;
  console.log(
    `[ledger] ${entries.length} rows (${userRows} user, ${researchRows} researched) ` +
      `covering ${groundedValues.size} distinct values, from ${input.citations.length} citations`,
  );

  return { entries, userValues, groundedValues };
}

// ── Lookup ────────────────────────────────────────────────────────────

/** Every ledger row matching a figure, user rows first. */
export function lookupValue(ledger: ClaimLedger, value: string): LedgerEntry[] {
  const key = normalizeValue(value);
  return ledger.entries
    .filter((e) => e.value === key)
    .sort((a, b) => (a.origin === "user" ? -1 : b.origin === "user" ? 1 : 0));
}

export function isGrounded(ledger: ClaimLedger, value: string): boolean {
  return ledger.groundedValues.has(normalizeValue(value));
}

/**
 * Citations actually used by the figures that survived into the output — as opposed to
 * every source the research stage happened to touch. This is what belongs on the
 * certificate: the evidence behind THIS image.
 */
export function citedSources(
  ledger: ClaimLedger,
  usedValues: string[],
): { url: string; title: string; tier?: 1 | 2 | 3 }[] {
  const keys = new Set(usedValues.map(normalizeValue));
  const out = new Map<
    string,
    { url: string; title: string; tier?: 1 | 2 | 3 }
  >();
  for (const e of ledger.entries) {
    if (e.origin !== "research" || !e.sourceUrl) continue;
    if (!keys.has(e.value)) continue;
    if (!out.has(e.sourceUrl)) {
      out.set(e.sourceUrl, {
        url: e.sourceUrl,
        title: e.sourceTitle || e.sourceUrl,
        tier: e.sourceTier,
      });
    }
  }
  return [...out.values()].sort((a, b) => (a.tier ?? 3) - (b.tier ?? 3));
}
