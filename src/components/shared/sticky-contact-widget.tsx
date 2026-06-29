'use client'

import { useState, useEffect } from 'react'
import { Phone, MessageCircle, X, ChevronUp, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StickyContactWidget() {
  const [visible, setVisible]   = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismiss] = useState(false)

  useEffect(() => {
    // Show after 8 seconds or 40% scroll, whichever first
    const timer = setTimeout(() => {
      if (!dismissed) setVisible(true)
    }, 8000)

    function onScroll() {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      if (pct > 0.4 && !dismissed) setVisible(true)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [dismissed])

  if (dismissed || !visible) return null

  return (
    // Only visible on desktop (lg+). Mobile uses the sticky CTA bar.
    <div className="hidden lg:block fixed bottom-6 right-6 z-50">
      {/* Expanded panel */}
      <div
        className={cn(
          'absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300',
          expanded ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none',
        )}
      >
        {/* Header */}
        <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Get Expert Advice</p>
            <p className="text-xs text-slate-400">Available Mon–Sat</p>
          </div>
          <button
            onClick={() => setExpanded(false)}
            aria-label="Close contact panel"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2.5">
          <a
            href="tel:+35679661889"
            className="flex items-center gap-3 p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Call Us</p>
              <p className="text-xs text-blue-200">+356 7966 1889</p>
            </div>
          </a>

          <a
            href="https://wa.me/35679661889"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">WhatsApp</p>
              <p className="text-xs text-emerald-200">Quick response</p>
            </div>
          </a>

          <a
            href="/contact"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Send a Message</p>
              <p className="text-xs text-slate-500">Reply within 2 hours</p>
            </div>
          </a>
        </div>

        {/* Trust line */}
        <div className="px-4 pb-4">
          <p className="text-[11px] text-slate-400 text-center">F-Gas certified · Malta-based · Free advice</p>
        </div>
      </div>

      {/* FAB button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDismiss(true)}
          aria-label="Dismiss contact widget"
          className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setExpanded(v => !v)}
          aria-label="Contact us"
          aria-expanded={expanded}
          className={cn(
            'w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 cursor-pointer',
            expanded
              ? 'bg-slate-800 text-white rotate-180'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105',
          )}
        >
          {expanded
            ? <ChevronUp className="w-5 h-5" />
            : <Phone className="w-5 h-5" />
          }
        </button>
      </div>
    </div>
  )
}
