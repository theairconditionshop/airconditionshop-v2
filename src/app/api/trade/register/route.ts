import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTradeApplicationEmails } from '@/lib/resend/send'
import { z } from 'zod'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const schema = z.object({
  name:                z.string().min(2).max(100),
  email:               z.string().email().max(254),
  phone:               z.string().min(4).max(30),
  company:             z.string().min(2).max(100),
  vat_number:          z.string().max(30).optional(),
  registration_number: z.string().max(50).optional(),
  business_type:       z.string().min(1).max(100),
  address:             z.string().min(3).max(200),
  postal_code:         z.string().min(2).max(20),
  message:             z.string().max(1000).optional(),
  password:            z.string().min(8).max(128),
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const rl = rateLimit(`trade-register:${ip}`, 5, 60 * 60 * 1000)
  if (rl.limited) return rateLimitResponse(rl)

  // Require verified email cookie
  const cookieStore = await cookies()
  const verifiedEmail = cookieStore.get('trade_email_verified')?.value

  if (!verifiedEmail) {
    return NextResponse.json(
      { error: 'Email verification required. Please verify your email address first.' },
      { status: 403 },
    )
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const {
    name, email, phone, company, vat_number, registration_number,
    business_type, address, postal_code, message, password,
  } = parsed.data

  // Verified email must match submitted email (prevents cookie theft across sessions)
  if (verifiedEmail.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json(
      { error: 'Email mismatch. Please verify the email address you are registering with.' },
      { status: 403 },
    )
  }

  const db = createAdminClient()

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

  await db.from('profiles').update({
    full_name:    name,
    phone,
    company,
    role:         'trade',
    trade_status: 'pending',
  }).eq('id', userId)

  const { error: appError } = await db.from('trade_applications').insert({
    user_id:             userId,
    company_name:        company,
    vat_number:          vat_number          || null,
    registration_number: registration_number || null,
    business_type,
    address,
    postal_code,
    phone,
    notes:               message             || null,
    status:              'pending',
  })
  if (appError) {
    console.error('trade_applications insert failed:', appError.message)
  }

  try {
    await sendTradeApplicationEmails({ name, email, companyName: company })
  } catch (err) {
    console.error('[trade/register] Email notification failed (application saved):', err)
  }

  // Clear verified cookie — it's been consumed
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('trade_email_verified')
  return response
}
