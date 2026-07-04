import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

const updateSchema = z.object({
  data:    z.record(z.string(), z.unknown()).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const db = createAdminClient()
  const { data: row } = await db.from('homepage_sections').select('section_key').eq('id', id).maybeSingle()
  await db.from('homepage_sections').update({ data: parsed.data.data ?? parsed.data.content }).eq('id', id)
  revalidatePath('/', 'page')
  if (row?.section_key === 'services_page') revalidatePath('/services', 'page')
  if (row?.section_key === 'trade_page') revalidatePath('/trade', 'page')
  if (row?.section_key === 'about_page') {
    revalidatePath('/about', 'page')
    revalidatePath('/contact', 'page')
  }
  return NextResponse.json({ ok: true })
}
