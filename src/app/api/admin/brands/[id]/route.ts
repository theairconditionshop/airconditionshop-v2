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
  logo_url:    z.string().max(500).nullable().optional(),
  hero_url:    z.string().max(500).nullable().optional(),
  is_featured: z.boolean().optional(),
  is_active:   z.boolean().optional(),
  sort_order:  z.number().int().optional(),
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
  await db.from('brands').update(parsed.data).eq('id', id)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const db = createAdminClient()
  await db.from('brands').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
