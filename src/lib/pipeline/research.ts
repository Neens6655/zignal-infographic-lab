/**
 * Research stage — Perplexity search, reference images, source tier classification.
 */
import type { ResearchResult, ReferenceImage } from './types';
import type { SourceCitation } from '../types';
import { searchPerplexity } from '../research/perplexity';

// ── Source authority classification ───────────────────────────

const TIER_1_DOMAINS = new Set([
  // Government agencies
  'eia.gov', 'bls.gov', 'census.gov', 'fed.gov', 'sec.gov', 'who.int',
  'europa.eu', 'gov.uk', 'statcan.gc.ca', 'abs.gov.au', 'data.gov',
  'cdc.gov', 'nih.gov', 'epa.gov', 'treasury.gov', 'usda.gov',
  // International organizations
  'worldbank.org', 'imf.org', 'un.org', 'oecd.org', 'opec.org', 'iea.org',
  'wto.org', 'bis.org', 'fao.org', 'ilo.org', 'weforum.org', 'wri.org',
  'irena.org', 'ioc.int',
  // Major wire services & financial data
  'reuters.com', 'apnews.com', 'bloomberg.com', 'ft.com',
  'wsj.com', 'economist.com',
  // Academic & research
  'nature.com', 'science.org', 'sciencedirect.com', 'ncbi.nlm.nih.gov',
]);

const TIER_2_DOMAINS = new Set([
  // Quality news
  'bbc.com', 'bbc.co.uk', 'nytimes.com', 'washingtonpost.com',
  'theguardian.com', 'cnbc.com', 'forbes.com', 'aljazeera.com', 'cnn.com',
  // Research & consulting
  'statista.com', 'pewresearch.org', 'brookings.edu', 'mckinsey.com',
  'deloitte.com', 'pwc.com', 'bcg.com', 'bain.com', 'accenture.com',
  'goldmansachs.com', 'jpmorgan.com', 'spglobal.com', 'moodys.com',
  // Energy & climate research
  'ember-energy.org', 'rff.org', 'bnef.com',
  // Data platforms
  'worldpopulationreview.com', 'tradingeconomics.com',
  // Tech news (for comparison queries)
  'electrek.co', 'techcrunch.com', 'arstechnica.com', 'theverge.com',
]);

export function classifySourceTier(url: string): 1 | 2 | 3 {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    if (TIER_1_DOMAINS.has(hostname)) return 1;
    if (TIER_2_DOMAINS.has(hostname)) return 2;
    // Subdomain match
    const parts = hostname.split('.');
    for (let i = 1; i < parts.length - 1; i++) {
      const parent = parts.slice(i).join('.');
      if (TIER_1_DOMAINS.has(parent)) return 1;
      if (TIER_2_DOMAINS.has(parent)) return 2;
    }
    // TLD-based classification
    if (hostname.endsWith('.gov') || hostname.endsWith('.edu') || hostname.endsWith('.int')) return 1;
    // Company IR pages are tier 2
    if (parts[0] === 'ir' || parts[0] === 'investor' || parts[0] === 'investors') return 2;
    return 3;
  } catch {
    return 3;
  }
}

// ── Research (Perplexity) ────────────────────────────────────

export async function researchContent(
  topics: string[],
  contentSnippet: string,
): Promise<ResearchResult> {
  const empty: ResearchResult = { findings: [], verifiedFacts: [], sourceUrls: [], searchQueries: [], citations: [] };
  if (topics.length === 0) return empty;

  const perplexityResult = await searchPerplexity(topics, contentSnippet);
  console.log('[Research] Perplexity answer:', perplexityResult.answer.slice(0, 200));

  const citations: SourceCitation[] = perplexityResult.citations
    .map(c => ({ ...c, tier: classifySourceTier(c.url) }));

  const tier1Count = citations.filter(c => c.tier === 1).length;
  const tier2Count = citations.filter(c => c.tier === 2).length;
  console.log(`[Research] ${citations.length} citations | ${tier1Count} tier-1 (institutional), ${tier2Count} tier-2 (quality news), ${citations.length - tier1Count - tier2Count} tier-3`);

  const findings: string[] = [];
  if (perplexityResult.answer) {
    findings.push(perplexityResult.answer.replace(/\*\*/g, '').slice(0, 6000));
  }

  return {
    findings,
    verifiedFacts: [],
    sourceUrls: citations.map(c => c.url),
    searchQueries: topics,
    citations,
  };
}

// ── Reference images (Apify Google Images) ────────────────────

export async function fetchReferenceImages(
  topics: string[],
): Promise<ReferenceImage[]> {
  const apifyToken = process.env.APIFY_TOKEN;
  if (!apifyToken || topics.length === 0) return [];

  try {
    const primaryQuery = topics.slice(0, 3).join(' ');
    const queries = [primaryQuery];
    if (topics.length > 2) {
      queries.push(`${topics[0]} ${topics[1]} photo`);
    }

    const actorUrl = 'https://api.apify.com/v2/acts/hooli~google-images-scraper/run-sync-get-dataset-items';

    const res = await fetch(`${actorUrl}?token=${apifyToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queries,
        maxItems: 5,
        countryCode: 'us',
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      console.error(`[RefImages] Apify returned ${res.status}`);
      return [];
    }

    const items: any[] = await res.json();
    if (!Array.isArray(items) || items.length === 0) return [];

    const imageItems = items
      .filter((item: any) => item.imageUrl && item.imageUrl.startsWith('http'))
      .slice(0, 3);

    const images = await Promise.all(
      imageItems.map(async (item: any): Promise<ReferenceImage | null> => {
        try {
          const imgRes = await fetch(item.imageUrl, {
            signal: AbortSignal.timeout(8000),
          });
          if (!imgRes.ok) return null;

          const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
          if (!contentType.includes('image/')) return null;

          const buffer = await imgRes.arrayBuffer();
          if (buffer.byteLength > 2 * 1024 * 1024) return null;

          const base64 = Buffer.from(buffer).toString('base64');
          const mimeType = contentType.includes('png') ? 'image/png'
            : contentType.includes('webp') ? 'image/webp'
            : 'image/jpeg';

          return {
            base64,
            mimeType,
            sourceUrl: item.imageUrl,
            description: item.title || item.description || '',
          };
        } catch {
          return null;
        }
      })
    );

    return images.filter((img): img is ReferenceImage => img !== null);
  } catch (err) {
    console.error('[RefImages] Apify fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}
