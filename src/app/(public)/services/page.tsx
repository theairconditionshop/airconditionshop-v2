import type { Metadata } from 'next'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import ServiceRequestForm from './service-request-form'
import { Wrench, Calendar, Shield, Clock, CheckCircle2, ThumbsUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Professional HVAC installation, maintenance, and repair services across Malta.',
}

const SERVICES = [
  { icon: Wrench, title: 'Installation', desc: 'New AC and refrigeration equipment installed by certified technicians.' },
  { icon: Calendar, title: 'Maintenance', desc: 'Scheduled servicing to keep your system running at peak efficiency.' },
  { icon: Shield, title: 'Repair', desc: 'Fast diagnosis and repair of faults, including emergency call-outs.' },
  { icon: Clock, title: 'Emergency', desc: '24/7 emergency response for critical refrigeration and HVAC failures.' },
]

const FEATURES = [
  'Certified & insured technicians',
  'Same-day response for emergencies',
  'All major brands serviced',
  'Warranty on all parts & labour',
  'Free site survey for new installs',
  'Post-service report provided',
]

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        {/* Hero */}
        <section className="bg-slate-900 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-3">Professional Services</p>
            <h1 className="text-4xl lg:text-5xl font-bold mb-5">HVAC &amp; Refrigeration Services</h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Expert installation, maintenance, and repair for homes and businesses across Malta.
              Fast response, certified technicians, and guaranteed workmanship.
            </p>
          </div>
        </section>

        {/* Service types */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SERVICES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-sky-200 hover:bg-sky-50/30 transition-colors">
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

        {/* Why us + booking */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14">
            {/* Features */}
            <div>
              <p className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2">Why Choose Us</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-6">What sets us apart</h2>
              <div className="space-y-3">
                {FEATURES.map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" />
                    <span className="text-slate-700">{f}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-5 rounded-2xl bg-amber-50 border border-amber-100">
                <div className="flex items-start gap-3">
                  <ThumbsUp className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm mb-1">Service Guarantee</p>
                    <p className="text-sm text-slate-600">
                      All workmanship is guaranteed for 12 months. Parts carry the original manufacturer warranty.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Book a Service</h2>
              <p className="text-sm text-slate-500 mb-6">We&apos;ll confirm your appointment within 2 hours during business hours.</p>
              <ServiceRequestForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
