'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import type { Testimonial } from '@/types/database'

const AVATAR_COLORS = [
  'from-blue-600 to-blue-800',
  'from-slate-600 to-slate-800',
  'from-indigo-600 to-indigo-800',
]

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null

  return (
    <section className="py-14 lg:py-20 bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">Customer Reviews</p>
            <h2 className="font-display text-3xl lg:text-4xl text-slate-900 leading-tight">What Our Customers Say</h2>
          </div>
          {/* Aggregate rating badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-900">5.0</span>
            <span className="text-sm text-slate-400">· {testimonials.length} reviews</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative bg-white rounded-2xl p-7 border border-slate-100 hover:border-slate-200 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 cursor-default flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Review text */}
              <p className="text-slate-700 leading-relaxed text-[15px] flex-1 mb-6">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Reviewer */}
              <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{t.name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {[t.title, t.company].filter(Boolean).join(', ') || 'Malta'}
                  </p>
                </div>
                {/* Verified badge */}
                <div className="ml-auto shrink-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
