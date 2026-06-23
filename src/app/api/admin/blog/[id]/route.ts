import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { z } from 'zod'

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

const updateSchema = z.object({
  title:        z.string().min(1).max(200).optional(),
  slug:         z.string().min(1).max(200).optional(),
  content:      z.string().max(200000).optional(),
  excerpt:      z.string().max(600).nullable().optional(),
  status:       z.enum(['draft', 'published', 'archived']).optional(),
  cover_url:    z.string().max(500).nullable().optional(),
  seo_title:    z.string().max(200).nullable().optional(),
  seo_desc:     z.string().max(500).nullable().optional(),
  author_name:  z.string().max(100).nullable().optional(),
  published_at: z.string().nullable().optional(),
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
  const { error } = await db.from('blog_posts').update(parsed.data).eq('id', id)
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const db = createAdminClient()
  await db.from('blog_posts').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
