import Link from 'next/link'
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TradePricingCtaProps {
  /** card — compact line for product cards
   *  panel — inline box on product detail page
   *  premium — full dark section at bottom of product page */
  variant?: 'card' | 'panel' | 'premium'
}

export default function TradePricingCta({ variant = 'panel' }: TradePricingCtaProps) {
  if (variant === 'card') {
    return (
      <div className="flex items-center gap-1.5 mt-0.5">
        <Lock aria-hidden="true" className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-xs text-slate-400 font-medium">Trade pricing</span>
      </div>
    )
  }

  if (variant === 'panel') {
    return (
      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <Lock aria-hidden="true" className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-blue-900">Trade Pricing Available</p>
        </div>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          This product is available for approved HVAC installers and trade professionals.
          Prices are visible after account approval.
        </p>
        <div className="space-y-1.5 mb-5">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 aria-hidden="true" className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            Apply for a Trade Account
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 aria-hidden="true" className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            Already have an account? Log in below
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Link href="/trade" className="flex-1">
            <Button variant="brand" size="sm" className="w-full gap-1.5">
              Apply for Trade Account <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href="/login" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Trade Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // premium — standalone dark section
  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-8 text-white">
      <p className="text-xs font-semibold tracking-[0.18em] text-blue-400 uppercase mb-2">
        Trade Programme
      </p>
      <h2 className="text-2xl font-bold text-white mb-2">Need Trade Pricing?</h2>
      <p className="text-blue-200 text-sm mb-7 leading-relaxed">
        Join Malta&apos;s professional HVAC installer network. Approved trade accounts get
        exclusive pricing, bulk discounts, and priority support.
      </p>
      <ul className="space-y-3 mb-8">
        {[
          'Exclusive installer pricing on all materials',
          'Volume and bulk order discounts',
          'Priority stock allocation',
          'Dedicated trade support line',
        ].map(benefit => (
          <li key={benefit} className="flex items-center gap-3 text-sm text-blue-100">
            <CheckCircle2 aria-hidden="true" className="w-4 h-4 text-blue-400 shrink-0" />
            {benefit}
          </li>
        ))}
      </ul>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/trade">
          <Button variant="brand" size="lg" className="gap-2">
            Apply for Trade Account <ArrowRight aria-hidden="true" className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/login">
          <Button
            variant="outline"
            size="lg"
            className="border-white/20 text-white hover:bg-white/10 hover:text-white"
          >
            Trade Login
          </Button>
        </Link>
      </div>
    </div>
  )
}
