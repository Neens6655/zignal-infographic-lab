export type JobStatus = 'queued' | 'processing' | 'researching' | 'analyzing' | 'generating' | 'complete' | 'failed';

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
  mode: 'async' | 'sync';
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
  type: 'progress' | 'complete' | 'error';
  data: {
    status?: string;
    progress?: number;
    message?: string;
    image_url?: string;
    download_url?: string;
    error?: string;
    metadata?: Record<string, any>;
    provenance?: ProvenanceData;
  };
};

// ── Credibility Engine Types ────────────────────────────────

export type SourceCitation = {
  url: string;
  title: string;
  snippet: string;
  provider: 'exa' | 'perplexity' | 'user';
  publishedDate?: string;
};

export type VerifiedClaim = {
  claim: string;
  sources: SourceCitation[];
  agreement: number; // 0-1 scale
  confidence: 'high' | 'medium' | 'low';
};

export type CredibilityScore = {
  overall: number; // 0-100
  breakdown: {
    sourceCount: number;
    crossVerified: number;
    recency: number;
  };
  claimsTotal: number;
  claimsCrossVerified: number;
};

export type ProvenanceData = {
  seed: string;
  generatedAt: string;
  contentHash: string;
  models: {
    analysis: string;
    image: string;
  };
  pipeline: {
    stage: string;
    agent: string;
    result: string;
  }[];
  references: string[];
  topics: string[];
  contentSources: string[];
  compliance?: {
    score: number;
    corrections: number;
    riskWords: string[];
    factFlags: string[];
  };
  research?: {
    queriesRun: number;
    findingsCount: number;
    sourcedClaims: VerifiedClaim[];
    sourceUrls: string[];
    citations: SourceCitation[];
    referenceImages: number;
  };
  credibility?: CredibilityScore;
};
