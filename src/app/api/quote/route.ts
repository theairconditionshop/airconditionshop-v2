import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendQuoteRequestEmails } from '@/lib/resend/send'
import { z } from 'zod'

const schema = z.object({
  name:         z.string().min(2),
  email:        z.string().email(),
  phone:        z.string().optional(),
  company:      z.string().optional(),
  address:      z.string().optional(),
  service_type: z.string().optional(),
  budget_range: z.string().optional(),
  message:      z.string().min(5),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { name, email, phone, company, address, service_type, budget_range, message } = parsed.data
  const db = createAdminClient()

  // Upsert CRM contact
  const { data: crmContact } = await db
    .from('crm_contacts')
    .upsert(
      { name, email, phone, company, source: 'quote_form', type: 'lead' },
      { onConflict: 'email', ignoreDuplicates: false }
    )
    .select('id')
    .single()

  // Insert quote request
  await db.from('quote_requests').insert({
    crm_contact_id: crmContact?.id || null,
    name,
    email,
    phone:        phone || null,
    company:      company || null,
    address:      address || null,
    service_type: service_type || null,
    budget_range: budget_range || null,
    message,
  })

  // Send emails
  await sendQuoteRequestEmails({ name, email, company, message })

  return NextResponse.json({ ok: true })
}
