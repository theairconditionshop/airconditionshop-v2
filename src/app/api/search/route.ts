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
      retail_price:   showPrice ? p.retail_price   : null,
      original_price: showPrice ? p.original_price : null,
      price_hidden: !showPrice,
    }
  })

  return NextResponse.json(safeResults)
}
