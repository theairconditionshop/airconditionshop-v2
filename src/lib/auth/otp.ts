import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/admin'

const ROUNDS = parseInt(process.env.OTP_BCRYPT_ROUNDS || '12')
const EXPIRY_MINUTES = 10

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
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

  if (error) throw new Error('Failed to create OTP session')

  return code // plain code — send via email, never store
}

export async function verifyOtpSession(userId: string, code: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { data: sessions } = await supabase
    .from('otp_sessions')
    .select('id, otp_code, expires_at')
    .eq('user_id', userId)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!sessions || sessions.length === 0) return false

  const session = sessions[0]

  // Check expiry
  if (new Date(session.expires_at) < new Date()) return false

  // Check code
  const valid = await bcrypt.compare(code, session.otp_code)
  if (!valid) return false

  // Mark used
  await supabase
    .from('otp_sessions')
    .update({ used: true })
    .eq('id', session.id)

  return true
}
