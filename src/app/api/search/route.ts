import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json([])

  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('id, name, slug, sku, retail_price, currency, cooling_btu, energy_rating, brand:brands(name, slug), images:product_images(url, is_primary)')
    .eq('is_active', true)
    .or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
    .order('display_order')
    .limit(8)

  // Also search by brand name
  const { data: byBrand } = await supabase
    .from('products')
    .select('id, name, slug, sku, retail_price, currency, cooling_btu, energy_rating, brand:brands(name, slug), images:product_images(url, is_primary)')
    .eq('is_active', true)
    .not('brand_id', 'is', null)
    .limit(4)

  const results = data || []
  const ids = new Set(results.map((p) => p.id))

  // Merge unique brand results
  for (const p of (byBrand || [])) {
    const brand = p.brand as { name: string; slug: string }[] | { name: string; slug: string } | null
    const brandObj = Array.isArray(brand) ? brand[0] : brand
    if (!ids.has(p.id) && brandObj?.name?.toLowerCase().includes(q.toLowerCase())) {
      results.push(p)
      ids.add(p.id)
    }
  }

  return NextResponse.json(results.slice(0, 8))
}
