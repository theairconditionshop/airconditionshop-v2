import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRole } from '@/lib/auth/session'

export async function POST(req: Request) {
  const role = await getRole()
  if (!role || !['super_admin', 'admin', 'staff'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { question, answer, category, display_order, is_active } = body

  if (!question?.trim() || !answer?.trim()) {
    return NextResponse.json({ error: 'Question and answer required' }, { status: 400 })
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('faqs')
    .insert({ question, answer, category: category || 'general', display_order: Number(display_order) || 0, is_active: Boolean(is_active) })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id }, { status: 201 })
}
