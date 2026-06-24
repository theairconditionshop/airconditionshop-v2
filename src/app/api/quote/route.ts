import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendQuoteRequestEmails } from '@/lib/resend/send'
import { z } from 'zod'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const schema = z.object({
  name:         z.string().min(2).max(100),
  email:        z.string().email().max(254),
  phone:        z.string().max(30).optional(),
  company:      z.string().max(100).optional(),
  address:      z.string().max(300).optional(),
  service_type: z.string().max(50).optional(),
  budget_range: z.string().max(50).optional(),
  message:      z.string().min(5).max(2000),
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const rl = rateLimit(`quote:${ip}`, 10, 60 * 60 * 1000) // 10 per hour
  if (rl.limited) return rateLimitResponse(rl.resetAt)

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { name, email, phone, company, address, service_type, budget_range, message } = parsed.data
  const db = createAdminClient()

  const { data: crmContact } = await db
    .from('crm_contacts')
    .upsert(
      { name, email, phone, company, source: 'quote_form', type: 'lead' },
      { onConflict: 'email', ignoreDuplicates: false }
    )
    .select('id')
    .single()

  await db.from('quote_requests').insert({
    crm_contact_id: crmContact?.id || null,
    name,
    email,
    phone:        phone        || null,
    company:      company      || null,
    address:      address      || null,
    service_type: service_type || null,
    budget_range: budget_range || null,
    message,
  })

  try {
    await sendQuoteRequestEmails({ name, email, company, message })
  } catch (err) {
    console.error('[quote] Email notification failed (quote request saved):', err)
  }

  return NextResponse.json({ ok: true })
}
