/**
 * Shared types and constants for the infographic pipeline.
 */
import type { ProvenanceData, SourceCitation, VerifiedClaim, CredibilityScore } from '../types';

// ── Types ──────────────────────────────────────────────────────

export type ProgressCallback = (data: {
  status: string;
  progress: number;
  message: string;
}) => void;

export type PipelineInput = {
  content: string;
  preset?: string;
  style?: string;
  layout?: string;
  aspect_ratio?: string;
  quality?: string;
  language?: string;
  simplify?: boolean;
};

export type PipelineResult = {
  imageBase64: string;
  structuredContent: StructuredContent;
  renderContext: RenderContext;
  metadata: {
    layout: string;
    style: string;
    preset: string;
    aspect_ratio: string;
    intent: string;
  };
  provenance: ProvenanceData;
};

export type ContentAnalysis = {
  contentType: string;
  intent: string;
  layout: string;
  style: string;
  tone: string;
  sectionCount: number;
  topics: string[];
  entities: string[];
  metrics: string[];
  contentSources: string[];
};

export type StructuredContent = {
  title: string;
  subtitle: string;
  sections: {
    heading: string;
    keyConcept: string;
    content: string[];
    visualElement: string;
    labels: string[];
  }[];
  statsBar: { label: string; value: string }[];
  designNotes: string;
  sourceAttribution: string;
};

export type RenderContext = {
  layout: string;
  style: string;
  intent: string;
  tone: string;
  aspectRatio: string;
  language: string;
};

export type ComplianceReport = {
  corrections: {
    field: string;
    original: string;
    corrected: string;
    reason: 'spelling' | 'simplification' | 'fact_check' | 'length_risk';
  }[];
  riskWords: string[];
  factFlags: string[];
  score: number;
};

export type ResearchResult = {
  findings: string[];
  verifiedFacts: string[];
  sourceUrls: string[];
  searchQueries: string[];
  citations: SourceCitation[];
};

export type ReferenceImage = {
  base64: string;
  mimeType: string;
  sourceUrl: string;
  description: string;
};

// Re-export upstream types used by consumers
export type { ProvenanceData, SourceCitation, VerifiedClaim, CredibilityScore, NumericalClaim, NumberClassification, NumberVerification, NumberAudit, VerifiedFactSet, VerifiedFact, GateResult, QualityScore } from '../types';

// ── Presets ────────────────────────────────────────────────────

export const PRESETS: Record<string, { layout: string; style: string; tone: string }> = {
  'executive-summary': { layout: 'bento-grid', style: 'executive-institutional', tone: 'professional' },
  'strategy-framework': { layout: 'hub-spoke', style: 'executive-institutional', tone: 'analytical' },
  'market-analysis': { layout: 'comparison-matrix', style: 'executive-institutional', tone: 'data-rich' },
  'process-flow': { layout: 'linear-progression', style: 'ikea-manual', tone: 'clear' },
  'competitive-landscape': { layout: 'binary-comparison', style: 'executive-institutional', tone: 'bold' },
  'institutional-brief': { layout: 'dashboard', style: 'executive-institutional', tone: 'authoritative' },
  'deconstruct': { layout: 'structural-breakdown', style: 'deconstruct', tone: 'editorial' },
  'aerial-explainer': { layout: 'structural-breakdown', style: 'aerial-explainer', tone: 'architectural' },
};
