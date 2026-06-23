import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRole } from '@/lib/auth/session'
import { createHash } from 'node:crypto'
import { z } from 'zod'

const eventSchema = z.object({
  campaign_id: z.string().uuid(),
  event_type:  z.enum(['view', 'cta_click', 'share', 'lead_submit']),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = eventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { campaign_id, event_type } = parsed.data
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
  const ip_hash = ip ? createHash('sha256').update(ip).digest('hex').slice(0, 8) : null
  const referrer   = req.headers.get('referer')?.slice(0, 500) ?? null
  const user_agent = req.headers.get('user-agent')?.slice(0, 300) ?? null

  const db = createAdminClient()
  await db.from('campaign_analytics').insert({ campaign_id, event_type, ip_hash, referrer, user_agent })

  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  const role = await getRole()
  if (!role || !['super_admin', 'admin', 'staff'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const campaign_id = req.nextUrl.searchParams.get('campaign_id')
  const db = createAdminClient()

  const { data: campaigns } = await db.from('campaigns').select('id, title, status')

  let analyticsQuery = db.from('campaign_analytics').select('campaign_id, event_type')
  if (campaign_id) analyticsQuery = analyticsQuery.eq('campaign_id', campaign_id)
  const { data: events } = await analyticsQuery

  const summaryMap: Record<string, { views: number; cta_clicks: number; shares: number; lead_submits: number; title: string; status: string }> = {}

  for (const c of (campaigns ?? [])) {
    summaryMap[c.id] = { views: 0, cta_clicks: 0, shares: 0, lead_submits: 0, title: c.title, status: c.status }
  }

  for (const e of (events ?? [])) {
    if (!summaryMap[e.campaign_id]) continue
    if (e.event_type === 'view')         summaryMap[e.campaign_id].views++
    if (e.event_type === 'cta_click')    summaryMap[e.campaign_id].cta_clicks++
    if (e.event_type === 'share')        summaryMap[e.campaign_id].shares++
    if (e.event_type === 'lead_submit')  summaryMap[e.campaign_id].lead_submits++
  }

  const summary = Object.entries(summaryMap).map(([id, s]) => ({
    campaign_id: id,
    title: s.title,
    status: s.status,
    views: s.views,
    cta_clicks: s.cta_clicks,
    shares: s.shares,
    lead_submits: s.lead_submits,
    conversion_rate: s.views > 0 ? Math.round((s.lead_submits / s.views) * 1000) / 10 : 0,
  })).sort((a, b) => b.views - a.views)

  return NextResponse.json(summary)
}
