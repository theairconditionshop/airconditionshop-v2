'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import type { Faq } from '@/types/database'

export default function FaqSection({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<string | null>(null)
  if (!faqs.length) return null

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2">FAQ</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map(faq => (
            <div
              key={faq.id}
              className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:border-sky-200 transition-colors duration-200"
            >
              <button
                onClick={() => setOpen(open === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-slate-900 text-sm pr-4">{faq.question}</span>
                <span className="shrink-0 w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center">
                  {open === faq.id
                    ? <Minus className="w-3.5 h-3.5 text-sky-600" />
                    : <Plus className="w-3.5 h-3.5 text-sky-600" />
                  }
                </span>
              </button>

              <AnimatePresence initial={false}>
                {open === faq.id && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
