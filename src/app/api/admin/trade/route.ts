import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import {
  sendTradeApprovedEmail,
  sendTradeReactivatedEmail,
  sendTradeRejectedEmail,
  sendTradeSuspendedEmail,
} from '@/lib/resend/send'
import { z } from 'zod'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { audit } from '@/lib/audit'

const schema = z.object({
  userId:        z.string().uuid(),
  applicationId: z.string().uuid(),
  status:        z.enum(['approved', 'rejected', 'suspended']),
  name:          z.string(),
  email:         z.string().email(),
  companyName:   z.string().optional(),
  reason:        z.string().max(500).optional(),
})

export async function PATCH(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  // 60 status changes per hour per IP — generous for admins, still prevents abuse
  const rl = rateLimit(`admin-trade-action:${ip}`, 60, 60 * 60 * 1000)
  if (rl.limited) return rateLimitResponse(rl)

  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { userId, applicationId, status, name, email, companyName, reason } = parsed.data
  const db = createAdminClient()

  // Fetch current trade_status before updating so we can detect reactivation
  // (suspended → approved sends a different email than a first-time approval)
  const { data: currentProfile } = await db
    .from('profiles')
    .select('trade_status')
    .eq('id', userId)
    .single()

  const isReactivation = currentProfile?.trade_status === 'suspended' && status === 'approved'

  // Update DB first — never block the admin action on email delivery
  const appUpdate: Record<string, unknown> = {
    status,
    reviewed_by: profile.id,
    reviewed_at: new Date().toISOString(),
  }
  if (status === 'rejected' && reason) {
    appUpdate.rejection_reason = reason
  }

  await Promise.all([
    db.from('profiles').update({ trade_status: status }).eq('id', userId),
    db.from('trade_applications').update(appUpdate).eq('id', applicationId),
  ])

  await audit({
    action: `trade.${status}`, actorId: profile.id, actorEmail: profile.email,
    entityType: 'trade_application', entityId: applicationId, request,
    metadata: { target_user: userId, reactivation: isReactivation },
  })

  // Attempt email — capture failure without throwing
  let emailDelivered = true
  let emailError: string | null = null

  try {
    if (status === 'approved') {
      if (isReactivation) {
        await sendTradeReactivatedEmail({ name, email, companyName })
      } else {
        await sendTradeApprovedEmail({ name, email, companyName })
      }
    } else if (status === 'rejected') {
      await sendTradeRejectedEmail({ name, email, companyName, reason })
    } else if (status === 'suspended') {
      await sendTradeSuspendedEmail({ name, email, companyName, reason })
    }
  } catch (err) {
    emailDelivered = false
    emailError = err instanceof Error ? err.message : 'Unknown error'
    console.error('[admin/trade] email send failed (status still updated):', emailError)
  }

  return NextResponse.json({ ok: true, emailDelivered, emailError })
}
