export type JobStatus =
  | "queued"
  | "processing"
  | "researching"
  | "analyzing"
  | "generating"
  | "complete"
  | "failed";

export type Job = {
  job_id: string;
  status: JobStatus;
  progress: number;
  result: {
    image_url: string;
    download_url: string;
    metadata: {
      layout: string;
      style: string;
      preset: string;
      aspect_ratio: string;
      simplified: boolean;
      generated_at: string;
    };
  } | null;
  error: string | null;
  created_at: string;
};

export type GenerateInput = {
  content?: string;
  content_url?: string;
  preset?: string;
  layout?: string;
  style?: string;
  aspect_ratio?: string;
  quality?: string;
  language?: string;
  simplify?: boolean;
  reference_query?: string;
};

export type GenerateResponse = {
  job_id: string;
  status: string;
  estimated_seconds: number;
  status_url: string;
  mode: "async" | "sync";
};

export type Preset = {
  id: string;
  name: string;
  description: string;
  layout: string;
  style: string;
  tone: string;
  bestFor: string;
};

export type SSEEvent = {
  type: "progress" | "complete" | "error";
  data: {
    status?: string;
    progress?: number;
    message?: string;
    image_url?: string;
    download_url?: string;
    error?: string;
    metadata?: Record<string, any>;
  };
};

// ── Research & Verification Types ──────────────────────────────

export type SourceCitation = {
  url: string;
  title: string;
  snippet: string;
  provider: string;
  tier?: 1 | 2 | 3;
};

export type VerifiedClaim = {
  text: string;
  entity: string;
  metric: string;
  verified: boolean;
  sources: SourceCitation[];
};

export type CredibilityScore = {
  overall: number;
  claimsTotal: number;
  claimsCrossVerified: number;
  confidence: "high" | "medium" | "low";
};

export type NumericalClaim = {
  value: string;
  entity: string;
  metric: string;
  unit: string;
  raw: string;
};

export type NumberClassification =
  "exact" | "close" | "conflicting" | "unverified";

export type NumberVerification = {
  contentClaim: NumericalClaim;
  researchClaim: NumericalClaim | null;
  classification: NumberClassification;
  divergencePct: number;
};

export type NumberAudit = {
  totalClaims: number;
  exact: NumberVerification[];
  close: NumberVerification[];
  conflicting: NumberVerification[];
  unverified: NumberVerification[];
  confidenceLevel: "verified" | "partially_verified" | "estimates";
};

// ── Provenance Types ───────────────────────────────────────────

export type ProvenanceData = {
  seed: string;
  generatedAt: string;
  contentHash: string;
  models: {
    analysis: string;
    structure?: string;
    image: string;
  };
  pipeline: { stage: string; agent: string; result: string }[];
  references: string[];
  topics: string[];
  displayTags: string[];
  contentSources: string[];
  compliance: {
    score: number;
    corrections: number;
    riskWords: string[];
    factFlags: string[];
  };
  research: {
    queriesRun: number;
    findingsCount: number;
    sourcedClaims: VerifiedClaim[];
    sourceUrls: string[];
    citations: SourceCitation[];
    referenceImages: number;
  };
  credibility: CredibilityScore;
  /** Claim-ledger summary: the evidence behind the figures in THIS image. */
  claimLedger?: {
    rows: number;
    userSupplied: number;
    researched: number;
    sources: { url: string; title: string; tier?: 1 | 2 | 3 }[];
  };
  /** Deterministic pre-render layout gate: legibility, backing, overlap, contrast. */
  visualCompliance?: {
    passed: boolean;
    elements: number;
    panels: number;
    smallestFont: number;
    ellipsisRatio: number;
    minContrast: number;
    unbackedText: number;
    overlaps: number;
    blockers: number;
  };
  /** Pre-render mandatory checks: claim grounding and input fidelity. */
  truthGates?: {
    gate: string;
    passed: boolean;
    score: number;
    details: string;
  }[];
  postGenFlags?: string[];
  numberAudit?: {
    totalClaims: number;
    exact: number;
    close: number;
    conflicting: number;
    unverified: number;
    confidenceLevel: string;
    /** Corrections that actually changed the rendered text — not merely detected. */
    corrections: string[];
    correctionsApplied?: number;
    /** Conflicts whose value could not be located in the rendered text. */
    correctionsUnmatched?: number;
  };
  qualityScore?: {
    overall: number;
    accuracy: number;
    traceability: number;
    readability: number;
    visualQuality: number;
    clientReady: boolean;
    badge: {
      level: "green" | "yellow" | "red";
      label: string;
      description: string;
    };
  };
  densityReport?: {
    originalSections: number;
    finalSections: number;
    removedParagraphs: number;
    truncatedLabels: number;
    violations: number;
  };
};

// ── Quality Gate Types ─────────────────────────────────────────

export type VerifiedFact = {
  text: string;
  value: string;
  unit: string;
  sourceId: string;
  dataYear: string;
  sourceUrl: string;
  sourceSnippet: string;
  confidence: "verified" | "corroborated" | "single-source" | "unverified";
  confidenceScore: number;
};

export type VerifiedFactSet = {
  facts: VerifiedFact[];
  excludedFacts: { text: string; reason: string }[];
  overallConfidence: number;
  sourceCount: number;
  dataFreshness: string;
};

/**
 * Gate names. Keep this union closed — an open `string` is how a renamed check
 * silently stops being mandatory, which has happened in this estate before.
 */
export type GateName =
  // post-render, OCR-based
  | "hallucination"
  | "traceability"
  | "readability"
  | "data-integrity"
  // pre-render, ledger-based (mandatory — see pipeline/truth-gate.ts)
  | "claim-grounding"
  | "input-fidelity";

export type GateResult = {
  gate: GateName;
  passed: boolean;
  score: number;
  details: string;
  failures: string[];
};

export type QualityScore = {
  overall: number;
  accuracy: number;
  traceability: number;
  readability: number;
  visualQuality: number;
  clientReady: boolean;
  gates: GateResult[];
};
