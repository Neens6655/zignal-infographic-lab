import type {
  SourceCitation,
  VerifiedClaim,
  CredibilityScore,
  NumericalClaim,
  NumberClassification,
  NumberVerification,
  NumberAudit,
} from '../types';

// ── Helpers ──────────────────────────────────────────────────────

const MULTIPLIERS: Record<string, number> = {
  trillion: 1e12, trn: 1e12, t: 1e12,
  billion: 1e9, bln: 1e9, bn: 1e9, b: 1e9,
  million: 1e6, mln: 1e6, mn: 1e6, m: 1e6,
  thousand: 1e3, k: 1e3,
};

/** Strip commas and parse a raw numeric string to a float, expanding suffixes. */
function parseNumber(raw: string): number {
  const cleaned = raw.replace(/,/g, '').trim();

  // Try suffix like "2.2B", "45M", "1.3T", "15K"
  const suffixMatch = cleaned.match(/^([+-]?\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);
  if (suffixMatch) {
    const num = parseFloat(suffixMatch[1]);
    const suffix = suffixMatch[2].toLowerCase();
    const mult = MULTIPLIERS[suffix];
    if (mult) return num * mult;
  }

  // Try "2.2 billion", "$260 billion"
  const wordMatch = cleaned.match(/^([+-]?\d+(?:\.\d+)?)\s+(trillion|trn|billion|bln|bn|million|mln|mn|thousand)/i);
  if (wordMatch) {
    const num = parseFloat(wordMatch[1]);
    const word = wordMatch[2].toLowerCase();
    const mult = MULTIPLIERS[word];
    if (mult) return num * mult;
  }

  return parseFloat(cleaned);
}

/** Normalize a value string for comparison — returns a numeric value or NaN. */
function normalizeValue(val: string): number {
  const stripped = val.replace(/^[$€£¥]/, '').trim();
  return parseNumber(stripped);
}

/** Compute divergence between two numbers as a percentage (0-based). */
function divergence(a: number, b: number): number {
  if (a === 0 && b === 0) return 0;
  const denom = Math.max(Math.abs(a), Math.abs(b));
  if (denom === 0) return 100;
  return (Math.abs(a - b) / denom) * 100;
}

/** Simple word-overlap similarity between two strings (0..1). */
function wordSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  return overlap / Math.max(wordsA.size, wordsB.size);
}

/** Split text into sentences. */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── Claim-level regex ────────────────────────────────────────────

const NUMBER_SENTENCE_RE =
  /(?:\$|€|£|¥)?\d[\d,.]*\s*(?:trillion|trn|billion|bln|bn|million|mln|mn|thousand|[TBMK])\b|\d[\d,.]*\s*%|\$[\d,.]+|\b\d{2,}[\d,.]*\b/i;

// Separate regexes instead of one with named capture groups (ES2018 compat)
const CURRENCY_RE = /[$€£¥]\s*(\d[\d,.]*)\s*(trillion|trn|billion|bln|bn|million|mln|mn|thousand|[TBMK])?/gi;
const PERCENT_RE = /(\d[\d,.]*)\s*%/g;
const SUFFIXED_RE = /(\d[\d,.]*)\s*(trillion|trn|billion|bln|bn|million|mln|mn|thousand)/gi;
const PLAIN_NUM_RE = /(\d[\d,.]+)\s*([a-zA-Z]+)/g;

/** Extract the primary noun phrase before/after a number as the entity. */
function extractContext(sentence: string, matchStr: string): { entity: string; metric: string } {
  const idx = sentence.indexOf(matchStr);
  const before = sentence.slice(0, idx).trim();
  const after = sentence.slice(idx + matchStr.length).trim();

  // Entity: last 1-4 words before the number, or first 1-4 words after
  const beforeWords = before.split(/\s+/).filter(Boolean);
  const afterWords = after.split(/\s+/).filter(Boolean);

  const entity = beforeWords.slice(-4).join(' ') || afterWords.slice(0, 4).join(' ') || 'unknown';
  const metric = afterWords.slice(0, 4).join(' ') || beforeWords.slice(-4).join(' ') || 'unknown';

  return { entity, metric };
}

// ── Exported Functions ───────────────────────────────────────────

/**
 * Extract factual claims from text — any sentence containing a number,
 * percentage, or monetary value is treated as a claim.
 */
export async function extractClaims(text: string): Promise<VerifiedClaim[]> {
  if (!text || !text.trim()) return [];

  const sentences = splitSentences(text);
  const claims: VerifiedClaim[] = [];

  for (const sentence of sentences) {
    if (!NUMBER_SENTENCE_RE.test(sentence)) continue;

    // Find the first number match for entity/metric extraction
    CURRENCY_RE.lastIndex = 0;
    PERCENT_RE.lastIndex = 0;
    SUFFIXED_RE.lastIndex = 0;
    const m = CURRENCY_RE.exec(sentence) || PERCENT_RE.exec(sentence) || SUFFIXED_RE.exec(sentence);
    const matchStr = m ? m[0] : '';
    const { entity, metric } = extractContext(sentence, matchStr);

    claims.push({
      text: sentence,
      entity,
      metric,
      verified: false,
      sources: [],
    });
  }

  return claims;
}

/**
 * Cross-verify claims against citation snippets.
 * A claim is verified when at least one citation mentions a similar entity
 * and a similar metric/value in its snippet.
 */
export async function crossVerifyClaims(
  claims: VerifiedClaim[],
  citations: SourceCitation[],
): Promise<VerifiedClaim[]> {
  if (claims.length === 0 || citations.length === 0) return claims;

  return claims.map((claim) => {
    const matchingSources: SourceCitation[] = [];

    for (const citation of citations) {
      const snippet = (citation.snippet || '').toLowerCase();
      const entityWords = claim.entity.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      const metricWords = claim.metric.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

      const entityHit = entityWords.length === 0 || entityWords.some((w) => snippet.includes(w));
      const metricHit = metricWords.length === 0 || metricWords.some((w) => snippet.includes(w));

      if (entityHit && metricHit) {
        matchingSources.push(citation);
      }
    }

    return {
      ...claim,
      verified: matchingSources.length > 0,
      sources: matchingSources,
    };
  });
}

/**
 * Compute an overall credibility score from verified claims.
 */
export function computeCredibilityScore(
  claims: VerifiedClaim[],
  _citations: SourceCitation[],
): CredibilityScore {
  const total = claims.length;
  if (total === 0) {
    return { overall: 50, claimsTotal: 0, claimsCrossVerified: 0, confidence: 'low' };
  }

  const verified = claims.filter((c) => c.verified).length;
  const overall = (verified / total) * 100;

  let confidence: 'high' | 'medium' | 'low';
  if (overall >= 70) confidence = 'high';
  else if (overall >= 40) confidence = 'medium';
  else confidence = 'low';

  return { overall, claimsTotal: total, claimsCrossVerified: verified, confidence };
}

/**
 * Extract all numerical values with surrounding context from text.
 */
export async function extractNumericalClaims(text: string): Promise<NumericalClaim[]> {
  if (!text || !text.trim()) return [];

  const results: NumericalClaim[] = [];
  const seen = new Set<string>();
  const sentences = splitSentences(text);

  for (const sentence of sentences) {
    let match: RegExpExecArray | null;

    // Currency: $260B, €2.2 billion
    CURRENCY_RE.lastIndex = 0;
    while ((match = CURRENCY_RE.exec(sentence)) !== null) {
      const raw = match[0];
      if (seen.has(raw)) continue;
      seen.add(raw);
      const numPart = match[1].replace(/,/g, '');
      const suffix = match[2] || '';
      const mult = MULTIPLIERS[suffix.toLowerCase()] || 1;
      const value = String(parseFloat(numPart) * mult);
      const unit = raw.charAt(0); // currency symbol
      const { entity, metric } = extractContext(sentence, raw);
      results.push({ value, entity, metric, unit, raw });
    }

    // Percentage: 70%
    PERCENT_RE.lastIndex = 0;
    while ((match = PERCENT_RE.exec(sentence)) !== null) {
      const raw = match[0];
      if (seen.has(raw)) continue;
      seen.add(raw);
      const value = match[1].replace(/,/g, '');
      const { entity, metric } = extractContext(sentence, raw);
      results.push({ value, entity, metric, unit: '%', raw });
    }

    // Suffixed: 2.2 billion, 45M
    SUFFIXED_RE.lastIndex = 0;
    while ((match = SUFFIXED_RE.exec(sentence)) !== null) {
      const raw = match[0];
      if (seen.has(raw)) continue;
      seen.add(raw);
      const numPart = match[1].replace(/,/g, '');
      const suffix = match[2];
      const mult = MULTIPLIERS[suffix.toLowerCase()] || 1;
      const value = String(parseFloat(numPart) * mult);
      const { entity, metric } = extractContext(sentence, raw);
      results.push({ value, entity, metric, unit: suffix.toLowerCase(), raw });
    }

    // Plain number with unit: 15,400 liters
    PLAIN_NUM_RE.lastIndex = 0;
    while ((match = PLAIN_NUM_RE.exec(sentence)) !== null) {
      const raw = match[0];
      if (seen.has(raw)) continue;
      seen.add(raw);
      const value = match[1].replace(/,/g, '');
      const unit = match[2] || '';
      // Skip if it's a year-like number
      if (/^(19|20)\d{2}$/.test(value)) continue;
      const { entity, metric } = extractContext(sentence, raw);
      results.push({ value, entity, metric, unit, raw });
    }
  }

  return results;
}

/**
 * Cross-verify numerical claims from content against research numbers.
 * Classifies each as exact, close, conflicting, or unverified.
 */
export function crossVerifyNumbers(
  contentNumbers: NumericalClaim[],
  researchNumbers: NumericalClaim[],
): NumberAudit {
  const exact: NumberVerification[] = [];
  const close: NumberVerification[] = [];
  const conflicting: NumberVerification[] = [];
  const unverified: NumberVerification[] = [];

  for (const content of contentNumbers) {
    // Find the best matching research number by entity+metric similarity
    let bestMatch: NumericalClaim | null = null;
    let bestScore = 0;

    for (const research of researchNumbers) {
      const entitySim = wordSimilarity(content.entity, research.entity);
      const metricSim = wordSimilarity(content.metric, research.metric);
      const score = entitySim * 0.6 + metricSim * 0.4;

      if (score > bestScore && score > 0.15) {
        bestScore = score;
        bestMatch = research;
      }
    }

    if (!bestMatch) {
      unverified.push({
        contentClaim: content,
        researchClaim: null,
        classification: 'unverified',
        divergencePct: 0,
      });
      continue;
    }

    const contentVal = normalizeValue(content.value);
    const researchVal = normalizeValue(bestMatch.value);

    let classification: NumberClassification;
    let divergencePct: number;

    if (isNaN(contentVal) || isNaN(researchVal)) {
      classification = 'unverified';
      divergencePct = 0;
      unverified.push({ contentClaim: content, researchClaim: bestMatch, classification, divergencePct });
      continue;
    }

    divergencePct = divergence(contentVal, researchVal);

    if (divergencePct === 0) {
      classification = 'exact';
      exact.push({ contentClaim: content, researchClaim: bestMatch, classification, divergencePct });
    } else if (divergencePct < 10) {
      classification = 'close';
      close.push({ contentClaim: content, researchClaim: bestMatch, classification, divergencePct });
    } else {
      classification = 'conflicting';
      conflicting.push({ contentClaim: content, researchClaim: bestMatch, classification, divergencePct });
    }
  }

  const totalClaims = contentNumbers.length;
  let confidenceLevel: 'verified' | 'partially_verified' | 'estimates';

  if (totalClaims === 0) {
    confidenceLevel = 'estimates';
  } else if (conflicting.length === 0 && unverified.length / totalClaims < 0.2) {
    confidenceLevel = 'verified';
  } else if (unverified.length / totalClaims > 0.5) {
    confidenceLevel = 'estimates';
  } else {
    confidenceLevel = 'partially_verified';
  }

  return { totalClaims, exact, close, conflicting, unverified, confidenceLevel };
}
