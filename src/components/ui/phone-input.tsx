'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { parseLocalDigits, normalizePhone, MALTA_PREFIX } from '@/lib/phone'

export interface PhoneInputProps {
  /** react-hook-form or native onChange — receives the canonical +356XXXXXXXX value */
  onChange?: (value: string) => void
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  /** Canonical stored value (+356XXXXXXXX) or any legacy format — normalized on mount */
  value?: string
  name?: string
  label?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  id?: string
  className?: string
}

/**
 * Malta phone input with a fixed, non-editable +356 prefix.
 * - Users type only the 8 local digits.
 * - Strips spaces and non-digits automatically as the user types.
 * - Rejects input beyond 8 digits.
 * - Calls onChange with the canonical +356XXXXXXXX value (or empty string).
 * - Normalizes any legacy format (00356, 356, +356+356…) on initial render.
 * - Works with react-hook-form via Controller or manual setValue.
 */
const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ onChange, onBlur, value, name, label, error, hint, required, disabled, id, className }, ref) => {
    const inputId = id || name || 'phone'

    // Derive the visible local digits from whatever format is stored
    const [local, setLocal] = React.useState<string>(() => parseLocalDigits(value))

    // Sync when the controlled value changes externally (e.g. form reset)
    React.useEffect(() => {
      setLocal(parseLocalDigits(value))
    }, [value])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      // Strip everything that isn't a digit, then cap at 8 characters
      const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
      setLocal(digits)

      // Emit canonical value upward: full number if 8 digits, empty string otherwise
      const canonical = digits.length === 8 ? `${MALTA_PREFIX}${digits}` : ''
      onChange?.(canonical)
    }

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div className={cn(
          'flex h-12 w-full rounded-lg border border-slate-200 bg-white overflow-hidden',
          'transition-colors duration-150',
          'focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500',
          disabled && 'cursor-not-allowed bg-slate-50 opacity-60',
          error && 'border-red-400 focus-within:ring-red-400 focus-within:border-red-400',
          className,
        )}>
          {/* Fixed, non-editable prefix */}
          <span
            aria-hidden="true"
            className={cn(
              'flex items-center pl-3 pr-2 text-sm font-medium select-none shrink-0',
              'text-slate-500 border-r border-slate-200',
              error && 'border-red-200',
            )}
          >
            {MALTA_PREFIX}
          </span>

          {/* User types only the 8 local digits here */}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="7966 1889"
            maxLength={8}
            disabled={disabled}
            value={local}
            onChange={handleChange}
            onBlur={onBlur}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={cn(
              'flex-1 min-w-0 bg-transparent px-3 text-sm text-slate-900',
              'placeholder:text-slate-400 focus:outline-none',
              'disabled:cursor-not-allowed',
            )}
          />

          {/* Digit counter — helps user know how many digits they've entered */}
          {!disabled && (
            <span
              aria-hidden="true"
              className="flex items-center pr-3 text-xs text-slate-400 shrink-0 tabular-nums"
            >
              {local.length}/8
            </span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-red-500">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-slate-400">
            {hint}
          </p>
        )}
      </div>
    )
  },
)
PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }
