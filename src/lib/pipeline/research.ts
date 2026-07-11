/**
 * Research stage — Perplexity search, reference images, source tier classification.
 */
import type { ResearchResult, ReferenceImage } from './types';
import type { SourceCitation } from '../types';
import { searchPerplexity } from '../research/perplexity';
import { enrichCitations } from '../research/firecrawl';

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
  intent?: string,
  entities?: string[],
): Promise<ResearchResult> {
  const empty: ResearchResult = { findings: [], verifiedFacts: [], sourceUrls: [], searchQueries: [], citations: [] };
  if (topics.length === 0) return empty;

  // ── Perplexity search (intent-aware) + Firecrawl enrichment IN PARALLEL ──
  const perplexityPromise = searchPerplexity(topics, contentSnippet, intent, entities);

  // Start Perplexity first, then decide on Firecrawl based on results
  const perplexityResult = await perplexityPromise;
  console.log('[Research] Perplexity answer:', perplexityResult.answer.slice(0, 200));

  const citations: SourceCitation[] = perplexityResult.citations
    .map(c => ({ ...c, tier: classifySourceTier(c.url) }));

  const tier1Count = citations.filter(c => c.tier === 1).length;
  const tier2Count = citations.filter(c => c.tier === 2).length;
  console.log(`[Research] ${citations.length} citations | ${tier1Count} tier-1, ${tier2Count} tier-2, ${citations.length - tier1Count - tier2Count} tier-3`);

  const findings: string[] = [];
  if (perplexityResult.answer) {
    findings.push(perplexityResult.answer.replace(/\*\*/g, '').slice(0, 6000));
  }

  // ── Firecrawl enrichment: parallel, non-blocking, best-effort ──
  // Fire-and-forget: start enrichment but don't block the pipeline.
  // If it completes before structuring starts, great. If not, we proceed without it.
  const firecrawlPromise = enrichCitations(citations, 3).catch(err => {
    console.warn('[Research] Firecrawl enrichment failed (non-blocking):', err instanceof Error ? err.message : err);
    return { enriched: [] as any[], enhancedCitations: citations };
  });

  // Give Firecrawl 8s to complete — if it doesn't, proceed without it
  const firecrawlResult = await Promise.race([
    firecrawlPromise,
    new Promise<{ enriched: any[]; enhancedCitations: SourceCitation[] }>(resolve =>
      setTimeout(() => {
        console.log('[Research] Firecrawl timed out (8s) — proceeding without enrichment');
        resolve({ enriched: [], enhancedCitations: citations });
      }, 8000)
    ),
  ]);

  if (firecrawlResult.enriched.length > 0) {
    console.log(`[Research] Firecrawl enriched ${firecrawlResult.enriched.length} citations with deep content`);
    const firecrawlFacts = firecrawlResult.enriched.flatMap((r: any) => r.facts || []);
    if (firecrawlFacts.length > 0) {
      findings.push(`\n--- Deep-sourced facts (Firecrawl) ---\n${firecrawlFacts.join('\n')}`);
    }
  }

  return {
    findings,
    verifiedFacts: [],
    sourceUrls: firecrawlResult.enhancedCitations.map(c => c.url),
    searchQueries: topics,
    citations: firecrawlResult.enhancedCitations,
  };
}

// ── Reference images (Pexels) ─────────────────────────────────
// Replaces the previous Apify `hooli/google-images-scraper` call.
// Pexels free tier: 200 req/hr, 20,000 req/mo — more than enough.

export async function fetchReferenceImages(
  topics: string[],
): Promise<ReferenceImage[]> {
  const pexelsKey = process.env.PEXELS_API_KEY;
  if (!pexelsKey || topics.length === 0) return [];

  try {
    const query = topics.slice(0, 3).join(' ');
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`;

    const res = await fetch(url, {
      headers: { Authorization: pexelsKey },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error(`[RefImages] Pexels returned ${res.status}`);
      return [];
    }

    const data = await res.json() as { photos?: Array<{ src: { large: string; medium: string }; alt?: string; url: string }> };
    const photos = (data.photos ?? []).slice(0, 3);
    if (photos.length === 0) return [];

    const images = await Promise.all(
      photos.map(async (p): Promise<ReferenceImage | null> => {
        try {
          const imgUrl = p.src.large || p.src.medium;
          const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(8000) });
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
            sourceUrl: p.url,
            description: p.alt ?? '',
          };
        } catch {
          return null;
        }
      })
    );

    return images.filter((img): img is ReferenceImage => img !== null);
  } catch (err) {
    console.error('[RefImages] Pexels fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}
