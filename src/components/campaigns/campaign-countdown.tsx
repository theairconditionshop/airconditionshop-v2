'use client'

import { useState, useEffect, useRef } from 'react'

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number }

function calcTimeLeft(endDate: string): TimeLeft | null {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

interface Props { endDate: string | null; onExpired?: () => void }

export default function CampaignCountdown({ endDate, onExpired }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(
    endDate ? calcTimeLeft(endDate) : null
  )
  const hasFiredRef = useRef(false)

  useEffect(() => {
    if (!endDate) return
    const tick = () => {
      const t = calcTimeLeft(endDate)
      setTimeLeft(t)
      if (!t && !hasFiredRef.current) {
        hasFiredRef.current = true
        onExpired?.()
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endDate, onExpired])

  if (!endDate) return null

  if (!timeLeft) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-700/40 px-8 py-10">
        <p className="text-slate-400 text-base sm:text-lg font-medium tracking-widest uppercase">
          This Campaign Has Ended
        </p>
      </div>
    )
  }

  const units = [
    { label: 'DAYS',    value: timeLeft.days },
    { label: 'HOURS',   value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds },
  ]

  return (
    <div className="inline-flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-700/40 px-6 py-8 shadow-xl shadow-black/40">
      <div className="flex items-center gap-1 sm:gap-2">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-center gap-1 sm:gap-2">
            {/* Time box */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shadow-lg shadow-black/30">
                <span
                  className="text-3xl sm:text-4xl font-black tabular-nums leading-none text-sky-400"
                  style={{ textShadow: '0 0 16px rgba(56,189,248,0.5), 0 0 4px rgba(56,189,248,0.3)' }}
                >
                  {String(u.value).padStart(2, '0')}
                </span>
              </div>
              <span className="mt-2 text-[9px] sm:text-[10px] font-semibold text-slate-500 tracking-[0.2em]">
                {u.label}
              </span>
            </div>

            {/* Separator dots */}
            {i < units.length - 1 && (
              <div className="flex flex-col gap-1.5 mb-5">
                <span
                  className="block w-1.5 h-1.5 rounded-full bg-sky-400/60"
                  style={{ boxShadow: '0 0 6px rgba(56,189,248,0.5)' }}
                />
                <span
                  className="block w-1.5 h-1.5 rounded-full bg-sky-400/60"
                  style={{ boxShadow: '0 0 6px rgba(56,189,248,0.5)' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
