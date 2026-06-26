-- ============================================================
-- EMAIL OTPs TABLE
-- Migration 007
--
-- Stores bcrypt-hashed OTPs for flows that do not require an
-- existing user account:
--   • trade_registration — email ownership verification before
--     a new trade account is created
--   • password_reset     — OTP-based password recovery
--
-- These are keyed by (email, purpose) rather than by user_id
-- so they work before an account exists.
-- ============================================================

CREATE TABLE IF NOT EXISTS email_otps (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL,
  purpose       TEXT        NOT NULL CHECK (purpose IN ('trade_registration', 'password_reset')),
  otp_hash      TEXT        NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  used          BOOLEAN     NOT NULL DEFAULT FALSE,
  attempt_count INTEGER     NOT NULL DEFAULT 0,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup by (email, purpose, used) — the pattern every verify call uses.
CREATE INDEX IF NOT EXISTS email_otps_lookup_idx
  ON email_otps (email, purpose, used, created_at DESC);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE email_otps ENABLE ROW LEVEL SECURITY;

-- Only service-role (admin client) may read or write this table.
-- No public or authenticated-user access — OTP operations are
-- always server-side via the admin client.
CREATE POLICY "email_otps_admin_only" ON email_otps
  FOR ALL
  USING (FALSE);   -- deny all by default; service role bypasses RLS entirely

-- ── Auto-cleanup ─────────────────────────────────────────────────────────────
-- Purge rows that are older than 24 hours to prevent unbounded table growth.
-- This is a best-effort cleanup; expired rows are already inert because
-- verifyEmailOtp checks expires_at before accepting a code.
CREATE OR REPLACE FUNCTION cleanup_expired_email_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM email_otps
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;
