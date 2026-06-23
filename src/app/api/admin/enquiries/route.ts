import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { z } from 'zod'

const schema = z.object({
  id:     z.string().uuid(),
  status: z.enum(['new', 'read', 'replied', 'closed']),
})

export async function PATCH(request: Request) {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { id, status } = parsed.data
  const db = createAdminClient()
  await db.from('enquiries').update({ status }).eq('id', id)
  return NextResponse.json({ ok: true })
}
