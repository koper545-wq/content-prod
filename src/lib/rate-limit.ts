/**
 * Simple in-memory rate limiter for serverless environments.
 * Note: Each serverless instance has its own Map, so this provides
 * per-instance rate limiting. For distributed rate limiting, use
 * Upstash Redis or similar.
 */
const rateMap = new Map<string, { count: number; resetAt: number }>();

// Clean up stale entries periodically to prevent memory leaks
const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) {
      rateMap.delete(key);
    }
  }
}

/**
 * Check if a request is within rate limits.
 * @param key - Unique identifier (e.g., "login:192.168.1.1")
 * @param limit - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  cleanup();
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}
