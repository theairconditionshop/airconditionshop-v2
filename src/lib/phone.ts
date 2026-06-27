/**
 * Malta phone number utilities.
 *
 * All Maltese numbers are exactly 8 digits with country code +356.
 * Canonical storage format: +356XXXXXXXX (no spaces, no separators).
 *
 * normalizePhone  — accepts any messy user input, returns canonical form
 *                   or null if the digits after stripping the prefix are
 *                   not exactly 8.
 *
 * parseLocalDigits — strips +356 / 00356 / 356 prefix from any stored
 *                    value and returns the bare 8-digit local portion for
 *                    display in the fixed-prefix input.
 *
 * phoneZodField   — ready-made Zod schema for required phone fields in
 *                   API routes. Accepts the canonical +356XXXXXXXX format
 *                   only. Pair with normalizePhone() before validation.
 *
 * optionalPhoneZodField — same but the field is optional / empty-string allowed.
 */

export const MALTA_PREFIX = '+356'

/**
 * Converts any reasonably-formatted Maltese number to +356XXXXXXXX.
 * Returns null if the local portion is not exactly 8 digits after stripping.
 *
 * Handles:
 *   +356 7966 1889   → +35679661889
 *   +35679661889     → +35679661889
 *   00356 7966 1889  → +35679661889
 *   356 79661889     → +35679661889
 *   79661889         → +35679661889
 *   +356+356...      → null (duplicate prefix stripped, re-evaluated)
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null

  // Collapse all whitespace and common separators
  let s = raw.replace(/[\s\-().]/g, '')

  // Strip duplicate/stacked prefixes first (+356+356, +35600356, etc.)
  // Repeat up to 3 times to handle pathological stacking
  for (let i = 0; i < 3; i++) {
    const before = s
    s = s
      .replace(/^\+356\+356/, '+356')
      .replace(/^\+35600356/, '+356')
      .replace(/^\+356356/, '+356')
    if (s === before) break
  }

  // Normalise common prefix variants to +356
  if (s.startsWith('+356')) {
    // already correct prefix — leave it
  } else if (s.startsWith('00356')) {
    s = '+356' + s.slice(5)
  } else if (s.startsWith('356') && s.length === 11) {
    // 356XXXXXXXX — bare country code without + or 00
    s = '+356' + s.slice(3)
  } else {
    // No recognised prefix — treat as local digits only
    s = '+356' + s
  }

  // Extract local portion
  const local = s.slice(4) // everything after +356

  // Must be exactly 8 digits
  if (!/^\d{8}$/.test(local)) return null

  return '+356' + local
}

/**
 * Returns the bare 8-digit local portion of a stored phone number for
 * display inside the fixed-prefix input. Always strips +356 / 00356 / 356.
 * Returns empty string for null/undefined/malformed values.
 */
export function parseLocalDigits(stored: string | null | undefined): string {
  if (!stored) return ''
  const normalized = normalizePhone(stored)
  if (!normalized) return ''
  return normalized.slice(4) // drop "+356"
}

import { z } from 'zod'

const PHONE_REGEX = /^\+356\d{8}$/

/** Zod schema for a required Malta phone field in API routes. */
export const phoneZodField = z
  .string()
  .regex(PHONE_REGEX, 'Phone must be a valid Malta number (+356 followed by 8 digits)')

/**
 * Zod schema for an optional Malta phone field.
 * Accepts empty string or undefined (no phone given) OR a canonical +356XXXXXXXX.
 * Uses refine rather than transform so the input/output types stay identical —
 * this keeps react-hook-form's TFieldValues consistent with zodResolver.
 */
export const optionalPhoneZodField = z
  .string()
  .optional()
  .refine(
    v => !v || PHONE_REGEX.test(v),
    'Phone must be a valid Malta number (+356 followed by 8 digits)',
  )
