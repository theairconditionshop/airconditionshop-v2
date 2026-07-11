import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { z } from 'zod'

const cardSchema = z.object({
  title:         z.string().min(1).max(120),
  subtitle:      z.string().max(200).nullable().optional(),
  image_url:     z.string().url().nullable().optional().or(z.literal('')),
  href:          z.string().min(1).max(500),
  is_active:     z.boolean().optional(),
})

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

function revalidateHomepage() {
  revalidatePath('/', 'page')
}

// PUT — update a card (only applied when the admin presses Save on the card)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const parsed = cardSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })

  const db = createAdminClient()
  const { data, error } = await db
    .from('homepage_cards')
    .update({ ...parsed.data, image_url: parsed.data.image_url || null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: `Database update failed: ${error.message}` }, { status: 500 })
  revalidateHomepage()
  return NextResponse.json(data)
}

// DELETE — remove a card. The image file itself is left in Storage for the
// orphan sweep, consistent with the site-wide media lifecycle.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const db = createAdminClient()
  const { error } = await db.from('homepage_cards').delete().eq('id', id)
  if (error) return NextResponse.json({ error: `Delete failed: ${error.message}` }, { status: 500 })
  revalidateHomepage()
  return NextResponse.json({ ok: true })
}
