// In-memory rate limiter for Vercel serverless functions.
// Provides protection against bot abuse on warm function instances.
// For cross-instance limiting at scale, replace with Upstash Redis.

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

function prune() {
  const now = Date.now()
  for (const [key, e] of store) {
    if (e.resetAt <= now) store.delete(key)
  }
}

export interface RateLimitResult {
  limited: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  prune()
  const now = Date.now()
  const e = store.get(key)

  if (!e || e.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { limited: false, remaining: limit - 1, resetAt: now + windowMs }
  }

  e.count++
  return { limited: e.count > limit, remaining: Math.max(0, limit - e.count), resetAt: e.resetAt }
}

export function rateLimitResponse(resetAt: number): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) },
    }
  )
}
