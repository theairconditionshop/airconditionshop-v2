/**
 * ISR-safe fetcher for the /services page's CMS-managed section (`services_page`
 * row in `homepage_sections`). Mirrors the pattern in `homepage-cache.ts`.
 */
import { unstable_cache } from 'next/cache'
import { getPublicSupabase } from '@/lib/supabase/public'

async function fetchServicesPageData() {
  const db = getPublicSupabase()
  const { data } = await db
    .from('homepage_sections')
    .select('data')
    .eq('section_key', 'services_page')
    .maybeSingle() as { data: { data: Record<string, unknown> } | null }

  const sectionData = (data?.data ?? {}) as Record<string, unknown>
  const engineerPhotoUrl = typeof sectionData.engineer_photo_url === 'string' && sectionData.engineer_photo_url
    ? sectionData.engineer_photo_url
    : null

  return { engineerPhotoUrl }
}

export const getCachedServicesPageData = unstable_cache(
  fetchServicesPageData,
  ['services-page-data'],
  { revalidate: 60, tags: ['services_page'] }
)
