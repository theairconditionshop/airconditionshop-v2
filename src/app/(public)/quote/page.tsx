import type { Metadata } from 'next'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import QuoteForm from './quote-form'

export const metadata: Metadata = {
  title: 'Request a Quote',
  description: 'Get a free quote for air conditioning installation, refrigeration or HVAC services in Malta.',
}

export default function QuotePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2">Free Quote</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Request a Quote</h1>
            <p className="mt-3 text-slate-500">Fill in the form below and we&apos;ll send you a detailed quote within 2 business days.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <QuoteForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
