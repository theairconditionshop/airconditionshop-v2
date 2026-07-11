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
  display_order: z.number().int().optional(),
  is_active:     z.boolean().default(true),
})

const reorderSchema = z.object({
  order: z.array(z.object({ id: z.string().uuid(), display_order: z.number().int() })).min(1),
})

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

function revalidateHomepage() {
  revalidatePath('/', 'page')
}

// GET — all cards (including inactive) for the admin editor
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const db = createAdminClient()
  const { data, error } = await db.from('homepage_cards').select('*').order('display_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — create a card
export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = cardSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })

  const db = createAdminClient()
  // Append at the end by default
  const { data: last } = await db.from('homepage_cards').select('display_order').order('display_order', { ascending: false }).limit(1)
  const display_order = parsed.data.display_order ?? ((last?.[0]?.display_order ?? 0) + 1)

  const { data, error } = await db
    .from('homepage_cards')
    .insert({ ...parsed.data, image_url: parsed.data.image_url || null, display_order })
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: `Database insert failed: ${error.message}` }, { status: 500 })
  revalidateHomepage()
  return NextResponse.json(data)
}

// PUT — bulk reorder after drag & drop
export async function PUT(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = reorderSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 })

  const db = createAdminClient()
  for (const { id, display_order } of parsed.data.order) {
    const { error } = await db.from('homepage_cards').update({ display_order, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) return NextResponse.json({ error: `Reorder failed: ${error.message}` }, { status: 500 })
  }
  revalidateHomepage()
  return NextResponse.json({ ok: true })
}
