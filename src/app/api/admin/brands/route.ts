import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { z } from 'zod'

const brandSchema = z.object({
  name:              z.string().min(1).max(200),
  slug:              z.string().min(1).max(200),
  logo_url:          z.string().max(500).nullable().optional(),
  hero_url:          z.string().max(500).nullable().optional(),
  logo_display_mode: z.enum(['invert', 'grayscale', 'normal']).optional(),
  description:       z.string().max(2000).nullable().optional(),
  seo_title:         z.string().max(200).nullable().optional(),
  seo_desc:          z.string().max(500).nullable().optional(),
  website_url:       z.string().max(500).nullable().optional(),
  is_active:         z.boolean().default(true),
  display_order:     z.number().int().optional(),
})

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const raw = await request.json()
  const parsed = brandSchema.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const db = createAdminClient()
  const { data, error } = await db.from('brands').insert(parsed.data).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ id: data.id })
}
