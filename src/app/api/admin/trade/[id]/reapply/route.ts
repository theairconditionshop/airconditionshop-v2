import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { z } from 'zod'

const schema = z.object({ can_reapply: z.boolean() })

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const db = createAdminClient()
  const { error } = await db
    .from('trade_applications')
    .update({ can_reapply: parsed.data.can_reapply })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
