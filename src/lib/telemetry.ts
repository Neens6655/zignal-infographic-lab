import { createClient } from '@/lib/supabase/server';

type TelemetryInput = {
  seed: string;
  contentHash: string;
  preset?: string;
  style?: string;
  layout?: string;
  aspectRatio?: string;
  complianceScore?: number;
  researchQueries?: number;
  researchFindings?: number;
  sourceUrls?: string[];
  topics?: string[];
  pipelineTrace?: unknown[];
  durationMs?: number;
  ipHash?: string;
  userId?: string;
};

export async function saveGeneration(input: TelemetryInput): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.from('generations').insert({
      user_id: input.userId || null,
      seed: input.seed,
      content_hash: input.contentHash,
      preset: input.preset || null,
      style: input.style || null,
      layout: input.layout || null,
      aspect_ratio: input.aspectRatio || '16:9',
      compliance_score: input.complianceScore ?? null,
      research_queries: input.researchQueries ?? 0,
      research_findings: input.researchFindings ?? 0,
      source_urls: input.sourceUrls || [],
      topics: input.topics || [],
      pipeline_trace: input.pipelineTrace || null,
      duration_ms: input.durationMs ?? null,
      ip_hash: input.ipHash || null,
    });
  } catch (err) {
    console.error('[telemetry] Failed to save generation:', err);
  }
}
