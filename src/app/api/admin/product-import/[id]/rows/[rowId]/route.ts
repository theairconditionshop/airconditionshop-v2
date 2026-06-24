import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { z } from 'zod'

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

const patchSchema = z.object({
  action:   z.enum(['create', 'update', 'skip']).optional(),
  raw_data: z.record(z.string(), z.unknown()).optional(),
})

// PATCH /api/admin/product-import/[id]/rows/[rowId]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; rowId: string }> },
) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { rowId } = await params

  const body = patchSchema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const db = createAdminClient()
  const { error } = await db
    .from('product_import_rows')
    .update(body.data)
    .eq('id', rowId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
