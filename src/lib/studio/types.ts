/**
 * ZGNAL Studio v3 — engine types.
 * The studio always renders FOUR fixed styles per brief, each through a
 * self-correcting quality loop. Shared prep runs once; renders fan out ×4.
 */
import type {
  StructuredContent,
  ContentAnalysis,
  ResearchResult,
  NumberAudit,
} from "../pipeline/types";

export type StudioStyleId = "mckinsey" | "academic" | "deconstruct" | "museum";

export const STUDIO_STYLE_IDS: StudioStyleId[] = [
  "mckinsey",
  "academic",
  "deconstruct",
  "museum",
];

export interface StudioStyle {
  id: StudioStyleId;
  /** Product-facing name shown in the UI. */
  name: string;
  tagline: string;
  /** Canvas ground — drives the vision judge's background check. */
  background: "light" | "parchment" | "gallery";
  /** Full art-direction spec, INLINED (no runtime fs read — kills the bundle-trace bug). */
  guidelines: string;
  /** One-line enforcement appended near the prompt end (recency bias). */
  enforcement: string;
  /** Style-specific pass criteria handed to the vision judge. */
  judgeRubric: string;
}

/** Style-agnostic prep output — computed ONCE, reused by all four renders. */
export interface StructuredBrief {
  structured: StructuredContent;
  analysis: ContentAnalysis;
  research: ResearchResult;
  numberAudit?: NumberAudit;
  aspectRatio: string;
  language: string;
  contentHash: string;
}

/** Combined quality verdict for a single render attempt. */
export interface RenderScore {
  /** 0–100 blended score. */
  overall: number;
  /** Cleared the bar: all mandatory checks pass AND overall ≥ threshold. */
  pass: boolean;
  // ── mandatory, deterministic ──
  legible: boolean; // OCR found no garbled text
  numbersOk: boolean; // every brief number appears in the image
  // ── vision judge (0–100) ──
  styleConformance: number; // matches the style spec (mandatory ≥ 70)
  visualQuality: number; // composition, hierarchy, whitespace, client-ready
  textRender: number; // crispness + placement (vision cross-check of OCR)
  ocrConfidence: number;
  /** Concrete, imperative defects — fed back verbatim into the next attempt. */
  defects: string[];
}

export interface RenderAttempt {
  attempt: number;
  score: RenderScore;
}

/** Final result for one of the four style tiles. */
export interface VariantResult {
  style: StudioStyleId;
  imageBase64: string;
  score: RenderScore;
  attempts: number;
  /** Cleared the quality bar within the attempt cap. */
  passed: boolean;
  /** Did NOT pass — shipped with an honest flag rather than silently. */
  flagged: boolean;
  history: RenderAttempt[];
}

export type StudioProgressEvent =
  | { type: "prep"; progress: number; message: string }
  | {
      type: "variant_progress";
      style: StudioStyleId;
      progress: number;
      message: string;
    }
  | {
      type: "variant_attempt";
      style: StudioStyleId;
      attempt: number;
      score: RenderScore;
    }
  | { type: "variant_complete"; style: StudioStyleId; result: VariantResult };

export type StudioProgressCallback = (event: StudioProgressEvent) => void;

/** Quality-loop tuning. */
export const QUALITY = {
  /** Max render attempts per style before shipping flagged. */
  MAX_ATTEMPTS: 4,
  /** Overall score needed to pass. */
  THRESHOLD: 80,
  /** Minimum style-conformance (vision) needed to pass. */
  MIN_STYLE_CONFORMANCE: 70,
} as const;
