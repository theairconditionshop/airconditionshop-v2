import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * BTU-calculator recommendations. Air conditioners now live in the series
 * model, so we match VARIANTS within the requested cooling range and return
 * one card per SERIES (deduped), shaped like the old product payload the
 * calculator UI expects. `slug` is `brand/series` so /products/{slug} routes
 * to the canonical series page.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const min = parseInt(searchParams.get('min') || '0')
  const max = parseInt(searchParams.get('max') || '999999')
  const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 8)

  const supabase = await createClient()
  const { data } = await supabase
    .from('product_variants')
    .select('cooling_btu, retail_price, original_price, currency, series:product_series!inner(id, name, slug, is_active, brand:brands(name, slug), images:series_images(url, thumbnail_url, colour_id, is_primary))')
    .eq('is_active', true)
    .not('cooling_btu', 'is', null)
    .gte('cooling_btu', min)
    .lte('cooling_btu', max)
    .order('cooling_btu')

  type Row = {
    cooling_btu: number | null
    retail_price: number | null
    original_price: number | null
    currency: string | null
    series: {
      id: string; name: string; slug: string; is_active: boolean
      brand: { name: string; slug: string } | { name: string; slug: string }[] | null
      images: { url: string; thumbnail_url: string | null; colour_id: string | null; is_primary: boolean }[]
    } | null
  }

  const seen = new Set<string>()
  const results: unknown[] = []
  for (const row of (data ?? []) as unknown as Row[]) {
    const s = row.series
    if (!s || !s.is_active || seen.has(s.id)) continue
    seen.add(s.id)
    const brand = Array.isArray(s.brand) ? s.brand[0] : s.brand
    const heroes = (s.images ?? []).filter(i => i.colour_id == null)
    results.push({
      id: s.id,
      name: brand ? `${brand.name} ${s.name}` : s.name,
      slug: brand?.slug ? `${brand.slug}/${s.slug}` : s.slug,
      cooling_btu: row.cooling_btu,
      retail_price: row.retail_price ?? row.original_price,
      currency: row.currency ?? 'EUR',
      brand: brand ?? undefined,
      images: heroes.map(i => ({ url: i.url, thumbnail_url: i.thumbnail_url, is_primary: i.is_primary })),
    })
    if (results.length >= limit) break
  }

  return NextResponse.json(results)
}
