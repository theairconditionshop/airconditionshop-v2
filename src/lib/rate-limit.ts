// In-memory rate limiter for Vercel serverless functions.
// Provides protection against bot abuse on warm function instances.
// For cross-instance limiting at scale, replace with Upstash Redis.
//
// KNOWN LIMITATION: each serverless instance has its own in-memory store.
// Concurrent instances (under high load) each start with a fresh counter,
// meaning the effective per-IP limit may be multiplied by the number of
// warm instances Vercel keeps alive. This is acceptable for the current
// traffic volume. Migrate to Upstash Redis when you need hard global limits.

interface Entry {
  count:   number
  resetAt: number
  limit:   number
}

const store = new Map<string, Entry>()

function prune() {
  const now = Date.now()
  for (const [key, e] of store) {
    if (e.resetAt <= now) store.delete(key)
  }
}

export interface RateLimitResult {
  limited:   boolean
  remaining: number
  resetAt:   number
  limit:     number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  prune()
  const now = Date.now()
  const e = store.get(key)

  if (!e || e.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs, limit })
    return { limited: false, remaining: limit - 1, resetAt: now + windowMs, limit }
  }

  e.count++
  const remaining = Math.max(0, limit - e.count)
  return { limited: e.count > limit, remaining, resetAt: e.resetAt, limit }
}

export function rateLimitResponse(result: number | RateLimitResult): Response {
  // Accept either the legacy resetAt number or a full RateLimitResult
  const resetAt    = typeof result === 'number' ? result : result.resetAt
  const limit      = typeof result === 'number' ? 0      : result.limit
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
  const resetEpoch = Math.ceil(resetAt / 1000)

  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type':          'application/json',
        'Retry-After':           String(retryAfter),
        'X-RateLimit-Limit':     String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset':     String(resetEpoch),
      },
    }
  )
}
