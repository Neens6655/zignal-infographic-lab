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
const MAX_TOKENS = 4096;

// ── Main search function ─────────────────────────────────────

export async function searchPerplexity(
  topics: string[],
  contentSnippet: string,
): Promise<PerplexityResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    console.warn('[perplexity] PERPLEXITY_API_KEY not set — skipping search');
    return { answer: '', citations: [] };
  }

  const topicList = topics.join(', ');
  const userQuery = `Provide verified statistics, data, and facts about ${topicList}. Include specific numbers, percentages, and recent data with years. Focus on the most authoritative sources.`;

  const messages: PerplexityMessage[] = [
    {
      role: 'system',
      content: `You are a research assistant providing verified facts with citations. The user is creating an infographic about the following content:\n\n${contentSnippet}\n\nProvide only factual, verifiable information. Include specific numbers, dates, and source context.`,
    },
    {
      role: 'user',
      content: userQuery,
    },
  ];

  console.log(`[perplexity] query: "${topicList}" (${contentSnippet.length} chars context)`);

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
      signal: AbortSignal.timeout(20_000), // 20s timeout — prevent Perplexity from eating the time budget
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

    console.log(
      `[perplexity] ${citations.length} citations, ${answer.length} chars answer`,
    );

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
