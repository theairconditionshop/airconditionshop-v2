import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/admin-guard'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

// GET /api/admin/series — list all series (admin)
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const db = createAdminClient()
  const { data, error } = await db
    .from('product_series')
    .select('*, brand:brands(id,name,slug), variants:product_variants(id), colours:series_colours(id)')
    .order('display_order')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

const createSchema = z.object({
  name:     z.string().min(2),
  slug:     z.string().optional(),
  brand_id: z.string().uuid().nullable().optional(),
})

// POST /api/admin/series — create a new series
export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })

  const db = createAdminClient()
  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name)
  const { data, error } = await db
    .from('product_series')
    .insert({ name: parsed.data.name, slug, brand_id: parsed.data.brand_id ?? null })
    .select('id')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ id: data.id })
}
