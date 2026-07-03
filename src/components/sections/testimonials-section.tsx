'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Star, ArrowLeft, ArrowRight, Quote } from 'lucide-react'
import { Reveal } from '@/components/motion/primitives'
import type { Testimonial } from '@/types/database'

const AVATAR_COLORS = ['from-blue-600 to-blue-800', 'from-slate-600 to-slate-800', 'from-indigo-600 to-indigo-800']
const AUTOPLAY_MS = 6500

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = testimonials.length
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const next = useCallback(() => setIndex(i => (i + 1) % count), [count])
  const prev = useCallback(() => setIndex(i => (i - 1 + count) % count), [count])

  // Autoplay — pauses on hover/focus, disabled entirely for reduced-motion
  useEffect(() => {
    if (reduce || paused || count <= 1) return
    timerRef.current = setInterval(next, AUTOPLAY_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [reduce, paused, count, next])

  if (!count) return null

  const avgRating = testimonials.reduce((sum, t) => sum + t.rating, 0) / count
  const t = testimonials[index]

  return (
    <section className="py-20 lg:py-28 bg-[#f8f9fa] border-t border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <Reveal mode="up">
              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.28em] mb-4">Verified Customer Reviews</p>
            </Reveal>
            <Reveal mode="blur" delay={0.05}>
              <h2 className="font-display text-4xl lg:text-5xl leading-[0.98] tracking-[-0.02em] text-slate-900 max-w-lg">
                What Malta says about us.
              </h2>
            </Reveal>
          </div>
          <Reveal mode="up" delay={0.1} className="flex items-center gap-3 shrink-0">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-900">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-slate-400">· {count} {count === 1 ? 'review' : 'reviews'}</span>
          </Reveal>
        </div>

        {/* Editorial quote stage */}
        <Reveal mode="up" delay={0.12}>
          <div
            className="relative border border-slate-200 bg-white"
            style={{ borderRadius: 2 }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <Quote aria-hidden className="absolute top-8 left-8 w-10 h-10 text-slate-100" strokeWidth={1.5} />

            <div className="relative min-h-[280px] sm:min-h-[240px] px-8 sm:px-16 py-14 sm:py-16" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={t.id}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -14 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex gap-0.5 mb-6">
                    {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="font-display text-2xl sm:text-3xl text-slate-900 leading-[1.35] max-w-3xl">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="mt-8 flex items-center gap-3">
                    <div className={`w-11 h-11 flex items-center justify-center bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]} text-white font-bold text-sm shrink-0`} style={{ borderRadius: 2 }}>
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{t.name}</p>
                      <p className="text-xs text-slate-400 truncate">{[t.title, t.company].filter(Boolean).join(', ') || 'Malta'}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls */}
            {count > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-8 py-4">
                <div className="flex items-center gap-2">
                  {testimonials.map((item, i) => (
                    <button
                      key={item.id}
                      onClick={() => setIndex(i)}
                      aria-label={`Show testimonial ${i + 1} of ${count}`}
                      aria-current={i === index}
                      className="group relative h-1.5 overflow-hidden bg-slate-200 transition-all duration-300"
                      style={{ borderRadius: 1, width: i === index ? 28 : 8 }}
                    >
                      {i === index && !reduce && !paused && (
                        <motion.span
                          key={`progress-${t.id}`}
                          className="absolute inset-y-0 left-0 bg-blue-600"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
                        />
                      )}
                      {i === index && (reduce || paused) && <span className="absolute inset-0 bg-blue-600" />}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={prev} aria-label="Previous testimonial" className="w-9 h-9 flex items-center justify-center border border-slate-200 hover:border-slate-900 transition-colors duration-300" style={{ borderRadius: 2 }}>
                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={next} aria-label="Next testimonial" className="w-9 h-9 flex items-center justify-center border border-slate-200 hover:border-slate-900 transition-colors duration-300" style={{ borderRadius: 2 }}>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
