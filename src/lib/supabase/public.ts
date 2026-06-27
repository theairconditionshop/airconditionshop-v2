import { createClient } from '@supabase/supabase-js'

// Singleton anon client — does NOT read cookies, safe for ISR/static pages.
// Use for public data only. Never use for auth or user-specific data.
let _client: ReturnType<typeof createClient> | null = null

export function getPublicSupabase() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}
