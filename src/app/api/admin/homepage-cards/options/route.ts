import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'

// Destination options for the homepage-card link picker.
// Products are intentionally not listed (500+ rows) — link a product by
// pasting its URL with the "Custom / external URL" destination type.
export async function GET() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = createAdminClient()
  const [categories, brands, series, campaigns] = await Promise.all([
    db.from('categories').select('name, slug').eq('is_active', true).order('name'),
    db.from('brands').select('name, slug').eq('is_active', true).order('name'),
    db.from('product_series').select('name, slug, brand:brands(name, slug)').eq('is_active', true).order('name'),
    db.from('campaigns').select('title, slug').in('status', ['active', 'scheduled']).order('title'),
  ])

  type SeriesRow = { name: string; slug: string; brand: { name: string; slug: string } | null }

  return NextResponse.json({
    categories: (categories.data ?? []).map(c => ({ label: c.name, href: `/products/category/${c.slug}` })),
    brands:     (brands.data ?? []).map(b => ({ label: b.name, href: `/brands/${b.slug}` })),
    series:     ((series.data ?? []) as unknown as SeriesRow[])
      .filter(s => s.brand?.slug)
      .map(s => ({ label: `${s.brand!.name} ${s.name}`, href: `/products/${s.brand!.slug}/${s.slug}` })),
    campaigns:  (campaigns.data ?? []).map(c => ({ label: c.title, href: `/campaigns/${c.slug}` })),
  })
}
