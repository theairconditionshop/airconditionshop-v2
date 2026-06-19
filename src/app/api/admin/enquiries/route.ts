import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { z } from 'zod'

const schema = z.object({ id: z.string(), status: z.string() })

export async function PATCH(request: Request) {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await request.json()
  const { id, status } = schema.parse(body)
  const db = createAdminClient()
  await db.from('enquiries').update({ status }).eq('id', id)
  return NextResponse.json({ ok: true })
}
