import type { Metadata } from 'next'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import BtuCalculatorForm from './btu-calculator-form'

export const metadata: Metadata = {
  title: 'BTU Calculator',
  description: 'Calculate the BTU / kW capacity you need for your air conditioner — free tool for Malta homes and businesses.',
  alternates: { canonical: 'https://theairconditionshop.com/btu-calculator' },
}

export default function BtuCalculatorPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2">Free Tool</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Not sure what size air conditioner you need?</h1>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
              Tell us your room size and we&apos;ll recommend the right cooling capacity in seconds.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <BtuCalculatorForm />
          </div>
          <div className="mt-8 p-5 bg-amber-50 border border-amber-100 rounded-2xl text-sm text-amber-800">
            <strong>Disclaimer:</strong> This calculator provides estimates based on general guidelines.
            For an accurate assessment, we recommend a free site survey by one of our engineers.{' '}
            <a href="/contact" className="text-sky-600 hover:underline">Contact us</a> to book one.
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
