import type { Metadata } from 'next'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import TradeRegisterForm from './trade-register-form'

export const metadata: Metadata = {
  title: 'Trade Account Application',
  description: 'Apply for a trade account to unlock exclusive pricing and benefits.',
  alternates: { canonical: 'https://theairconditionshop.com/trade/register' },
}

export default function TradeRegisterPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2">Trade Programme</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Trade Account Application</h1>
            <p className="mt-3 text-slate-500">Applications are reviewed within 2 business days.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <TradeRegisterForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
