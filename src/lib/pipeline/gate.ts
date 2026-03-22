/**
 * Quality Gates — ZGNAL Infographic Lab v2
 *
 * Pre-gen and post-gen gates to catch hallucinations, traceability gaps,
 * readability failures, and data integrity violations.
 */
import type { StructuredContent } from './types';
import type { VerifiedFactSet, GateResult } from '../types';

// ── Gate 1: Hallucination Check (Pre-gen) ─────────────────────

export function checkHallucination(
  content: StructuredContent,
  _verifiedFacts?: VerifiedFactSet
): GateResult {
  const failures: string[] = [];
  let validSections = 0;

  // Check statsBar values are non-empty
  for (const stat of content.statsBar) {
    if (!stat.value || stat.value.trim() === '') {
      failures.push(`Empty statsBar value for "${stat.label}"`);
    }
  }

  // Check sections have content (non-empty labels)
  for (const section of content.sections) {
    const hasLabels = section.labels.some((l) => l.trim().length > 0);
    const hasContent = section.content.some((c) => c.trim().length > 0);
    if (hasLabels || hasContent) {
      validSections++;
    } else {
      failures.push(`Section "${section.heading}" has no labels or content`);
    }
  }

  const total = content.sections.length;
  const score = total > 0 ? (validSections / total) * 100 : 0;
  const passed = score >= 80;

  console.log(`[gate:hallucination] score=${score.toFixed(1)}% (${validSections}/${total} sections valid) — ${passed ? 'PASS' : 'FAIL'}`);

  return {
    gate: 'hallucination',
    passed,
    score,
    details: `${validSections}/${total} sections have substantive content; ${failures.length} empty statsBar values`,
    failures,
  };
}

// ── Gate 2: Traceability Check (Pre-gen) ──────────────────────

export function checkTraceability(
  content: StructuredContent,
  verifiedFacts?: VerifiedFactSet
): GateResult {
  const failures: string[] = [];

  // Check sourceAttribution exists
  const hasAttribution = !!(content.sourceAttribution && content.sourceAttribution.trim().length > 0);
  if (!hasAttribution) {
    failures.push('Missing sourceAttribution');
  }

  // If verifiedFacts provided, check coverage
  let coverageScore = 100;
  if (verifiedFacts && verifiedFacts.facts.length > 0) {
    const totalFacts = verifiedFacts.facts.length;
    const traceable = verifiedFacts.facts.filter(
      (f) => f.sourceId && f.sourceId.trim().length > 0
    ).length;
    coverageScore = (traceable / totalFacts) * 100;
    if (coverageScore < 100) {
      failures.push(`${totalFacts - traceable}/${totalFacts} facts lack sourceId`);
    }
  }

  const score = hasAttribution ? coverageScore : 0;
  const passed = hasAttribution;

  console.log(`[gate:traceability] score=${score.toFixed(1)}% attribution=${hasAttribution} — ${passed ? 'PASS' : 'FAIL'}`);

  return {
    gate: 'traceability',
    passed,
    score,
    details: hasAttribution
      ? `Source attribution present. Fact coverage: ${coverageScore.toFixed(1)}%`
      : 'No source attribution found',
    failures,
  };
}

// ── Gate 3: Readability Check (Post-gen, OCR) ─────────────────

export async function checkReadability(
  ocrText: string,
  content: StructuredContent
): Promise<GateResult> {
  const failures: string[] = [];
  const expectedTexts: string[] = [];

  // Collect expected text fragments
  if (content.title) expectedTexts.push(content.title.replace(/\.{3}$/, ''));
  for (const section of content.sections) {
    if (section.heading) expectedTexts.push(section.heading.replace(/\.{3}$/, ''));
  }
  for (const stat of content.statsBar) {
    if (stat.value) expectedTexts.push(stat.value);
  }

  // Normalize OCR text for comparison
  const ocrNormalized = ocrText.toLowerCase().replace(/[^a-z0-9\s.,%$€£¥]/g, ' ');

  let found = 0;
  for (const text of expectedTexts) {
    const normalized = text.toLowerCase().replace(/[^a-z0-9\s.,%$€£¥]/g, ' ').trim();
    if (normalized.length < 2) {
      found++; // skip trivial strings
      continue;
    }
    // Check if at least the first 3 words appear in OCR
    const words = normalized.split(/\s+/).slice(0, 3).join(' ');
    if (ocrNormalized.includes(words)) {
      found++;
    } else {
      failures.push(`Not found in OCR: "${text}"`);
    }
  }

  const total = expectedTexts.length;
  const score = total > 0 ? (found / total) * 100 : 100;
  const passed = score >= 85;

  console.log(`[gate:readability] score=${score.toFixed(1)}% (${found}/${total} texts found in OCR) — ${passed ? 'PASS' : 'FAIL'}`);

  return {
    gate: 'readability',
    passed,
    score,
    details: `${found}/${total} expected text fragments found in OCR output`,
    failures,
  };
}

// ── Gate 4: Data Integrity Check (Post-gen, OCR) ──────────────

export async function checkDataIntegrity(
  ocrNumbers: string[],
  content: StructuredContent,
  _verifiedFacts?: VerifiedFactSet
): Promise<GateResult> {
  const failures: string[] = [];

  // Collect all known numbers from content
  const knownNumbers = new Set<string>();

  for (const stat of content.statsBar) {
    // Extract numeric parts from stat values
    const nums = stat.value.match(/[\d,.]+/g);
    if (nums) nums.forEach((n) => knownNumbers.add(n.replace(/,/g, '')));
  }

  for (const section of content.sections) {
    for (const label of section.labels) {
      const nums = label.match(/[\d,.]+/g);
      if (nums) nums.forEach((n) => knownNumbers.add(n.replace(/,/g, '')));
    }
    for (const item of section.content) {
      const nums = item.match(/[\d,.]+/g);
      if (nums) nums.forEach((n) => knownNumbers.add(n.replace(/,/g, '')));
    }
  }

  // Check each OCR number against known set
  const hallucinated: string[] = [];
  for (const ocrNum of ocrNumbers) {
    const cleaned = ocrNum.replace(/,/g, '');
    // Skip trivial numbers (single digits, years, etc.)
    if (cleaned.length <= 1) continue;
    if (/^(19|20)\d{2}$/.test(cleaned)) continue; // skip years

    if (!knownNumbers.has(cleaned)) {
      // Check if it's close to any known number (within 1%)
      const ocrVal = parseFloat(cleaned);
      if (!isNaN(ocrVal)) {
        const isClose = Array.from(knownNumbers).some((known) => {
          const knownVal = parseFloat(known);
          if (isNaN(knownVal) || knownVal === 0) return false;
          return Math.abs((ocrVal - knownVal) / knownVal) < 0.01;
        });
        if (!isClose) {
          hallucinated.push(ocrNum);
        }
      }
    }
  }

  if (hallucinated.length > 0) {
    failures.push(`Hallucinated numbers in image: ${hallucinated.join(', ')}`);
  }

  const score = ocrNumbers.length > 0
    ? ((ocrNumbers.length - hallucinated.length) / ocrNumbers.length) * 100
    : 100;
  const passed = hallucinated.length === 0;

  console.log(`[gate:data-integrity] score=${score.toFixed(1)}% hallucinated=${hallucinated.length} — ${passed ? 'PASS' : 'FAIL'}`);

  return {
    gate: 'data-integrity',
    passed,
    score,
    details: hallucinated.length === 0
      ? `All ${ocrNumbers.length} OCR numbers match content`
      : `${hallucinated.length} number(s) in image not found in content`,
    failures,
  };
}

// ── Run All Gates ─────────────────────────────────────────────

export async function runGates(
  content: StructuredContent,
  verifiedFacts?: VerifiedFactSet,
  ocrText?: string,
  ocrNumbers?: string[]
): Promise<{ passed: boolean; gates: GateResult[] }> {
  const gates: GateResult[] = [];

  // Pre-gen gates (always run)
  gates.push(checkHallucination(content, verifiedFacts));
  gates.push(checkTraceability(content, verifiedFacts));

  // Post-gen gates (only if OCR data provided)
  if (ocrText !== undefined) {
    gates.push(await checkReadability(ocrText, content));
  }
  if (ocrNumbers !== undefined) {
    gates.push(await checkDataIntegrity(ocrNumbers, content, verifiedFacts));
  }

  const passed = gates.every((g) => g.passed);

  console.log(`[gates] ${passed ? 'ALL PASS' : 'FAILED'}: ${gates.map((g) => `${g.gate}=${g.passed ? 'OK' : 'FAIL'}`).join(', ')}`);

  return { passed, gates };
}
