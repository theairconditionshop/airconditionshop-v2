import bcrypt from 'bcryptjs'
import { randomInt } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

const ROUNDS = parseInt(process.env.OTP_BCRYPT_ROUNDS || '10')
const EXPIRY_MINUTES = 10
const MAX_ATTEMPTS = 5

// crypto.randomInt is cryptographically secure; Math.random() is not.
function generateCode(): string {
  return randomInt(100000, 1000000).toString()
}

export async function createOtpSession(userId: string, ipAddress?: string) {
  const code = generateCode()
  const hash = await bcrypt.hash(code, ROUNDS)
  const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000).toISOString()

  const supabase = createAdminClient()

  // Invalidate previous unused OTPs for this user
  await supabase
    .from('otp_sessions')
    .update({ used: true })
    .eq('user_id', userId)
    .eq('used', false)

  const { error } = await supabase.from('otp_sessions').insert({
    user_id: userId,
    otp_code: hash,
    expires_at: expiresAt,
    ip_address: ipAddress ?? null,
  })

  if (error) {
    console.error('[otp] Failed to insert OTP session:', error.message, 'code:', error.code)
    throw new Error('Failed to create OTP session')
  }

  console.log('[otp] Session created for userId:', userId, 'expires:', expiresAt)
  return code // plain code — send via email, never store
}

export async function verifyOtpSession(userId: string, code: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { data: sessions } = await supabase
    .from('otp_sessions')
    .select('id, otp_code, expires_at, attempt_count')
    .eq('user_id', userId)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!sessions || sessions.length === 0) return false

  const session = sessions[0]

  // Brute-force protection: invalidate after MAX_ATTEMPTS wrong guesses
  if ((session.attempt_count ?? 0) >= MAX_ATTEMPTS) {
    console.warn('[otp] Max attempts exceeded for session:', session.id)
    await supabase.from('otp_sessions').update({ used: true }).eq('id', session.id)
    return false
  }

  // Check expiry
  if (new Date(session.expires_at) < new Date()) return false

  // Check code
  const valid = await bcrypt.compare(code, session.otp_code)

  if (!valid) {
    const newCount = (session.attempt_count ?? 0) + 1
    await supabase
      .from('otp_sessions')
      .update({ attempt_count: newCount, used: newCount >= MAX_ATTEMPTS })
      .eq('id', session.id)
    console.warn('[otp] Invalid code attempt', newCount, '/', MAX_ATTEMPTS, 'session:', session.id)
    return false
  }

  // Mark used
  await supabase
    .from('otp_sessions')
    .update({ used: true })
    .eq('id', session.id)

  return true
}

// ─── Email-based OTP (no user account required) ───────────────────────────────
// Used for: trade registration email verification, password reset OTP.
// Stored in email_otps table keyed by email + purpose.

export type EmailOtpPurpose = 'trade_registration' | 'password_reset'

export async function createEmailOtp(
  email: string,
  purpose: EmailOtpPurpose,
  ipAddress?: string,
): Promise<string> {
  const code = generateCode()
  const hash = await bcrypt.hash(code, ROUNDS)
  const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000).toISOString()
  const db = createAdminClient()

  // Invalidate any prior unused OTPs for same email + purpose
  await db
    .from('email_otps')
    .update({ used: true })
    .eq('email', email)
    .eq('purpose', purpose)
    .eq('used', false)

  const { error } = await db.from('email_otps').insert({
    email,
    purpose,
    otp_hash: hash,
    expires_at: expiresAt,
    ip_address: ipAddress ?? null,
  })

  if (error) {
    console.error('[email-otp] Insert failed:', error.message)
    throw new Error('Failed to create email OTP')
  }

  console.log('[email-otp] Created — email:', email, 'purpose:', purpose)
  return code
}

export type EmailOtpResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'expired' | 'max_attempts' | 'invalid' }

export async function verifyEmailOtp(
  email: string,
  purpose: EmailOtpPurpose,
  code: string,
): Promise<EmailOtpResult> {
  const db = createAdminClient()

  const { data: rows } = await db
    .from('email_otps')
    .select('id, otp_hash, expires_at, attempt_count')
    .eq('email', email)
    .eq('purpose', purpose)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!rows || rows.length === 0) return { ok: false, reason: 'not_found' }

  const row = rows[0]

  if ((row.attempt_count ?? 0) >= MAX_ATTEMPTS) {
    await db.from('email_otps').update({ used: true }).eq('id', row.id)
    return { ok: false, reason: 'max_attempts' }
  }

  if (new Date(row.expires_at) < new Date()) {
    return { ok: false, reason: 'expired' }
  }

  const valid = await bcrypt.compare(code, row.otp_hash)

  if (!valid) {
    const newCount = (row.attempt_count ?? 0) + 1
    await db
      .from('email_otps')
      .update({ attempt_count: newCount, used: newCount >= MAX_ATTEMPTS })
      .eq('id', row.id)
    console.warn('[email-otp] Wrong code attempt', newCount, '/', MAX_ATTEMPTS, 'id:', row.id)
    return { ok: false, reason: 'invalid' }
  }

  await db.from('email_otps').update({ used: true }).eq('id', row.id)
  console.log('[email-otp] Verified — email:', email, 'purpose:', purpose)
  return { ok: true }
}
