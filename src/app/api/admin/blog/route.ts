import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { z } from 'zod'

const blogSchema = z.object({
  title:        z.string().min(1).max(500),
  slug:         z.string().min(1).max(500),
  excerpt:      z.string().max(1000).optional(),
  content:      z.string().optional(),
  cover_image:  z.string().url().optional().or(z.literal('')),
  status:       z.enum(['draft', 'published']).default('draft'),
  published_at: z.string().datetime().optional().nullable(),
  meta_title:   z.string().max(200).optional(),
  meta_desc:    z.string().max(500).optional(),
  author_id:    z.string().uuid().optional().nullable(),
  category_id:  z.string().uuid().optional().nullable(),
})

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const raw = await request.json()
  const parsed = blogSchema.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const db = createAdminClient()
  const { data, error } = await db.from('blog_posts').insert(parsed.data).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ id: data.id })
}
