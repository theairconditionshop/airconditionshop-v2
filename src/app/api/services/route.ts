import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendServiceRequestEmails } from '@/lib/resend/send'
import { z } from 'zod'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const SERVICE_TYPE_VALUES = ['installation', 'repair', 'maintenance', 'inspection', 'commercial', 'coldroom', 'other'] as const

const schema = z.object({
  name:           z.string().min(2).max(100),
  email:          z.string().email().max(254),
  phone:          z.string().min(4).max(30),
  address:        z.string().min(5).max(300),
  service_type:   z.enum(SERVICE_TYPE_VALUES),
  description:    z.string().min(5).max(2000),
  preferred_date: z.string().max(50).optional(),
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const rl = rateLimit(`services:${ip}`, 10, 60 * 60 * 1000) // 10 per hour
  if (rl.limited) return rateLimitResponse(rl)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    console.error('[service] Validation failed:', parsed.error.flatten())
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { name, email, phone, address, service_type, description, preferred_date } = parsed.data
  const db = createAdminClient()

  const { data: inserted, error: insertError } = await db
    .from('service_requests')
    .insert({
      name,
      email,
      phone,
      address,
      service_type,
      description,
      preferred_date: preferred_date || null,
      status:         'new',
      source:         'website',
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    console.error('[service] DB insert failed:', JSON.stringify(insertError))
    return NextResponse.json(
      { error: 'Unable to save your request. Please call us on +356 7966 1889.' },
      { status: 500 }
    )
  }

  const year      = new Date().getFullYear()
  const suffix    = inserted.id.replace(/-/g, '').slice(0, 6).toUpperCase()
  const reference = `SR-${year}-${suffix}`

  console.log('[service] Booking saved — id:', inserted.id, 'ref:', reference)

  try {
    await sendServiceRequestEmails({
      name, email, phone, address, service_type, description,
      preferred_date: preferred_date || null,
      reference,
    })
    console.log('[service] Emails sent — ref:', reference)
  } catch (err) {
    console.error('[service] Email send failed (booking still saved):', err)
  }

  return NextResponse.json({ ok: true, reference })
}
