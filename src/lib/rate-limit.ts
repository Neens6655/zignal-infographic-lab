/**
 * Rate limiting — durable, Upstash-backed.
 *
 * WHY THIS WAS REWRITTEN
 * The previous implementation was an in-memory `Map` inside a Vercel serverless
 * function. Every cold start and every concurrent lambda instance got its own empty
 * map, so the limit was per-instance and effectively unenforced. It also ran a
 * `setInterval` cleanup that a serverless runtime will not reliably execute.
 *
 * Combined with guest credits living in `localStorage` (clearable by anyone), there
 * was no working spend control in front of an endpoint with `maxDuration = 300` that
 * calls a top-tier image model. Upstash was already a dependency, already configured
 * for the research cache, and already the right tool.
 *
 * FAIL-CLOSED vs FAIL-OPEN: if Redis is unreachable we fall back to the in-process
 * counter and SAY SO in the result. That degrades to the old (weak) behaviour rather
 * than either blocking every user or silently pretending the limit held.
 */

const WINDOW_SECONDS = 60 * 60; // 1 hour

/**
 * Anonymous is the TIGHTEST tier, not the loosest. Previously anonymous was 100/hr
 * while authenticated was 20/hr — backwards by 5x, with a `// Temp for testing`
 * comment on the 100.
 */
export const RATE_LIMIT_TIER = {
  anonymous: 5,
  authenticated: 50,
  edit: 40,
} as const;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  /** True when the durable store was unavailable and this fell back to memory. */
  degraded: boolean;
};

// ── Redis client (lazy, graceful) ─────────────────────────────────────

let redis: {
  eval?: unknown;
  incr: (k: string) => Promise<number>;
  expire: (k: string, s: number) => Promise<unknown>;
} | null = null;
let redisInitAttempted = false;

async function getRedis() {
  if (redisInitAttempted) return redis;
  redisInitAttempted = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.warn(
      "[rate-limit] Upstash not configured — falling back to per-instance memory. " +
        "This does NOT enforce a global limit. Set UPSTASH_REDIS_REST_URL/TOKEN.",
    );
    return null;
  }

  try {
    const { Redis } = await import("@upstash/redis");
    redis = new Redis({ url, token }) as unknown as typeof redis;
    return redis;
  } catch (err) {
    console.warn(
      "[rate-limit] Failed to init Upstash:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

// ── In-process fallback (degraded mode only) ──────────────────────────

const memStore = new Map<string, { count: number; windowStart: number }>();

function memoryCheck(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  const windowMs = WINDOW_SECONDS * 1000;
  const entry = memStore.get(key);

  // Opportunistic prune — no setInterval, which serverless will not run reliably.
  if (memStore.size > 10_000) {
    for (const [k, v] of memStore) {
      if (now - v.windowStart > windowMs) memStore.delete(k);
    }
  }

  if (!entry || now - entry.windowStart > windowMs) {
    memStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, limit, degraded: true };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, limit, degraded: true };
  }
  entry.count += 1;
  return {
    allowed: true,
    remaining: limit - entry.count,
    limit,
    degraded: true,
  };
}

// ── Public API ────────────────────────────────────────────────────────

/**
 * Consume one unit from `ip`'s hourly budget.
 *
 * NOTE: this is now ASYNC. Every call site must `await` it — a forgotten await
 * yields a Promise whose `.allowed` is `undefined`, which is falsy-checked as
 * "not blocked" and silently disables the limit.
 */
export async function checkRateLimit(
  ip: string,
  isAuthenticated = false,
  customLimit?: number,
): Promise<RateLimitResult> {
  const limit =
    customLimit ??
    (isAuthenticated
      ? RATE_LIMIT_TIER.authenticated
      : RATE_LIMIT_TIER.anonymous);

  const client = await getRedis();
  if (!client) return memoryCheck(ip, limit);

  // Fixed window keyed by the hour bucket — one INCR, one EXPIRE on first write.
  const bucket = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  const key = `zrl:v1:${bucket}:${ip}`;

  try {
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, WINDOW_SECONDS);
    }
    if (count > limit) {
      return { allowed: false, remaining: 0, limit, degraded: false };
    }
    return {
      allowed: true,
      remaining: Math.max(0, limit - count),
      limit,
      degraded: false,
    };
  } catch (err) {
    console.warn(
      "[rate-limit] Redis error, degrading to memory:",
      err instanceof Error ? err.message : err,
    );
    return memoryCheck(ip, limit);
  }
}
