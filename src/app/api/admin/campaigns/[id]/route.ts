import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRole } from '@/lib/auth/session'
import { z } from 'zod'

const ALLOWED_ROLES = ['super_admin', 'admin', 'staff']

interface Params { params: Promise<{ id: string }> }

const updateSchema = z.object({
  title:      z.string().min(1).max(200).optional(),
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

export async function GET(_req: NextRequest, { params }: Params) {
  const role = await getRole()
  if (!role || !ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await params
  const db = createAdminClient()
  const { data, error } = await db.from('campaigns').select('*').eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const role = await getRole()
  if (!role || !ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const db = createAdminClient()
  const { data, error } = await db
    .from('campaigns')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const role = await getRole()
  if (!role || !ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id } = await params
  const db = createAdminClient()
  const { error } = await db.from('campaigns').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
