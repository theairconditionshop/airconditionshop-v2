import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/auth/session'
import { sendTradeApprovedEmail, sendTradeRejectedEmail } from '@/lib/resend/send'
import { z } from 'zod'

const schema = z.object({
  userId:        z.string(),
  applicationId: z.string(),
  status:        z.enum(['approved', 'rejected']),
  name:          z.string(),
  email:         z.string(),
})

export async function PATCH(request: Request) {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { userId, applicationId, status, name, email } = schema.parse(body)
  const db = createAdminClient()

  await Promise.all([
    db.from('profiles').update({ trade_status: status }).eq('id', userId),
    db.from('trade_applications').update({ status }).eq('id', applicationId),
  ])

  if (status === 'approved') {
    await sendTradeApprovedEmail({ name, email })
  } else {
    await sendTradeRejectedEmail({ name, email })
  }

  return NextResponse.json({ ok: true })
}
