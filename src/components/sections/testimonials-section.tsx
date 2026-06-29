import { Star } from 'lucide-react'
import type { Testimonial } from '@/types/database'

const AVATAR_COLORS = [
  'from-blue-600 to-blue-800',
  'from-slate-600 to-slate-800',
  'from-indigo-600 to-indigo-800',
]

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null

  const avgRating = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
  const displayRating = avgRating.toFixed(1)

  return (
    <section className="py-10 lg:py-16 bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-3">Verified Customer Reviews</p>
            <h2 className="font-display text-3xl lg:text-4xl text-slate-900 leading-tight">What Customers in Malta Say About Us</h2>
          </div>
          {/* Aggregate rating badge — calculated from actual ratings */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-900">{displayRating}</span>
            <span className="text-sm text-slate-400">· {testimonials.length} {testimonials.length === 1 ? 'review' : 'reviews'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
