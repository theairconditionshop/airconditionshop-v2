'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import type { Testimonial } from '@/types/database'

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2">Customer Reviews</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">What Our Customers Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 bg-white rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-lg transition-all duration-300"
            >
              <Quote className="absolute top-5 right-5 w-8 h-8 text-sky-100" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-slate-700 leading-relaxed text-sm mb-5">&ldquo;{t.content}&rdquo;</p>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  {(t.title || t.company) && (
                    <p className="text-xs text-slate-400">
                      {[t.title, t.company].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
