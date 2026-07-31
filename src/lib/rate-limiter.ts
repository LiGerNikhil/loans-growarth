interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}
