'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/primitives'
import type { Faq } from '@/types/database'

export default function FaqSection({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const reduce = useReducedMotion()
  if (!faqs.length) return null

  return (
    <section className="py-20 lg:py-28 bg-white border-t border-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <Reveal mode="up">
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.28em] mb-4">Common Questions</p>
          </Reveal>
          <Reveal mode="blur" delay={0.05}>
            <h2 className="font-display text-4xl lg:text-5xl leading-[1.02] tracking-[-0.02em] text-slate-900 max-w-xl mx-auto">
              Everything you need to know.
            </h2>
          </Reveal>
        </div>

        {/* Unified spec-sheet list — hairline-divided rows */}
        <Stagger className="border border-slate-200 divide-y divide-slate-200" gap={0.06}>
          {faqs.map((faq, i) => {
            const isOpen = open === faq.id
            return (
              <StaggerItem key={faq.id}>
                <div className="group relative bg-white">
                  {/* Left accent bar — grows when open */}
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-600 origin-top transition-transform duration-300 ease-out"
                    style={{ transform: isOpen ? 'scaleY(1)' : 'scaleY(0)' }}
                  />
                  <button
                    onClick={() => setOpen(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${faq.id}`}
                    id={`faq-question-${faq.id}`}
                    className="w-full flex items-center gap-5 px-6 py-6 text-left min-h-[64px] hover:bg-slate-50/70 transition-colors duration-200"
                  >
                    <span className="font-display text-lg text-slate-300 group-hover:text-blue-400 transition-colors duration-300 tabular-nums shrink-0 w-10">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 font-semibold text-slate-900 text-[15px] sm:text-base leading-snug">
                      {faq.question}
                    </span>
                    <span
                      className="shrink-0 w-8 h-8 flex items-center justify-center border border-slate-200 group-hover:border-blue-600 transition-all duration-300"
                      style={{ borderRadius: 2, transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 transition-colors duration-300" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        id={`faq-panel-${faq.id}`}
                        role="region"
                        aria-labelledby={`faq-question-${faq.id}`}
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={reduce ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pl-[3.75rem] pr-16 pb-6 text-sm text-slate-500 leading-relaxed max-w-xl">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
