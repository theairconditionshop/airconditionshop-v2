import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRole } from '@/lib/auth/session'
import { z } from 'zod'

const ALLOWED_ROLES = ['super_admin', 'admin', 'staff']

interface Params { params: Promise<{ id: string }> }

// Kept in sync with the create schema in ../route.ts — see the comment
// there for why this must match CampaignFormData exactly.
const emptyToNull = (v: string | null | undefined) => (v ? v : null)

const updateSchema = z.object({
  title:                z.string().min(1).max(200).optional(),
  slug:                 z.string().max(200).optional(),
  campaign_type:        z.enum(['competition', 'giveaway', 'seasonal_promotion', 'world_cup_promotion', 'referral', 'discount', 'free_installation', 'trade', 'product_launch']).optional(),
  short_description:    z.string().max(500).nullable().optional(),
  hero_image:           z.string().max(500).nullable().optional(),
  gallery_images:       z.array(z.string()).optional(),
  full_description:     z.string().max(20000).nullable().optional(),
  prize:                z.string().max(300).nullable().optional(),
  prize_value:          z.union([z.string(), z.number()]).nullable().optional()
    .transform(v => (v === null || v === undefined || v === '') ? null : (Number.isFinite(Number(v)) ? Number(v) : null)),
  how_to_enter:         z.array(z.string()).optional(),
  rules:                z.string().nullable().optional(),
  eligibility:          z.string().nullable().optional(),
  terms_and_conditions: z.string().nullable().optional(),
  start_date:           z.string().nullable().optional().transform(emptyToNull),
  end_date:             z.string().nullable().optional().transform(emptyToNull),
  status:               z.enum(['draft', 'scheduled', 'active', 'ended', 'archived']).optional(),
  featured:             z.boolean().optional(),
  seo_title:            z.string().max(200).nullable().optional(),
  seo_description:      z.string().max(400).nullable().optional(),
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
