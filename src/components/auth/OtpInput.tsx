'use client'

import { useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react'

interface OtpInputProps {
  value:    string[]          // array of 6 single-char strings
  onChange: (v: string[]) => void
  error?:   boolean
  disabled?: boolean
  autoFocus?: boolean
}

export default function OtpInput({ value, onChange, error, disabled, autoFocus = true }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus()
  }, [autoFocus])

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1)
    const next = [...value]
    next[index] = digit
    onChange(next)
    if (digit && index < 5) {
      refs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (value[index]) {
        const next = [...value]
        next[index] = ''
        onChange(next)
      } else if (index > 0) {
        refs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      refs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = Array(6).fill('')
    pasted.split('').forEach((d, i) => { if (i < 6) next[i] = d })
    onChange(next)
    // Focus the next empty or the last filled input
    const focusIdx = Math.min(pasted.length, 5)
    refs.current[focusIdx]?.focus()
  }

  const base = [
    'w-12 h-14 rounded-xl border-2 text-center text-2xl font-bold',
    'transition-all duration-150 outline-none',
    'text-slate-900 bg-white',
    'focus:scale-105 focus:shadow-lg',
    disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-text',
  ].join(' ')

  const stateClass = (d: string) => {
    if (error) return 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
    if (d)     return 'border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
    return           'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
  }

  return (
    <div
      className="flex gap-2 sm:gap-3 justify-center"
      onPaste={handlePaste}
      role="group"
      aria-label="6-digit verification code"
    >
      {value.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={d}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          className={`${base} ${stateClass(d)}`}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={e => e.target.select()}
        />
      ))}
    </div>
  )
}
