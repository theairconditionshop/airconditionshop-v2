import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRole } from '@/lib/auth/session'
import { z } from 'zod'

const ALLOWED_ROLES = ['super_admin', 'admin', 'staff']

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const createSchema = z.object({
  title:      z.string().min(1).max(200),
  slug:       z.string().max(200).optional(),
  type:       z.string().max(50).optional(),
  status:     z.enum(['draft', 'active', 'archived']).optional(),
  headline:   z.string().max(300).nullable().optional(),
  body:       z.string().max(10000).nullable().optional(),
  cta_text:   z.string().max(100).nullable().optional(),
  cta_url:    z.string().max(500).nullable().optional(),
  image_url:  z.string().max(500).nullable().optional(),
  starts_at:  z.string().nullable().optional(),
  ends_at:    z.string().nullable().optional(),
})

export async function GET() {
  const role = await getRole()
  if (!role || !ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const db = createAdminClient()
  const { data, error } = await db.from('campaigns').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const role = await getRole()
  if (!role || !ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { slug: providedSlug, ...rest } = parsed.data
  const slug = providedSlug || generateSlug(rest.title)

  const db = createAdminClient()
  const { data, error } = await db
    .from('campaigns')
    .insert({ ...rest, slug })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
