const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const DEFAULT_LIMIT = 5;
const AUTH_LIMIT = 20;

type Entry = {
  count: number;
  windowStart: number;
};

const store = new Map<string, Entry>();
let cleanupInitialized = false;

function initCleanup() {
  if (cleanupInitialized) return;
  cleanupInitialized = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now - entry.windowStart > WINDOW_MS) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function checkRateLimit(
  ip: string,
  isAuthenticated = false,
  customLimit?: number,
): { allowed: boolean; remaining: number; limit: number } {
  initCleanup();
  const limit = customLimit ?? (isAuthenticated ? AUTH_LIMIT : DEFAULT_LIMIT);
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, limit };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, limit };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, limit };
}
