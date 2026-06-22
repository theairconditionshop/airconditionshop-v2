import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { sendTradeApprovedEmail, sendTradeRejectedEmail } from '@/lib/resend/send'
import { z } from 'zod'

const schema = z.object({
  userId:        z.string(),
  applicationId: z.string(),
  status:        z.enum(['approved', 'rejected', 'suspended']),
  name:          z.string(),
  email:         z.string(),
})

export async function PATCH(request: Request) {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin', 'staff'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { userId, applicationId, status, name, email } = schema.parse(body)
  const db = createAdminClient()

  await Promise.all([
    db.from('profiles').update({ trade_status: status }).eq('id', userId),
    db.from('trade_applications').update({ status }).eq('id', applicationId),
  ])

  try {
    if (status === 'approved') {
      await sendTradeApprovedEmail({ name, email })
    } else if (status === 'rejected') {
      await sendTradeRejectedEmail({ name, email })
    }
    // suspended: no email sent
  } catch (err) {
    console.error('[admin/trade] email send failed (status still updated):', err)
  }

  return NextResponse.json({ ok: true })
}
