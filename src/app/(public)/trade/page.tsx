import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Percent, Phone, Package, Users, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Trade Account',
  description: 'Apply for a trade account and access exclusive trade pricing on HVAC and refrigeration products.',
  alternates: { canonical: 'https://theairconditionshop.com/trade' },
}

const BENEFITS = [
  { icon: Percent,  title: 'Exclusive Trade Pricing',  desc: 'Access to trade-only pricing across our full product range.' },
  { icon: Package,  title: 'Priority Stock Availability', desc: 'Pre-order and reserve stock before it goes to retail.' },
  { icon: Phone,    title: 'Dedicated Trade Support',  desc: 'Direct line to our technical and commercial team.' },
  { icon: Users,    title: 'Project Management',       desc: 'Support for large multi-site or commercial projects.' },
]

const ELIGIBLE = [
  'Registered HVAC installers',
  'Refrigeration engineers',
  'Electrical contractors',
  'Facilities management companies',
  'Hotels and hospitality groups',
  'Construction & development companies',
]

export default function TradePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        {/* Hero */}
        <section className="bg-slate-900 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-3">Trade Programme</p>
            <h1 className="text-4xl lg:text-5xl font-bold mb-5">Built for the Trade</h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
              Join Malta&apos;s trusted HVAC trade network. Get exclusive pricing, priority support,
              and a dedicated account manager for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/trade/register">
                <Button variant="brand" size="lg">Apply Now <ArrowRight className="w-4 h-4 ml-1" /></Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">Talk to Us</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Trade Account Benefits</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-6 rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-sky-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Eligibility + CTA */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-6">Who can apply?</h2>
              <div className="space-y-3">
                {ELIGIBLE.map(e => (
                  <div key={e} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" />
                    <span className="text-slate-700">{e}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-slate-500">
                Applications are reviewed within 2 business days. You&apos;ll need a valid VAT number or business registration.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-3">Ready to apply?</h3>
              <p className="text-slate-500 mb-6">The application takes under 5 minutes. Once approved, trade pricing is activated instantly.</p>
              <Link href="/trade/register" className="block">
                <Button variant="brand" size="lg" className="w-full">Start Application <ArrowRight className="w-4 h-4 ml-1" /></Button>
              </Link>
              <p className="mt-4 text-sm text-slate-400">Already approved? <Link href="/login" className="text-sky-600 hover:underline">Sign in</Link></p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
