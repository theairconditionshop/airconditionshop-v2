import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
// sendServiceBookedEmail is used after a job is scheduled; on initial request we just log
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
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { name, email, phone, address, service_type, description, preferred_date } = parsed.data
  const db = createAdminClient()

  // Upsert CRM contact
  const { data: crmContact } = await db
    .from('crm_contacts')
    .upsert(
      { name, email, phone, source: 'service_form', type: 'lead' },
      { onConflict: 'email', ignoreDuplicates: false }
    )
    .select('id')
    .single()

  // Insert service request
  await db.from('service_requests').insert({
    crm_contact_id:  crmContact?.id || null,
    customer_name:   name,
    customer_email:  email,
    customer_phone:  phone,
    address,
    service_type,
    description,
    preferred_date:  preferred_date || null,
    status:          'new',
  })

  return NextResponse.json({ ok: true })
}
