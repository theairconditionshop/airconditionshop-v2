/**
 * ISR-safe fetcher for the /about page's CMS-managed section (`about_page`
 * row in `homepage_sections`). Mirrors the pattern in `homepage-cache.ts`.
 */
import { unstable_cache } from 'next/cache'
import { getPublicSupabase } from '@/lib/supabase/public'

async function fetchAboutPageData() {
  const db = getPublicSupabase()
  const { data } = await db
    .from('homepage_sections')
    .select('data')
    .eq('section_key', 'about_page')
    .maybeSingle() as { data: { data: Record<string, unknown> } | null }

  const sectionData = (data?.data ?? {}) as Record<string, unknown>
  const showroomPhotoUrl = typeof sectionData.showroom_photo_url === 'string' && sectionData.showroom_photo_url
    ? sectionData.showroom_photo_url
    : null

  return { showroomPhotoUrl }
}

export const getCachedAboutPageData = unstable_cache(
  fetchAboutPageData,
  ['about-page-data'],
  { revalidate: 60, tags: ['about_page'] }
)
