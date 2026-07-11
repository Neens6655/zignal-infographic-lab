/**
 * Perplexity Sonar Pro API integration for research pipeline.
 * Searches for verified statistics, data, and facts using Perplexity's
 * grounded search model. Returns structured citations with source metadata.
 */
import type { SourceCitation } from '../types';

// ── Types ────────────────────────────────────────────────────

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityChoice {
  message: {
    role: string;
    content: string;
  };
}

interface PerplexityResponse {
  choices: PerplexityChoice[];
  citations?: string[];
}

export interface PerplexityResult {
  answer: string;
  citations: SourceCitation[];
}

// ── Constants ────────────────────────────────────────────────

const API_URL = 'https://api.perplexity.ai/chat/completions';
const MODEL = 'sonar-pro';
const MAX_TOKENS = 6144; // Increased for structured research responses

// ── Intent-specific research prompts ─────────────────────────

const INTENT_SYSTEM_PROMPTS: Record<string, string> = {
  ranking: `You are an executive research analyst preparing data for an infographic.
Research and provide data from the BEST AVAILABLE sources. Prefer institutional sources (government, World Bank, Reuters) when available, but for lifestyle, culture, or subjective rankings, use quality data platforms (Numbeo, Mercer, EIU, Expatistan, Statista, Teleport) and reputable publications.
For each entity: include ALL requested metrics with figures where available.
ALWAYS provide a complete ranking — use the best data you can find. Partial data with context is better than no data.
Organize findings as a ranked list with the #1 entity first.`,

  comparison: `You are an executive research analyst preparing a side-by-side comparison for a boardroom presentation.
Research BOTH/ALL items being compared using AUTHORITATIVE sources only.
For each item: provide the same set of metrics so they are directly comparable.
Highlight key differentiators. Use exact figures, not ranges.
If data is unavailable for one item, note it explicitly.`,

  process: `You are an executive research analyst preparing a process/journey explainer for senior stakeholders.
Research each stage or step using AUTHORITATIVE sources.
For each stage: provide context, key metrics if applicable, and why this stage matters.
Present stages in chronological or logical order.
Use precise terminology from the domain.`,

  metrics: `You are an executive research analyst preparing a data dashboard.
Research ALL requested metrics from AUTHORITATIVE sources (financial filings, government data, industry reports).
Provide exact figures with units and time periods.
Distinguish between verified data and estimates.`,

  overview: `You are an executive research analyst preparing a comprehensive briefing.
Research the topic using AUTHORITATIVE sources only.
Cover the most important aspects with verified data points.
Provide context that would be valuable to a senior executive making decisions.`,
};

// ── Main search function (v4: intent-aware) ──────────────────

export async function searchPerplexity(
  topics: string[],
  contentSnippet: string,
  intent?: string,
  entities?: string[],
): Promise<PerplexityResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    console.warn('[perplexity] PERPLEXITY_API_KEY not set — skipping search');
    return { answer: '', citations: [] };
  }

  const topicList = topics.join(', ');
  const effectiveIntent = intent || 'overview';
  const systemPrompt = INTENT_SYSTEM_PROMPTS[effectiveIntent] || INTENT_SYSTEM_PROMPTS.overview;

  // Build intent-specific user query
  let userQuery: string;
  if (effectiveIntent === 'ranking' && entities && entities.length > 0) {
    userQuery = `Research the following ranked entities: ${entities.join(', ')}.
For EACH entity, provide: ${topicList}.
Include exact figures with units and source year. Use only Tier 1 sources (government, Reuters, World Bank, academic).
Present as a ranked list from #1 to #${entities.length}.`;
  } else if (effectiveIntent === 'comparison' && entities && entities.length > 0) {
    userQuery = `Compare these items: ${entities.join(' vs ')}.
Research the same metrics for each: ${topicList}.
Provide exact, comparable figures from authoritative sources.`;
  } else if (effectiveIntent === 'process') {
    userQuery = `Explain the process/journey: ${contentSnippet.slice(0, 500)}.
Break down into sequential stages. For each stage: what happens, key metrics, and why it matters.
Research topics: ${topicList}.`;
  } else {
    userQuery = `Provide verified statistics, data, and executive-level insights about ${topicList}.
Include specific numbers, percentages, and recent data with years.
Focus on the most authoritative sources. Organize for storytelling — each fact should build on the previous.`;
  }

  const messages: PerplexityMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userQuery },
  ];

  console.log(`[perplexity] intent=${effectiveIntent} | query: "${topicList}" (${entities?.length || 0} entities)`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: MAX_TOKENS,
      }),
      signal: AbortSignal.timeout(25_000), // 25s timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[perplexity] API error ${response.status}: ${errorText}`);
      return { answer: '', citations: [] };
    }

    const data = (await response.json()) as PerplexityResponse;

    const answer = data.choices?.[0]?.message?.content ?? '';
    const rawCitations = data.citations ?? [];

    const citations: SourceCitation[] = rawCitations.map((url) => ({
      url,
      title: extractDomain(url),
      snippet: '',
      provider: 'perplexity',
    }));

    console.log(`[perplexity] ${citations.length} citations, ${answer.length} chars answer`);

    return { answer, citations };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[perplexity] fetch failed: ${message}`);
    return { answer: '', citations: [] };
  }
}

// ── Helpers ──────────────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}
