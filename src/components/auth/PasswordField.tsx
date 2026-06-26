'use client'

import { useState, forwardRef } from 'react'
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'

// ─── Strength logic (shared) ──────────────────────────────────────────────────

export interface PasswordRequirements {
  length:    boolean
  uppercase: boolean
  lowercase: boolean
  number:    boolean
  special:   boolean
}

export function getPasswordRequirements(value: string): PasswordRequirements {
  return {
    length:    value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number:    /[0-9]/.test(value),
    special:   /[^A-Za-z0-9]/.test(value),
  }
}

interface StrengthInfo { label: string; color: string; textColor: string; segments: number }

function getStrength(value: string): StrengthInfo {
  if (!value) return { label: '', color: 'bg-slate-200', textColor: 'text-slate-400', segments: 0 }
  const r = getPasswordRequirements(value)
  const score = [r.length, r.uppercase, r.lowercase, r.number, r.special].filter(Boolean).length
  if (score <= 1) return { label: 'Weak',     color: 'bg-red-500',    textColor: 'text-red-500',    segments: 1 }
  if (score === 2) return { label: 'Fair',     color: 'bg-orange-400', textColor: 'text-orange-500', segments: 2 }
  if (score === 3) return { label: 'Good',     color: 'bg-yellow-400', textColor: 'text-yellow-600', segments: 3 }
  if (score === 4) return { label: 'Strong',   color: 'bg-blue-500',   textColor: 'text-blue-600',   segments: 4 }
  return             { label: 'Strongest', color: 'bg-green-500',  textColor: 'text-green-600',  segments: 5 }
}

// ─── Components ───────────────────────────────────────────────────────────────

interface StrengthMeterProps { value: string }

export function StrengthMeter({ value }: StrengthMeterProps) {
  const info = getStrength(value)
  if (!value) return null
  return (
    <div className="mt-2.5 space-y-1.5" aria-live="polite">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < info.segments ? info.color : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${info.textColor}`}>{info.label}</span>
        {info.segments === 5 && (
          <span className="text-xs text-green-600 font-medium">Highly secure</span>
        )}
      </div>
    </div>
  )
}

interface RequirementsListProps { value: string }

export function RequirementsList({ value }: RequirementsListProps) {
  if (!value) return null
  const r = getPasswordRequirements(value)
  const items: [boolean, string][] = [
    [r.length,    '8+ characters'],
    [r.uppercase, 'Uppercase letter (A–Z)'],
    [r.lowercase, 'Lowercase letter (a–z)'],
    [r.number,    'Number (0–9)'],
    [r.special,   'Special character (!@#$…)'],
  ]
  return (
    <div className="mt-2 rounded-xl bg-slate-50 border border-slate-100 p-3">
      <p className="text-xs font-semibold text-slate-500 mb-2">Password requirements</p>
      <ul className="space-y-1.5" aria-label="Password requirements">
        {items.map(([met, label]) => (
          <li key={label} className="flex items-center gap-2 text-xs">
            {met
              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" aria-hidden="true" />
              : <XCircle      className="w-3.5 h-3.5 text-slate-300 shrink-0" aria-hidden="true" />}
            <span className={met ? 'text-green-700' : 'text-slate-400'}>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── PasswordField ────────────────────────────────────────────────────────────

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label:        string
  error?:       string
  showStrength?: boolean
  showChecklist?: boolean
  value?:       string
}

const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, error, showStrength, showChecklist, value = '', className: _, ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="relative">
          <input
            ref={ref}
            type={visible ? 'text' : 'password'}
            value={value}
            aria-invalid={!!error}
            className={[
              'flex h-10 w-full rounded-lg border bg-white px-3 pr-10 py-2 text-sm text-slate-900',
              'transition-colors duration-150 focus:outline-none focus:ring-2',
              error
                ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500',
            ].join(' ')}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            {visible
              ? <EyeOff className="w-4 h-4" aria-hidden="true" />
              : <Eye    className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1" role="alert">
            <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> {error}
          </p>
        )}

        {showStrength  && <StrengthMeter value={value} />}
        {showChecklist && <RequirementsList value={value} />}
      </div>
    )
  },
)

PasswordField.displayName = 'PasswordField'
export default PasswordField
