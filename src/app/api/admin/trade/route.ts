import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import {
  sendTradeApprovedEmail,
  sendTradeRejectedEmail,
  sendTradeSuspendedEmail,
} from '@/lib/resend/send'
import { z } from 'zod'

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

  // Update DB first — never block the admin action on email delivery
  await Promise.all([
    db.from('profiles').update({ trade_status: status }).eq('id', userId),
    db.from('trade_applications').update({
      status,
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', applicationId),
  ])

  // Attempt email — capture failure without throwing
  let emailDelivered = true
  let emailError: string | null = null

  try {
    if (status === 'approved') {
      await sendTradeApprovedEmail({ name, email, companyName })
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
