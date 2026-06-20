import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTradeApplicationEmails } from '@/lib/resend/send'
import { z } from 'zod'

const schema = z.object({
  name:          z.string().min(2),
  email:         z.string().email(),
  phone:         z.string().min(4),
  company:       z.string().min(2),
  vat_number:    z.string().optional(),
  business_type: z.string().min(1),
  message:       z.string().optional(),
  password:      z.string().min(8),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { name, email, phone, company, vat_number, business_type, message, password } = parsed.data
  const db = createAdminClient()

  // Create Supabase auth user
  const { data: authData, error: authError } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Could not create account.' }, { status: 500 })
  }

  const userId = authData.user.id

  // Update profile with role=trade, status=pending
  await db.from('profiles').update({
    full_name:    name,
    phone,
    company,
    role:         'trade',
    trade_status: 'pending',
  }).eq('id', userId)

  // Insert trade application
  const { error: appError } = await db.from('trade_applications').insert({
    user_id:       userId,
    company_name:  company,
    vat_number:    vat_number || null,
    business_type,
    phone,
    notes:         message || null,
    status:        'pending',
  })
  if (appError) {
    console.error('trade_applications insert failed:', appError.message)
  }

  // Send notification emails
  await sendTradeApplicationEmails({ name, email, companyName: company })

  return NextResponse.json({ ok: true })
}
