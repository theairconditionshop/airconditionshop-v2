'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  productId:   string
  productName: string
}

const DELAY_MS    = 3 * 60 * 1000  // 3 minutes
const DISMISS_KEY = 'tacs_quote_reminder_dismissed'

export default function QuoteReminder({ productId, productName }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem(DISMISS_KEY)) return

    const timer = setTimeout(() => setShow(true), DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    setShow(false)
    sessionStorage.setItem(DISMISS_KEY, '1')
  }

  return (
    <div
      aria-live="polite"
      className={cn(
        'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-md transition-all duration-500',
        show ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none',
      )}
    >
      <div className="bg-slate-900 text-white shadow-2xl px-5 py-4 flex items-start gap-4" style={{ borderRadius: 2 }}>
        <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5" style={{ borderRadius: 2 }}>
          <Clock className="w-5 h-5 text-blue-400" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-white">Still considering this product?</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            Request a free, no-obligation quote for the{' '}
            <span className="text-slate-200">{productName}</span> — our team responds within 2 hours.
          </p>
          <Link href={`/quote?product=${productId}`} onClick={dismiss}>
            <Button variant="brand" size="sm" className="mt-3 gap-1.5">
              Get a Free Quote <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss quote reminder"
          className="shrink-0 p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          style={{ borderRadius: 2 }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
