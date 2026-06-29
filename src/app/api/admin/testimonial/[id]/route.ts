import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRole } from '@/lib/auth/session'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const role = await getRole()
  if (!role || !['super_admin', 'admin', 'staff'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, title, company, content, rating, display_order, is_active } = body

  const db = createAdminClient()
  const { error } = await db
    .from('testimonials')
    .update({ name, title: title || null, company: company || null, content, rating: Number(rating), display_order: Number(display_order), is_active: Boolean(is_active) })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const role = await getRole()
  if (!role || !['super_admin', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const db = createAdminClient()
  const { error } = await db.from('testimonials').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
