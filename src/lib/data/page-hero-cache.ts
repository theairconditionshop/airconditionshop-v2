/**
 * ISR-safe fetcher for the generic `page_heroes` table — one reusable hero
 * CMS record per page, keyed by `page_key`. Mirrors the `homepage-cache.ts` pattern.
 */
import { unstable_cache } from 'next/cache'
import { getPublicSupabase } from '@/lib/supabase/public'

export interface PageHeroData {
  title: string | null
  subtitle: string | null
  desktopImageUrl: string | null
  tabletImageUrl: string | null
  mobileImageUrl: string | null
  overlayOpacity: number
  ctaLabel: string | null
  ctaHref: string | null
  showBreadcrumb: boolean
}

const EMPTY_HERO: PageHeroData = {
  title: null,
  subtitle: null,
  desktopImageUrl: null,
  tabletImageUrl: null,
  mobileImageUrl: null,
  overlayOpacity: 0.35,
  ctaLabel: null,
  ctaHref: null,
  showBreadcrumb: true,
}

async function fetchPageHero(pageKey: string): Promise<PageHeroData> {
  const db = getPublicSupabase()
  const { data } = await db
    .from('page_heroes')
    .select('title, subtitle, desktop_image_url, tablet_image_url, mobile_image_url, overlay_opacity, cta_label, cta_href, show_breadcrumb')
    .eq('page_key', pageKey)
    .maybeSingle()

  if (!data) return EMPTY_HERO

  const row = data as {
    title: string | null
    subtitle: string | null
    desktop_image_url: string | null
    tablet_image_url: string | null
    mobile_image_url: string | null
    overlay_opacity: number | null
    cta_label: string | null
    cta_href: string | null
    show_breadcrumb: boolean | null
  }

  return {
    title: row.title,
    subtitle: row.subtitle,
    desktopImageUrl: row.desktop_image_url || null,
    tabletImageUrl: row.tablet_image_url || null,
    mobileImageUrl: row.mobile_image_url || null,
    overlayOpacity: row.overlay_opacity ?? 0.35,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    showBreadcrumb: row.show_breadcrumb ?? true,
  }
}

/**
 * Cached per page_key. Next.js dedupes `unstable_cache` calls by their full
 * argument list, so this single export safely serves every page.
 */
export const getCachedPageHero = unstable_cache(
  fetchPageHero,
  ['page-hero-data'],
  { revalidate: 60, tags: ['page_heroes'] }
)
