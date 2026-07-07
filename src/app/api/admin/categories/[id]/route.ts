import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { z } from 'zod'

async function requireAdmin() {
  const profile = await getProfile()
  return profile && ['super_admin', 'admin', 'staff'].includes(profile.role) ? profile : null
}

const updateSchema = z.object({
  name:        z.string().min(1).max(100).optional(),
  slug:        z.string().min(1).max(100).optional(),
  description: z.string().max(2000).nullable().optional(),
  seo_title:   z.string().max(200).nullable().optional(),
  seo_desc:    z.string().max(500).nullable().optional(),
  image_url:   z.string().max(500).nullable().optional(),
  parent_id:   z.string().uuid().nullable().optional(),
  display_order: z.number().int().optional(),
  is_active:   z.boolean().optional(),
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
  await db.from('categories').update(parsed.data).eq('id', id)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const db = createAdminClient()
  await db.from('categories').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
