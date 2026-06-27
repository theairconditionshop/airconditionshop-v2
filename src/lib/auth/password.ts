/**
 * Single source of truth for password policy.
 *
 * Imported by:
 *   - Server API routes (trade/register, auth/set-password)
 *   - Client form Zod schemas (trade-register-form, reset-password)
 *   - UI components (PasswordField StrengthMeter / RequirementsList)
 *
 * No 'use client' — safe for both environments.
 */

import { z } from 'zod'

// ─── Zod schema ───────────────────────────────────────────────────────────────

/**
 * Full password policy enforced server-side and client-side.
 * Rules: 8–128 chars, uppercase, lowercase, digit, special character.
 */
export const passwordSchema = z
  .string()
  .min(8,   'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/,        'Must include an uppercase letter (A–Z)')
  .regex(/[a-z]/,        'Must include a lowercase letter (a–z)')
  .regex(/[0-9]/,        'Must include a number (0–9)')
  .regex(/[^A-Za-z0-9]/, 'Must include a special character')

// ─── Requirements checker (mirrors the Zod rules exactly) ─────────────────────

export interface PasswordRequirements {
  length:    boolean
  uppercase: boolean
  lowercase: boolean
  number:    boolean
  special:   boolean
}

/** Returns which requirements the current value satisfies. */
export function getPasswordRequirements(value: string): PasswordRequirements {
  return {
    length:    value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number:    /[0-9]/.test(value),
    special:   /[^A-Za-z0-9]/.test(value),
  }
}

/** True only when every requirement is satisfied. */
export function meetsAllRequirements(value: string): boolean {
  const r = getPasswordRequirements(value)
  return r.length && r.uppercase && r.lowercase && r.number && r.special
}
