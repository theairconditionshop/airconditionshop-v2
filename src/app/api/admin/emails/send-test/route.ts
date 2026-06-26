import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getProfile } from '@/lib/auth/session'
import { buildEmailPreview, TEMPLATE_SUBJECTS } from '@/lib/resend/preview'
import { Resend } from 'resend'

const schema = z.object({
  key: z.string().min(1),
  to:  z.string().email(),
})

export async function POST(request: Request) {
  const profile = await getProfile()
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { key, to } = parsed.data

  const html = buildEmailPreview(key)
  if (!html) return NextResponse.json({ error: 'Unknown template key' }, { status: 404 })

  const subject = `[TEST] ${TEMPLATE_SUBJECTS[key] ?? key}`

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from: 'THE AIRCONDITION SHOP <support@theairconditionshop.com>',
    to,
    subject,
    html,
  })

  if (error) {
    console.error('[email/send-test] send failed:', error)
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
