import type { Metadata } from 'next'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import ContactForm from './contact-form'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with THE AIRCONDITION SHOP. Call, email or visit us in Mosta, Malta.',
  alternates: { canonical: 'https://theairconditionshop.com/contact' },
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid lg:grid-cols-2 gap-14">
            {/* Left */}
            <div>
              <p className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2">Get in Touch</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-5">Contact Us</h1>
              <p className="text-slate-500 leading-relaxed mb-10">
                Have a question about a product, want to book a service, or need expert advice?
                Our team is here to help.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Phone</p>
                    <a href="tel:+35679661889" className="text-sky-600 hover:underline">+356 7966 1889</a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Email</p>
                    <a href="mailto:support@theairconditionshop.com" className="text-sky-600 hover:underline">support@theairconditionshop.com</a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Address</p>
                    <p className="text-slate-500 text-sm">220 Vjal L-Indipendenza<br />Mosta MST 9022, Malta</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Opening Hours</p>
                    <p className="text-slate-500 text-sm">Mon–Fri: 08:00–18:00<br />Sat: 09:00–13:00<br />Sun: Closed</p>
                  </div>
                </div>
              </div>

              {/* Map embed placeholder */}
              <div className="mt-8 rounded-2xl overflow-hidden border border-slate-100 h-48 bg-slate-50 flex items-center justify-center">
                <a href="https://maps.google.com/?q=220+Vjal+L-Indipendenza+Mosta+Malta"
                  target="_blank" rel="noopener noreferrer"
                  className="text-sm text-sky-600 hover:underline flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> View on Google Maps
                </a>
              </div>
            </div>

            {/* Right — form */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Send us a message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
