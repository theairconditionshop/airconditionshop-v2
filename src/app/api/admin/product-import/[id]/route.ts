import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { z } from 'zod'

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

// If a parse function was killed by the serverless runtime the catch block never ran,
// leaving the row in "parsing" forever. Auto-reset any import that has been stuck
// in "parsing" for longer than maxDuration (120 s) plus a small buffer (60 s).
const STUCK_THRESHOLD_MS = 3 * 60 * 1000 // 3 minutes

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

  // Auto-recover stuck imports — serverless functions can be killed without running catch
  if (imp.status === 'parsing') {
    const age = Date.now() - new Date(imp.created_at).getTime()
    if (age > STUCK_THRESHOLD_MS) {
      await db.from('product_imports').update({
        status: 'failed',
        error_message: 'Parsing timed out — the serverless function was killed before completing. Click Retry Parse to try again.',
      }).eq('id', id).eq('status', 'parsing')
      return NextResponse.json({ import: { ...imp, status: 'failed', error_message: 'Parsing timed out — the serverless function was killed before completing. Click Retry Parse to try again.' }, rows: rows ?? [] })
    }
  }

  return NextResponse.json({ import: imp, rows: rows ?? [] })
}

const patchSchema = z.object({
  type:             z.enum(['catalogue', 'price_list']).optional(),
  replace_existing: z.boolean().optional(),
  action:           z.literal('cancel').optional(),
})

// PATCH /api/admin/product-import/[id] — update type, replace_existing flag, or cancel
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = patchSchema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const db = createAdminClient()

  if (body.data.action === 'cancel') {
    // Only cancel if currently parsing — prevents race with a just-completed parse
    const { error } = await db.from('product_imports')
      .update({ status: 'cancelled', error_message: null })
      .eq('id', id)
      .eq('status', 'parsing')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  const { action: _action, ...rest } = body.data
  const { error } = await db.from('product_imports').update(rest).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
