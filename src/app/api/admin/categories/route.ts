import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { z } from 'zod'

const categorySchema = z.object({
  name:        z.string().min(1).max(200),
  slug:        z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  icon:        z.string().max(100).optional(),
  image_url:   z.string().url().optional().or(z.literal('')),
  is_active:   z.boolean().default(true),
  display_order: z.number().int().optional(),
  parent_id:   z.string().uuid().optional().nullable(),
})

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const raw = await request.json()
  const parsed = categorySchema.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const db = createAdminClient()
  const { data, error } = await db.from('categories').insert(parsed.data).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ id: data.id })
}
