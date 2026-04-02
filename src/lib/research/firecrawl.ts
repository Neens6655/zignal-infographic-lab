/**
 * Firecrawl integration — deep content extraction from URLs.
 * Used after Perplexity returns citations: scrapes the cited URLs to get
 * full article content with exact numbers, quotes, and context.
 * Replaces Exa as the secondary research source (Exa is known to not work).
 */
import type { SourceCitation } from '../types';

// ── Types ────────────────────────────────────────────────────

interface FirecrawlScrapeResult {
  success: boolean;
  data?: {
    markdown?: string;
    metadata?: {
      title?: string;
      description?: string;
      sourceURL?: string;
    };
  };
  error?: string;
}

export interface FirecrawlResult {
  url: string;
  title: string;
  content: string;          // Clean markdown content (truncated to 3000 chars)
  facts: string[];          // Sentences containing numbers/stats extracted from content
  provider: 'firecrawl';
}

// ── Constants ────────────────────────────────────────────────

const API_URL = 'https://api.firecrawl.dev/v1';
const MAX_CONTENT_LENGTH = 3000;
const SCRAPE_TIMEOUT = 15000;

// ── Main functions ───────────────────────────────────────────

/**
 * Scrape a single URL and extract clean markdown content.
 */
export async function scrapeUrl(url: string): Promise<FirecrawlResult | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    console.warn('[firecrawl] FIRECRAWL_API_KEY not set — skipping scrape');
    return null;
  }

  try {
    console.log(`[firecrawl] scraping: ${url}`);

    const response = await fetch(`${API_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: SCRAPE_TIMEOUT,
      }),
      signal: AbortSignal.timeout(SCRAPE_TIMEOUT + 5000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[firecrawl] API error ${response.status}: ${errorText.slice(0, 200)}`);
      return null;
    }

    const data = (await response.json()) as FirecrawlScrapeResult;

    if (!data.success || !data.data?.markdown) {
      console.warn(`[firecrawl] scrape failed for ${url}: ${data.error || 'no content'}`);
      return null;
    }

    const markdown = data.data.markdown;
    const title = data.data.metadata?.title || extractTitleFromMarkdown(markdown) || url;
    const content = markdown.slice(0, MAX_CONTENT_LENGTH);
    const facts = extractFactSentences(markdown);

    console.log(`[firecrawl] success: "${title.slice(0, 60)}" — ${facts.length} facts, ${content.length} chars`);

    return {
      url,
      title,
      content,
      facts,
      provider: 'firecrawl',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[firecrawl] scrape failed for ${url}: ${message}`);
    return null;
  }
}

/**
 * Deep-scrape citation URLs from Perplexity results to extract exact data.
 * Scrapes up to `maxUrls` citations in parallel with a concurrency limit.
 * Returns enriched citations with full content and extracted facts.
 */
export async function enrichCitations(
  citations: SourceCitation[],
  maxUrls = 3,
): Promise<{ enriched: FirecrawlResult[]; enhancedCitations: SourceCitation[] }> {
  const apiKey = process.env.FIRECRAWL_API_KEY;

  if (!apiKey || citations.length === 0) {
    return { enriched: [], enhancedCitations: citations };
  }

  // Prioritize tier 1-2 sources, take up to maxUrls
  const urlsToScrape = citations
    .filter(c => c.url && c.url.startsWith('http'))
    .sort((a, b) => (a.tier || 3) - (b.tier || 3))
    .slice(0, maxUrls);

  console.log(`[firecrawl] enriching ${urlsToScrape.length}/${citations.length} citations`);

  const results = await Promise.allSettled(
    urlsToScrape.map(c => scrapeUrl(c.url))
  );

  const enriched: FirecrawlResult[] = [];
  const enrichedUrlMap = new Map<string, FirecrawlResult>();

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      enriched.push(result.value);
      enrichedUrlMap.set(result.value.url, result.value);
    }
  }

  // Enhance original citations with scraped snippets
  const enhancedCitations = citations.map(c => {
    const scraped = enrichedUrlMap.get(c.url);
    if (scraped) {
      return {
        ...c,
        snippet: scraped.facts.slice(0, 3).join(' ') || scraped.content.slice(0, 300),
        title: scraped.title || c.title,
      };
    }
    return c;
  });

  console.log(`[firecrawl] enriched ${enriched.length} citations with full content`);

  return { enriched, enhancedCitations };
}

// ── Helpers ──────────────────────────────────────────────────

/** Extract sentences containing numbers, percentages, or monetary values. */
function extractFactSentences(text: string): string[] {
  const NUMBER_RE = /(?:\$|€|£|¥)?\d[\d,.]*\s*(?:trillion|billion|million|thousand|[TBMK%])\b|\d[\d,.]*\s*%|\$[\d,.]+/i;

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 500);

  return sentences
    .filter(s => NUMBER_RE.test(s))
    .slice(0, 15);
}

/** Extract first heading from markdown as title fallback. */
function extractTitleFromMarkdown(md: string): string {
  const match = md.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}
