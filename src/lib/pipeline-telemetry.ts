/**
 * Pipeline telemetry — per-step timing, token counting, cost tracking.
 * Every API call in the pipeline should be wrapped with trackStep().
 */

// ── Model pricing (USD per 1M tokens) ────────────────────────
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gemini-2.5-pro':                  { input: 1.25,  output: 10.0 },
  'gemini-2.5-flash':                { input: 0.15,  output: 0.60 },
  'gemini-3.1-flash-image-preview':  { input: 0.10,  output: 0.40 },
  'sonar-pro':                       { input: 3.0,   output: 15.0 },
};

// Fixed costs per API call (not token-based)
const FIXED_COSTS: Record<string, number> = {
  'perplexity-search': 0.005,  // ~$5/1K searches
  'firecrawl-scrape':  0.001,  // ~$1/1K scrapes
};

export type StepMetrics = {
  stage: string;
  agent: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  costUSD: number;
  latencyMs: number;
  result: string;
  error?: string;
};

/**
 * Track a pipeline step — wraps any async function with timing + cost logging.
 */
export async function trackStep<T>(
  stage: string,
  agent: string,
  model: string | undefined,
  fn: () => Promise<T>,
): Promise<{ result: T; metrics: StepMetrics }> {
  const start = Date.now();

  try {
    const result = await fn();
    const latencyMs = Date.now() - start;
    const costUSD = estimateFixedCost(model);

    const metrics: StepMetrics = {
      stage, agent, model, costUSD, latencyMs, result: 'OK',
    };

    console.log(
      `[telemetry] ${stage} (${agent}) — ${latencyMs}ms` +
      (model ? ` | ${model}` : '') +
      (costUSD > 0 ? ` | $${costUSD.toFixed(4)}` : ''),
    );

    return { result, metrics };
  } catch (err) {
    const latencyMs = Date.now() - start;
    const error = err instanceof Error ? err.message : String(err);

    console.error(`[telemetry] ${stage} (${agent}) — FAILED ${latencyMs}ms | ${error}`);

    throw err;
  }
}

function estimateFixedCost(model?: string): number {
  if (!model) return 0;
  return FIXED_COSTS[model] ?? 0;
}

/**
 * Estimate token cost for a text LLM call (approximate: 1 token ≈ 4 chars).
 */
export function estimateTokenCost(model: string, inputChars: number, outputChars: number): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;
  const inputTokens = Math.ceil(inputChars / 4);
  const outputTokens = Math.ceil(outputChars / 4);
  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000;
}

/**
 * Summarize step metrics into totals.
 */
export function summarizeMetrics(steps: StepMetrics[]): { totalCostUSD: number; totalLatencyMs: number } {
  return {
    totalCostUSD: steps.reduce((sum, s) => sum + s.costUSD, 0),
    totalLatencyMs: steps.reduce((sum, s) => sum + s.latencyMs, 0),
  };
}
