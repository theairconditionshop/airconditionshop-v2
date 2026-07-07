import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/admin-guard'
import { slugify } from '@/lib/utils'

/**
 * Duplicates a series along with its colours and variants (specs, model
 * numbers, BTU sizes) — the tedious, repetitive part of entering a new but
 * similar series. Images are intentionally NOT copied, since a new series is
 * usually a different physical unit that needs its own photography. The
 * copy is created inactive so it never goes live before review.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const db = createAdminClient()

  const { data: original, error: fetchError } = await db.from('product_series').select('*').eq('id', id).single()
  if (fetchError || !original) return NextResponse.json({ error: 'Series not found' }, { status: 404 })

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, slug: _slug, ...rest } = original
  void _id; void _createdAt; void _updatedAt; void _slug

  const baseSlug = slugify(`${original.name}-copy`)
  let slug = baseSlug
  for (let i = 2; i <= 20; i++) {
    const { data: clash } = await db.from('product_series').select('id').eq('slug', slug).maybeSingle()
    if (!clash) break
    slug = `${baseSlug}-${i}`
  }

  const { data: copy, error: insertError } = await db
    .from('product_series')
    .insert({ ...rest, name: `${original.name} (Copy)`, slug, is_active: false, is_featured: false })
    .select('id')
    .single()
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })

  // Copy colours, keeping a map from old colour id -> new colour id so variants can be re-linked.
  const { data: colours } = await db.from('series_colours').select('*').eq('series_id', id)
  const colourIdMap = new Map<string, string>()
  if (colours && colours.length > 0) {
    for (const c of colours) {
      const { id: oldColourId, created_at: _cc, updated_at: _uc, series_id: _sid, ...colourRest } = c
      void _cc; void _uc; void _sid
      const { data: newColour } = await db
        .from('series_colours')
        .insert({ ...colourRest, series_id: copy.id })
        .select('id')
        .single()
      if (newColour) colourIdMap.set(oldColourId, newColour.id)
    }
  }

  // Copy variants, re-pointing colour_id through the map (null stays null).
  const { data: variants } = await db.from('product_variants').select('*').eq('series_id', id)
  if (variants && variants.length > 0) {
    const rows = variants.map(v => {
      const { id: _vid, created_at: _vc, updated_at: _uvc, series_id: _vsid, colour_id, ...variantRest } = v
      void _vid; void _vc; void _uvc; void _vsid
      return {
        ...variantRest,
        series_id: copy.id,
        colour_id: colour_id ? (colourIdMap.get(colour_id) ?? null) : null,
      }
    })
    await db.from('product_variants').insert(rows)
  }

  return NextResponse.json({ id: copy.id })
}
