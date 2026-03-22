/**
 * Exa integration — company research + web search for verified data.
 * Used as secondary source alongside Perplexity for cross-verification.
 */

type ExaSearchResult = {
  title: string;
  url: string;
  text: string;
  publishedDate: string | null;
  author: string | null;
};

type ExaResponse = {
  results: ExaSearchResult[];
  answer: string;
};

const EXA_API_URL = 'https://api.exa.ai';

async function exaFetch(endpoint: string, body: Record<string, unknown>): Promise<Response> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) throw new Error('EXA_API_KEY not set');

  return fetch(`${EXA_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
}

/**
 * Search Exa for verified data on a topic.
 * Returns answer + results with text snippets.
 */
export async function searchExa(
  query: string,
  numResults = 5,
): Promise<{ answer: string; results: ExaSearchResult[] }> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    console.log('[Exa] Skipping — EXA_API_KEY not set');
    return { answer: '', results: [] };
  }

  try {
    const res = await exaFetch('/search', {
      query,
      numResults,
      useAutoprompt: true,
      type: 'auto',
      contents: {
        text: { maxCharacters: 1000 },
      },
    });

    if (!res.ok) {
      console.error(`[Exa] Search failed: ${res.status}`);
      return { answer: '', results: [] };
    }

    const data = (await res.json()) as ExaResponse;
    console.log(`[Exa] Found ${data.results?.length || 0} results for: "${query.slice(0, 60)}"`);

    return {
      answer: data.answer || '',
      results: (data.results || []).map(r => ({
        title: r.title || '',
        url: r.url || '',
        text: r.text || '',
        publishedDate: r.publishedDate || null,
        author: r.author || null,
      })),
    };
  } catch (err) {
    console.error('[Exa] Search error:', err instanceof Error ? err.message : err);
    return { answer: '', results: [] };
  }
}

/**
 * Research a specific company using Exa.
 * Searches for revenue, headcount, market cap, and key metrics.
 */
export async function researchCompany(
  companyName: string,
): Promise<{ facts: string[]; sources: { url: string; title: string; snippet: string }[] }> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    return { facts: [], sources: [] };
  }

  try {
    const query = `${companyName} revenue market cap headcount employees 2024 2025 financial data`;
    const result = await searchExa(query, 5);

    const facts: string[] = [];
    const sources: { url: string; title: string; snippet: string }[] = [];

    for (const r of result.results) {
      if (r.text) {
        // Extract sentences containing numbers
        const sentences = r.text.split(/[.!?]+/).filter(s =>
          /\d/.test(s) && s.length > 20 && s.length < 300
        );
        facts.push(...sentences.map(s => s.trim()));
        sources.push({
          url: r.url,
          title: r.title,
          snippet: r.text.slice(0, 200),
        });
      }
    }

    console.log(`[Exa] Company research for "${companyName}": ${facts.length} facts from ${sources.length} sources`);
    return { facts: facts.slice(0, 10), sources };
  } catch (err) {
    console.error(`[Exa] Company research error for "${companyName}":`, err instanceof Error ? err.message : err);
    return { facts: [], sources: [] };
  }
}
