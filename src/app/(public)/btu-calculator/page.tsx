import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import BtuCalculatorForm from './btu-calculator-form'
import { Info, Phone, Thermometer, Wind, Zap, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'BTU Calculator — Find the Right AC Size',
  description: 'Free BTU / kW calculator for Malta homes and businesses. Find the right air conditioner size for any room in seconds.',
  alternates: { canonical: 'https://www.theairconditionshop.com/btu-calculator' },
}

const TIPS = [
  { icon: Thermometer, title: 'Malta Climate Factor', desc: 'Malta\'s summer heat requires 10–15% extra capacity vs northern European guidelines.' },
  { icon: Wind,        title: 'Ceiling Height',        desc: 'High ceilings (>2.7m) increase required BTUs — the calculator accounts for this.' },
  { icon: Zap,         title: 'Room Occupancy',        desc: 'Each additional person generates ~400 BTU/h of heat. Add occupants for accuracy.' },
]

export default function BtuCalculatorPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 pt-20">

        {/* ── Dark intro strip ── */}
        <section className="bg-slate-950 pt-14 pb-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-[0.28em] mb-4">Free Tool</p>
              <h1 className="font-display text-4xl sm:text-5xl text-white leading-tight mb-5">
                Find the Right AC Size
                <br />
                <span className="text-blue-400 italic">in 30 seconds</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed">
                Too small and it runs non-stop. Too large and it short-cycles. Enter your room details for the correct BTU rating.
              </p>
            </div>
          </div>
        </section>

        {/* ── Main: tips + calculator ── */}
        <section className="bg-[#FAFAF9]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-[1fr_1.15fr] gap-12 items-start">

              {/* ── Left: tips & context ── */}
              <div>
                <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-[0.22em] mb-6">Sizing Tips for Malta</p>
                <div className="space-y-4 mb-10">
                  {TIPS.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm mb-1">{title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* BTU reference table */}
                <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden">
                  <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quick Reference Guide</p>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-3 sm:px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Room Size</th>
                        <th className="px-3 sm:px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">BTU</th>
                        <th className="px-3 sm:px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">kW</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[
                        { size: 'Up to 15 m²',  btu: '9,000 BTU',  kw: '2.5 kW' },
                        { size: '15–25 m²',      btu: '12,000 BTU', kw: '3.5 kW' },
                        { size: '25–35 m²',      btu: '18,000 BTU', kw: '5.0 kW' },
                        { size: '35–50 m²',      btu: '24,000 BTU', kw: '7.0 kW' },
                        { size: '50–80 m²',      btu: '36,000 BTU', kw: '10.5 kW' },
                      ].map(({ size, btu, kw }) => (
                        <tr key={size} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-3 sm:px-5 py-3 text-slate-700 font-medium text-sm">{size}</td>
                          <td className="px-3 sm:px-5 py-3 text-blue-600 font-semibold text-sm">{btu}</td>
                          <td className="px-3 sm:px-5 py-3 text-slate-500 text-sm">{kw}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100">
                    <p className="text-[11px] text-slate-400">Estimates for standard 2.5m ceiling height in Malta climate.</p>
                  </div>
                </div>

                {/* CTA to get expert advice */}
                <div className="mt-6 p-5 rounded-2xl bg-blue-600 text-white">
                  <p className="font-semibold text-sm mb-1">Not sure? Get a free expert opinion.</p>
                  <p className="text-sm text-blue-200 mb-4 leading-relaxed">
                    Our engineers visit your space and recommend the exact unit for your needs — free of charge.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/contact"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-blue-700 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors duration-150">
                      Book Site Survey <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <a href="tel:+35679661889"
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-white/30 text-white text-sm font-semibold rounded-xl hover:bg-white/10 transition-colors duration-150">
                      <Phone className="w-3.5 h-3.5" /> Call Us
                    </a>
                  </div>
                </div>
              </div>

              {/* ── Right: calculator ── */}
              <div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_40px_-12px_rgba(0,0,0,0.08)] p-8">
                  <h2 className="font-display text-2xl text-slate-900 mb-1">BTU / kW Calculator</h2>
                  <p className="text-sm text-slate-500 mb-7">
                    Calibrated for Malta&apos;s climate — results include a 12% heat load buffer.
                  </p>
                  <BtuCalculatorForm />
                </div>

                {/* Disclaimer */}
                <div className="mt-5 flex gap-3 p-5 rounded-xl bg-amber-50 border border-amber-100">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Estimates only.</strong> Actual requirements vary by insulation, glazing, sun exposure, and occupancy.
                    For guaranteed accuracy, book a{' '}
                    <Link href="/contact" className="text-amber-700 underline hover:text-amber-900">free site survey</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
