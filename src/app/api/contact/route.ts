import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendContactEnquiryEmails } from '@/lib/resend/send'
import { z } from 'zod'

const schema = z.object({
  name:    z.string().min(2),
  email:   z.string().email(),
  phone:   z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(5),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { name, email, phone, company, message } = parsed.data
  const ip = request.headers.get('x-forwarded-for') || undefined
  const db = createAdminClient()

  // Create CRM contact
  const { data: crmContact } = await db
    .from('crm_contacts')
    .upsert({ name, email, phone, company, source: 'contact_form', type: 'lead' }, { onConflict: 'email', ignoreDuplicates: false })
    .select('id')
    .single()

  // Save enquiry
  await db.from('enquiries').insert({
    crm_contact_id: crmContact?.id || null,
    name, email,
    phone: phone || null,
    company: company || null,
    message,
    source: 'contact_form',
    ip_address: ip || null,
  })

  // Send emails
  await sendContactEnquiryEmails({ name, email, phone, company, message })

  return NextResponse.json({ ok: true })
}
