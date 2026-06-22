import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendServiceRequestEmails } from '@/lib/resend/send'
import { z } from 'zod'

const schema = z.object({
  name:           z.string().min(2),
  email:          z.string().email(),
  phone:          z.string().min(4),
  address:        z.string().min(5),
  service_type:   z.string().min(1),
  description:    z.string().min(5),
  preferred_date: z.string().optional(),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    console.error('[service] Validation failed:', parsed.error.flatten())
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { name, email, phone, address, service_type, description, preferred_date } = parsed.data
  const db = createAdminClient()

  // ── Step 1: Insert service request with CORRECT column names ────────────
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
    console.error('[service] DB insert failed:', insertError)
    return NextResponse.json(
      { error: 'Unable to save your request. Please call us on +356 7966 1889.' },
      { status: 500 }
    )
  }

  // ── Step 2: Build reference number from record id ───────────────────────
  const year = new Date().getFullYear()
  const suffix = inserted.id.replace(/-/g, '').slice(0, 6).toUpperCase()
  const reference = `SR-${year}-${suffix}`

  console.log('[service] Request saved — id:', inserted.id, 'ref:', reference)

  // ── Step 3: Send emails — failure NEVER destroys booking ────────────────
  try {
    await sendServiceRequestEmails({
      name, email, phone, address, service_type, description,
      preferred_date: preferred_date || null,
      reference,
    })
  } catch (err) {
    // Log but continue — booking is already saved
    console.error('[service] Email send failed (booking still saved):', err)
  }

  return NextResponse.json({ ok: true, reference })
}
