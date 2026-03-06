/**
 * Perplexity Sonar Pro API client for citation-backed research.
 * Returns synthesized answers with inline source citations.
 */
import type { SourceCitation } from '../types';

const PERPLEXITY_API = 'https://api.perplexity.ai/chat/completions';

type PerplexityResult = {
  answer: string;
  citations: SourceCitation[];
};

// Circuit breaker state
let failureCount = 0;
let lastFailureTime = 0;
const CIRCUIT_BREAKER_THRESHOLD = 3;
const CIRCUIT_BREAKER_RESET_MS = 15 * 60 * 1000; // 15 minutes

function isCircuitOpen(): boolean {
  if (failureCount < CIRCUIT_BREAKER_THRESHOLD) return false;
  if (Date.now() - lastFailureTime > CIRCUIT_BREAKER_RESET_MS) {
    failureCount = 0;
    return false;
  }
  return true;
}

function recordFailure(): void {
  failureCount++;
  lastFailureTime = Date.now();
}

function recordSuccess(): void {
  failureCount = 0;
}

export async function searchPerplexity(
  topics: string[],
  contentSnippet: string,
): Promise<PerplexityResult> {
  const empty: PerplexityResult = { answer: '', citations: [] };

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey || topics.length === 0) return empty;
  if (isCircuitOpen()) {
    console.log('[Perplexity] Circuit breaker open — skipping');
    return empty;
  }

  try {
    const query = `Verify and provide accurate data about: ${topics.slice(0, 4).join(', ')}.
Context: ${contentSnippet.slice(0, 300)}
Provide specific statistics, dates, and facts with their sources. Focus on verifiable claims.`;

    const res = await fetch(PERPLEXITY_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant. Provide factual, well-sourced answers. Include specific statistics, dates, and verifiable claims. Be concise.',
          },
          { role: 'user', content: query },
        ],
        max_tokens: 1024,
        return_citations: true,
        return_related_questions: false,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[Perplexity] API error (${res.status}): ${errText.slice(0, 200)}`);
      recordFailure();
      return empty;
    }

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content || '';
    const rawCitations: string[] = data.citations || [];

    // Convert Perplexity citations to our SourceCitation format
    // Use the answer as snippet context — Perplexity's answer synthesizes all cited sources
    const answerSnippet = answer.replace(/\*\*/g, '').slice(0, 300);
    const citations: SourceCitation[] = rawCitations
      .filter((url: string) => url && url.startsWith('http'))
      .slice(0, 8)
      .map((url: string) => ({
        url,
        title: extractDomain(url),
        snippet: answerSnippet,
        provider: 'perplexity' as const,
      }));

    recordSuccess();

    return { answer, citations };
  } catch (err) {
    console.error('[Perplexity] Search failed:', err instanceof Error ? err.message : err);
    recordFailure();
    return empty;
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}
