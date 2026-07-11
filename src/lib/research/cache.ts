/**
 * Research cache — Upstash Redis with tiered TTL.
 * Gracefully degrades: if Redis not configured, all operations are no-ops.
 */

type CachedResearch = {
  findings: string[];
  citations: Array<{ url: string; title: string; snippet: string; provider: string; tier?: 1 | 2 | 3 }>;
  sourceUrls: string[];
  cachedAt: string;
};

// ── TTL tiers (seconds) ──────────────────────────────────────
const TTL_VOLATILE = 3600;       // 1h — "oil price today", "latest news"
const TTL_STABLE   = 86400;      // 24h — "top 10 GDP countries", "biggest companies"
const TTL_STATIC   = 604800;     // 7d — "history of Rome", "how photosynthesis works"

const VOLATILE_PATTERNS = /\b(today|tonight|this week|this month|latest|breaking|current|yesterday|right now|live|real.?time)\b/i;
const STATIC_PATTERNS = /\b(history of|ancient|how does .+ work|what is|definition of|explain|origins of|invented|discovered)\b/i;

function getTTL(query: string): number {
  if (VOLATILE_PATTERNS.test(query)) return TTL_VOLATILE;
  if (STATIC_PATTERNS.test(query)) return TTL_STATIC;
  return TTL_STABLE;
}

// ── Redis client (lazy init, graceful if missing) ────────────

let redis: any = null;
let redisInitAttempted = false;

async function getRedis() {
  if (redisInitAttempted) return redis;
  redisInitAttempted = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.log('[cache] Upstash Redis not configured — caching disabled');
    return null;
  }

  try {
    const { Redis } = await import('@upstash/redis');
    redis = new Redis({ url, token });
    console.log('[cache] Upstash Redis connected');
    return redis;
  } catch (err) {
    console.warn('[cache] Failed to init Upstash Redis:', err instanceof Error ? err.message : err);
    return null;
  }
}

// ── Cache key generation ─────────────────────────────────────

async function cacheKey(query: string, intent: string): Promise<string> {
  const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
  const data = new TextEncoder().encode(`${normalized}|${intent}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `zpx:v1:${hash.slice(0, 16)}`;
}

// ── Public API ───────────────────────────────────────────────

export async function getCachedResearch(
  query: string,
  intent: string,
): Promise<CachedResearch | null> {
  const client = await getRedis();
  if (!client) return null;

  try {
    const key = await cacheKey(query, intent);
    const data = await client.get(key);
    if (data) {
      console.log(`[cache] HIT: ${key}`);
      return typeof data === 'string' ? JSON.parse(data) : data as CachedResearch;
    }
    console.log(`[cache] MISS: ${key}`);
    return null;
  } catch (err) {
    console.warn('[cache] Read error:', err instanceof Error ? err.message : err);
    return null;
  }
}

export async function setCachedResearch(
  query: string,
  intent: string,
  data: CachedResearch,
): Promise<void> {
  const client = await getRedis();
  if (!client) return;

  // Fire-and-forget — don't block the pipeline
  const key = await cacheKey(query, intent);
  const ttl = getTTL(query);

  client.set(key, JSON.stringify(data), { ex: ttl }).catch((err: any) => {
    console.warn('[cache] Write error:', err instanceof Error ? err.message : err);
  });

  console.log(`[cache] SET: ${key} (TTL: ${ttl}s)`);
}
