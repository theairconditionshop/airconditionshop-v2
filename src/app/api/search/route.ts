import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRole } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json([])

  const [supabase, userRole] = await Promise.all([createClient(), getRole()])
  const isTradeUser = userRole === 'trade' || userRole === 'admin' || userRole === 'super_admin'

  const SELECT = 'id, name, slug, sku, retail_price, original_price, price_visibility, currency, cooling_btu, product_type, energy_rating, brand:brands(name, slug), category:categories(name, slug), images:product_images(url, is_primary)'

  // Primary search: name + SKU match
  const { data: byNameSku } = await supabase
    .from('products')
    .select(SELECT)
    .eq('is_active', true)
    .or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
    .order('display_order')
    .limit(8)

  const results: typeof byNameSku = [...(byNameSku ?? [])]
  const ids = new Set(results.map(p => p.id))

  // Brand name search — get all active products for brands matching the query
  const { data: byBrand } = await supabase
    .from('products')
    .select(SELECT)
    .eq('is_active', true)
    .not('brand_id', 'is', null)
    .limit(20)

  for (const p of (byBrand ?? [])) {
    if (ids.has(p.id)) continue
    const brand = p.brand as { name: string; slug: string }[] | { name: string; slug: string } | null
    const brandObj = Array.isArray(brand) ? brand[0] : brand
    if (brandObj?.name?.toLowerCase().includes(q.toLowerCase())) {
      results.push(p)
      ids.add(p.id)
    }
  }

  // Category name search
  const { data: byCat } = await supabase
    .from('products')
    .select(SELECT)
    .eq('is_active', true)
    .not('category_id', 'is', null)
    .limit(20)

  for (const p of (byCat ?? [])) {
    if (ids.has(p.id)) continue
    const cat = p.category as { name: string; slug: string }[] | { name: string; slug: string } | null
    const catObj = Array.isArray(cat) ? cat[0] : cat
    if (catObj?.name?.toLowerCase().includes(q.toLowerCase())) {
      results.push(p)
      ids.add(p.id)
    }
  }

  // Mask prices for non-trade users on trade-only products
  const safeResults = results.slice(0, 8).map(p => {
    const isTradeOnly = p.price_visibility === 'trade_only' ||
      (p.price_visibility == null && p.product_type === 'installation_material')
    const showPrice = isTradeUser || !isTradeOnly
    return {
      ...p,
      href: null as string | null,
      retail_price:   showPrice ? p.retail_price   : null,
      original_price: showPrice ? p.original_price : null,
      price_hidden: !showPrice,
    }
  })

  // ── AC series search (name or brand match) ──
  const { data: seriesRows } = await supabase
    .from('product_series')
    .select('id, name, slug, price_visibility, brand:brands(name, slug), variants:product_variants(retail_price, original_price, is_active), images:series_images(url, is_primary, colour_id)')
    .eq('is_active', true)
    .limit(20)

  const ql = q.toLowerCase()
  const seriesResults = (seriesRows ?? [])
    .filter(s => {
      const brand = (Array.isArray(s.brand) ? s.brand[0] : s.brand) as { name: string; slug: string } | null
      return s.name.toLowerCase().includes(ql) || (brand?.name?.toLowerCase().includes(ql) ?? false)
    })
    .slice(0, 5)
    .map(s => {
      const brand = (Array.isArray(s.brand) ? s.brand[0] : s.brand) as { name: string; slug: string } | null
      const hide = s.price_visibility === 'trade_only' && !isTradeUser
      const prices = (s.variants ?? []).filter(v => v.is_active).map(v => v.retail_price).filter((p): p is number => p != null)
      const from = prices.length ? Math.min(...prices) : null
      const heroImgs = (s.images ?? []).filter(i => i.colour_id == null)
      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        href: brand?.slug ? `/products/${brand.slug}/${s.slug}` : `/products`,
        sku: null,
        retail_price: hide ? null : from,
        original_price: null,
        price_visibility: s.price_visibility,
        currency: 'EUR',
        cooling_btu: null,
        product_type: null,
        energy_rating: null,
        brand,
        category: { name: 'Air Conditioner', slug: 'air-conditioners' },
        images: heroImgs.map(i => ({ url: i.url, is_primary: i.is_primary })),
        price_hidden: hide,
      }
    })

  // Series first (they are the flagship catalogue), then products; cap at 8
  return NextResponse.json([...seriesResults, ...safeResults].slice(0, 8))
}
