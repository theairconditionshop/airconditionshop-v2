import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRole } from '@/lib/auth/session'
import { z } from 'zod'

const ALLOWED_ROLES = ['super_admin', 'admin', 'staff']

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// Must match both the `campaigns` table columns and CampaignFormData
// (src/components/admin/campaign-form.tsx) — this previously used a stale
// legacy field shape (headline/body/cta_text/image_url) that didn't match
// either, so Zod silently stripped almost the entire form payload —
// including hero_image/gallery_images — before every insert.
const emptyToNull = (v: string | null | undefined) => (v ? v : null)

const createSchema = z.object({
  title:                z.string().min(1).max(200),
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
