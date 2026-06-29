import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRole } from '@/lib/auth/session'

export async function POST(req: Request) {
  const role = await getRole()
  if (!role || !['super_admin', 'admin', 'staff'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, title, company, content, rating, display_order, is_active } = body

  if (!name?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Name and content required' }, { status: 400 })
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('testimonials')
    .insert({ name, title: title || null, company: company || null, content, rating: Number(rating) || 5, display_order: Number(display_order) || 0, is_active: Boolean(is_active) })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id }, { status: 201 })
}
