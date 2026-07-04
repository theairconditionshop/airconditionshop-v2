/**
 * ISR-safe fetcher for the /trade page's CMS-managed section (`trade_page`
 * row in `homepage_sections`). Mirrors the pattern in `homepage-cache.ts`.
 */
import { unstable_cache } from 'next/cache'
import { getPublicSupabase } from '@/lib/supabase/public'

function str(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null
}

async function fetchTradePageData() {
  const db = getPublicSupabase()
  const { data } = await db
    .from('homepage_sections')
    .select('data')
    .eq('section_key', 'trade_page')
    .maybeSingle() as { data: { data: Record<string, unknown> } | null }

  const sectionData = (data?.data ?? {}) as Record<string, unknown>

  return {
    warehousePhotoUrl: str(sectionData.warehouse_photo_url),
    installerPhotoUrl: str(sectionData.installer_photo_url),
    counterPhotoUrl:   str(sectionData.counter_photo_url),
  }
}

export const getCachedTradePageData = unstable_cache(
  fetchTradePageData,
  ['trade-page-data'],
  { revalidate: 60, tags: ['trade_page'] }
)
