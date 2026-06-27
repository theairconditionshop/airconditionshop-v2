import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth/session'
import { z } from 'zod'
import { optionalPhoneZodField } from '@/lib/phone'

const schema = z.object({
  full_name: z.string().min(2),
  phone:     optionalPhoneZodField,
  company:   z.string().optional(),
})

export async function PUT(request: Request) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const db = createAdminClient()
  await db.from('profiles').update(parsed.data).eq('id', user.id)
  return NextResponse.json({ ok: true })
}
