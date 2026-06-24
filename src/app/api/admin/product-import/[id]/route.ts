import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { z } from 'zod'

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

// GET /api/admin/product-import/[id]
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const db = createAdminClient()

  const [{ data: imp }, { data: rows }] = await Promise.all([
    db.from('product_imports').select('*').eq('id', id).single(),
    db.from('product_import_rows')
      .select('*, product:matched_product_id(id, name, slug)')
      .eq('import_id', id)
      .order('row_index'),
  ])

  if (!imp) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ import: imp, rows: rows ?? [] })
}

const patchSchema = z.object({
  type:             z.enum(['catalogue', 'price_list']).optional(),
  replace_existing: z.boolean().optional(),
})

// PATCH /api/admin/product-import/[id] — update type or replace_existing flag
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = patchSchema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const db = createAdminClient()
  const { error } = await db.from('product_imports').update(body.data).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
