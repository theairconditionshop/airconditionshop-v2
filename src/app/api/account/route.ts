import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth/session'
import { z } from 'zod'

const schema = z.object({
  full_name: z.string().min(2),
  phone:     z.string().optional(),
  company:   z.string().optional(),
})

export async function PUT(request: Request) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const data = schema.parse(body)
  const db   = createAdminClient()
  await db.from('profiles').update(data).eq('id', user.id)
  return NextResponse.json({ ok: true })
}
