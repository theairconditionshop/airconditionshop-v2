import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) return null
  return profile
}

const updateSchema = z.object({
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  desktop_image_url: z.string().nullable().optional(),
  tablet_image_url: z.string().nullable().optional(),
  mobile_image_url: z.string().nullable().optional(),
  overlay_opacity: z.number().min(0).max(1).optional(),
  cta_label: z.string().nullable().optional(),
  cta_href: z.string().nullable().optional(),
  show_breadcrumb: z.boolean().optional(),
})

// page_key -> the site route it powers, for cache revalidation after a save.
const PAGE_ROUTES: Record<string, string> = {
  about: '/about',
  services: '/services',
  trade: '/trade',
  contact: '/contact',
  quote: '/quote',
  brands: '/brands',
  blog: '/blog',
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const db = createAdminClient()
  const { data: row } = await db.from('page_heroes').select('page_key').eq('id', id).maybeSingle()
  const { error } = await db
    .from('page_heroes')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const routePath = row?.page_key ? PAGE_ROUTES[row.page_key] : undefined
  if (routePath) revalidatePath(routePath, 'page')

  return NextResponse.json({ ok: true })
}
