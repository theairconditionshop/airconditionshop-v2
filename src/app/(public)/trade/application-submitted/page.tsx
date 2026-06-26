import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2, Clock, Mail, Phone, ArrowRight, Home, Package,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Application Submitted — Trade Programme',
  description: 'Your Trade Account application has been received. We will be in touch within 1–2 business days.',
  robots: { index: false, follow: false },
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-slate-800 text-right">{value}</span>
    </div>
  )
}

export default async function ApplicationSubmittedPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; name?: string; company?: string; submitted?: string }>
}) {
  const params = await searchParams

  const email     = params.email   ? decodeURIComponent(params.email)   : null
  const name      = params.name    ? decodeURIComponent(params.name)    : null
  const company   = params.company ? decodeURIComponent(params.company) : null
  const submitted = params.submitted
    ? new Date(decodeURIComponent(params.submitted)).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : new Date().toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8FAFC] pt-16">

        {/* ── Centred card layout ── */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-16">

          {/* Success illustration */}
          <div className="relative mb-8 flex items-center justify-center">
            {/* Glow ring */}
            <div
              aria-hidden="true"
              className="absolute w-28 h-28 rounded-full bg-green-100 blur-2xl opacity-80"
            />
            {/* Outer ring */}
            <div className="relative w-20 h-20 rounded-full bg-white border border-green-100 shadow-xl shadow-green-100/50 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-10 max-w-lg">
            <p className="text-[11px] font-bold text-green-600 uppercase tracking-[0.28em] mb-3">
              Received
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4">
              Application Submitted{name ? `,` : ''}{name ? <><br /><span className="text-slate-500 font-medium">{name.split(' ')[0]}</span></> : ''}
            </h1>
            <p className="text-base text-slate-500 leading-relaxed">
              Thank you for applying to join the{' '}
              <span className="font-semibold text-slate-700">THE AIRCONDITION SHOP</span>{' '}
              Trade Programme.{company ? ` We have received your application for ${company}.` : ' Our team has received your application.'}
            </p>
          </div>

          {/* Timeline step cards */}
          <div className="w-full max-w-sm mb-8">
            <div className="flex flex-col gap-0">
              {[
                { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', label: 'Application received', sub: submitted, done: true },
                { icon: Clock,        color: 'text-amber-500', bg: 'bg-amber-50',  label: 'Under review',         sub: 'Our team will verify your business details', done: false },
                { icon: Mail,         color: 'text-blue-500',  bg: 'bg-blue-50',   label: 'Decision by email',    sub: 'Expected within 1–2 business days',          done: false },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                        <Icon className={`w-4 h-4 ${item.color}`} aria-hidden="true" />
                      </div>
                      {i < 2 && <div className={`w-px flex-1 min-h-[20px] my-1 ${item.done ? 'bg-green-200' : 'bg-slate-100'}`} />}
                    </div>
                    {/* Content */}
                    <div className="pb-5 pt-1.5 min-w-0">
                      <p className={`text-sm font-semibold ${item.done ? 'text-slate-900' : 'text-slate-500'}`}>{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.sub}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Status card */}
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-100 shadow-sm mb-8 overflow-hidden">
            {/* Card header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900">Application Status</p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
                Pending Review
              </span>
            </div>

            {/* Card rows */}
            <div className="px-5">
              <InfoRow label="Submitted" value={submitted} />
              {email   && <InfoRow label="Registered email" value={email} />}
              {company && <InfoRow label="Company"          value={company} />}
              <InfoRow label="Expected response" value="1–2 business days" />
            </div>
          </div>

          {/* Need help */}
          <div className="w-full max-w-sm bg-slate-900 rounded-2xl px-6 py-5 mb-8 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Need Help?</p>
            <a
              href="mailto:support@theairconditionshop.com"
              className="flex items-center justify-center gap-2 text-sm font-medium text-white hover:text-blue-300 transition-colors mb-2"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              support@theairconditionshop.com
            </a>
            <a
              href="tel:+35679661889"
              className="flex items-center justify-center gap-2 text-sm font-medium text-white hover:text-blue-300 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              +356 7966 1889
            </a>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <Link href="/products" className="flex-1">
              <Button variant="brand" size="lg" className="w-full gap-2">
                <Package className="w-4 h-4" aria-hidden="true" />
                Browse Products
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" size="lg" className="w-full gap-2">
                <Home className="w-4 h-4" aria-hidden="true" />
                Return Home
              </Button>
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
