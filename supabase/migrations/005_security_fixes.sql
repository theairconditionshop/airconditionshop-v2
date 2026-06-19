-- ============================================================
-- SECURITY FIXES
-- Migration 005
-- ============================================================

-- CRITICAL C1: Prevent role escalation through profiles_update_own.
-- The original policy had no WITH CHECK clause, so any user could update
-- their own role column to super_admin using the browser Supabase client.
-- Fix: require the new role value to match the current persisted role.
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- CRITICAL C4: Add attempt_count to otp_sessions for brute-force protection.
-- The application layer will increment this on each failed attempt and
-- invalidate the session after 5 failures.
ALTER TABLE otp_sessions
  ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0;
