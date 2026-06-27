-- ============================================================
-- Migration 008: Admin email migration
-- Change admin login from support@theairconditionshop.com
-- to sales@asgroupmalta.com
--
-- Context:
--   support@theairconditionshop.com remains the Resend FROM/
--   REPLY_TO address for all outgoing transactional email.
--   sales@asgroupmalta.com becomes the admin Supabase auth
--   login and the destination for admin OTP codes.
--
-- Conflict resolution:
--   An existing trade account (role=trade, "Demo name") was
--   registered at sales@asgroupmalta.com on 2026-06-26.
--   It had one trade_application (id=bed18a55, status=suspended)
--   and no other associated data.
--   Step 1: detach that trade application (set user_id = NULL)
--   Step 2: delete the trade profile + auth user
--   Step 3: update the super_admin account email
-- ============================================================

-- Step 1: Detach the trade application so the account can be deleted.
-- The application record is preserved with user_id = NULL.
UPDATE public.trade_applications
SET user_id = NULL
WHERE user_id = 'c6661e20-4d96-4d01-8add-f250284feeec';

-- Step 2a: Delete any lingering OTP sessions for the trade account.
DELETE FROM public.otp_sessions
WHERE user_id = 'c6661e20-4d96-4d01-8add-f250284feeec';

-- Step 2b: Delete the public profile for the trade account.
DELETE FROM public.profiles
WHERE id = 'c6661e20-4d96-4d01-8add-f250284feeec';

-- Step 2c: Delete the auth user for the trade account.
-- This frees the email sales@asgroupmalta.com for the admin account.
DELETE FROM auth.users
WHERE id = 'c6661e20-4d96-4d01-8add-f250284feeec';

-- Step 3a: Update the admin auth.users email.
-- Clears any in-flight email-change tokens to keep auth state clean.
UPDATE auth.users
SET
  email                       = 'sales@asgroupmalta.com',
  email_confirmed_at          = NOW(),
  email_change                = '',
  email_change_token_new      = '',
  email_change_confirm_status = 0,
  updated_at                  = NOW()
WHERE id = '7ee8610d-f0f4-44d4-bfb1-0eeece450253';

-- Step 3b: Update the public profile email.
-- full_name, role, phone, company, and all other columns unchanged.
UPDATE public.profiles
SET
  email      = 'sales@asgroupmalta.com',
  updated_at = NOW()
WHERE id = '7ee8610d-f0f4-44d4-bfb1-0eeece450253';
