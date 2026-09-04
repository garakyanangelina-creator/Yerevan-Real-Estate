/**
 * Rate limiting using Upstash Redis when configured, falling back to in-process map.
 * Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel env vars to enable
 * distributed rate limiting across all serverless instances.
 */

// In-process fallback (per-instance, best-effort on serverless)
interface Record { count: number; windowStart: number }
const store = new Map<string, Record>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function inProcessCheck(key: string): boolean {
  const now = Date.now();
  const rec = store.get(key);
  if (!rec || now - rec.windowStart > WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now });
    // Prune old entries periodically
    if (store.size > 10000) {
      for (const [k, v] of store) {
        if (now - v.windowStart > WINDOW_MS) store.delete(k);
      }
    }
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

async function upstashCheck(key: string): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false; // not configured — signal to use fallback

  try {
    const windowSeconds = Math.floor(WINDOW_MS / 1000);
    const redisKey = `rl:login:${key}`;

    // INCR the key
    const incrRes = await fetch(`${url}/incr/${redisKey}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { result: count } = await incrRes.json() as { result: number };

    // Set expiry only on first increment (avoids resetting window)
    if (count === 1) {
      await fetch(`${url}/expire/${redisKey}/${windowSeconds}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    return count > MAX_ATTEMPTS;
  } catch {
    return false; // Redis error — fail open (don't block legitimate users)
  }
}

/** Returns true if this key has exceeded the login rate limit. */
export async function isLoginRateLimited(ip: string): Promise<boolean> {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    return upstashCheck(ip);
  }
  return inProcessCheck(ip);
}
