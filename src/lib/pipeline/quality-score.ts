/**
 * Quality score computation — 4-dimension scoring for infographic outputs.
 * Tracks: accuracy, traceability, readability, visual quality.
 */
import type { QualityScore, GateResult, VerifiedFactSet } from '../types';
import type { StructuredContent } from './types';

// ── Dimension weights ────────────────────────────────────────

const WEIGHTS = {
  accuracy: 0.30,
  traceability: 0.25,
  readability: 0.25,
  visualQuality: 0.20,
} as const;

const CLIENT_READY_THRESHOLD = 85;

// ── Score computation ────────────────────────────────────────

/**
 * Compute accuracy score from gate results and verified facts.
 * accuracy = verified_facts / total_facts * 100
 */
function computeAccuracy(gates: GateResult[], verifiedFacts?: VerifiedFactSet): number {
  const hallucinationGate = gates.find(g => g.gate === 'hallucination');
  if (hallucinationGate) return hallucinationGate.score;

  if (verifiedFacts && verifiedFacts.facts.length > 0) {
    const verified = verifiedFacts.facts.filter(f => f.confidence !== 'unverified').length;
    return Math.round((verified / verifiedFacts.facts.length) * 100);
  }

  return 50; // default when no verification data
}

/**
 * Compute traceability score.
 * traceability = numbers_with_provenance / total_numbers * 100
 */
function computeTraceability(gates: GateResult[], verifiedFacts?: VerifiedFactSet): number {
  const traceabilityGate = gates.find(g => g.gate === 'traceability');
  if (traceabilityGate) return traceabilityGate.score;

  if (verifiedFacts && verifiedFacts.facts.length > 0) {
    const withSource = verifiedFacts.facts.filter(f => f.sourceUrl && f.sourceUrl.length > 0).length;
    return Math.round((withSource / verifiedFacts.facts.length) * 100);
  }

  return 50;
}

/**
 * Compute readability score from OCR gate results.
 */
function computeReadability(gates: GateResult[]): number {
  const readabilityGate = gates.find(g => g.gate === 'readability');
  if (readabilityGate) return readabilityGate.score;
  return 50;
}

/**
 * Compute visual quality score.
 * For now, derived from data integrity gate + base score.
 * Future: use Gemini Vision to score composition, illustration, color, balance.
 */
function computeVisualQuality(gates: GateResult[]): number {
  const integrityGate = gates.find(g => g.gate === 'data-integrity');
  if (integrityGate) {
    // Visual quality baseline + integrity bonus
    return Math.min(100, 60 + (integrityGate.score * 0.4));
  }
  return 60; // default baseline
}

// ── Main scoring function ────────────────────────────────────

export function computeQualityScore(
  gates: GateResult[],
  verifiedFacts?: VerifiedFactSet,
): QualityScore {
  const accuracy = computeAccuracy(gates, verifiedFacts);
  const traceability = computeTraceability(gates, verifiedFacts);
  const readability = computeReadability(gates);
  const visualQuality = computeVisualQuality(gates);

  const overall = Math.round(
    accuracy * WEIGHTS.accuracy +
    traceability * WEIGHTS.traceability +
    readability * WEIGHTS.readability +
    visualQuality * WEIGHTS.visualQuality
  );

  const allGatesPassed = gates.every(g => g.passed);
  const noHallucinations = gates
    .filter(g => g.gate === 'data-integrity')
    .every(g => g.passed);

  const clientReady = overall >= CLIENT_READY_THRESHOLD && noHallucinations;

  console.log(`[QualityScore] Overall: ${overall} | Accuracy: ${accuracy} | Traceability: ${traceability} | Readability: ${readability} | Visual: ${visualQuality} | Client-ready: ${clientReady}`);

  return {
    overall,
    accuracy,
    traceability,
    readability,
    visualQuality,
    clientReady,
    gates,
  };
}

/**
 * Format quality score for display in chat.
 */
export function formatQualityBadge(score: QualityScore): {
  level: 'green' | 'yellow' | 'red';
  label: string;
  description: string;
} {
  if (score.clientReady && score.overall >= 90) {
    return {
      level: 'green',
      label: 'Client-Ready',
      description: `All gates passed — quality score ${score.overall}/100`,
    };
  }

  if (score.overall >= CLIENT_READY_THRESHOLD) {
    return {
      level: 'yellow',
      label: 'Review Recommended',
      description: `Quality score ${score.overall}/100 — minor issues detected`,
    };
  }

  return {
    level: 'red',
    label: 'Quality Warning',
    description: `Quality score ${score.overall}/100 — review before sharing`,
  };
}
