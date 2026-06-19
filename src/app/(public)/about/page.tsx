import type { Metadata } from 'next'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MapPin, Phone, Mail, Users, Award, Package, Wrench } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about THE AIRCONDITION SHOP — Malta\'s specialist in HVAC, refrigeration and climate control.',
}

const STATS = [
  { icon: Users,   value: '1,000+', label: 'Happy customers' },
  { icon: Wrench,  value: '5,000+', label: 'Installations completed' },
  { icon: Package, value: '500+',   label: 'Products in stock' },
  { icon: Award,   value: '15+',    label: 'Years of experience' },
]

const TEAM_VALUES = [
  { title: 'Expert Knowledge', desc: 'Our team holds manufacturer certifications from Daikin, Mitsubishi Electric, Carrier, and more. We know the products we sell inside out.' },
  { title: 'Quality First',    desc: 'We only stock brands we trust. Every product is backed by manufacturer warranty and our own after-sales support.' },
  { title: 'Fast Response',    desc: 'Emergency call-outs answered within hours. Scheduled service confirmed the same business day.' },
  { title: 'Transparent Pricing', desc: 'No hidden fees. Clear trade and retail pricing. Honest quotes with no surprises.' },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        {/* Hero */}
        <section className="bg-slate-900 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-3">About Us</p>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 max-w-2xl">
              Malta&apos;s Specialist in HVAC &amp; Refrigeration
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
              THE AIRCONDITION SHOP has been serving homeowners, installers, and businesses across Malta
              for over 15 years. We supply, install, and service the full range of air conditioning,
              refrigeration, and climate control equipment.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center p-6 rounded-2xl border border-slate-100 bg-slate-50">
                <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-sky-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-start">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-5">Our Story</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Founded in Mosta, Malta, THE AIRCONDITION SHOP started as a small specialist supplier
                  to the local HVAC trade. Over the years we&apos;ve grown into a full-service operation —
                  supplying products to retail and trade customers, running our own installation teams,
                  and providing maintenance contracts across residential and commercial properties.
                </p>
                <p>
                  We&apos;re authorised dealers for all the major brands including Daikin, Mitsubishi Electric,
                  Carrier, Panasonic, LG, and Toshiba. Our product range covers domestic split systems,
                  multi-split configurations, VRF commercial systems, refrigeration cabinets, cold rooms,
                  heat pumps, ventilation, and a full range of HVAC tools and accessories.
                </p>
                <p>
                  Whether you&apos;re a homeowner upgrading your living room unit, or a contractor fitting out
                  a hotel, we have the products, technical expertise, and support to get the job done right.
                </p>
              </div>
              <div className="mt-8 flex gap-3">
                <Link href="/contact"><Button variant="brand">Get in Touch</Button></Link>
                <Link href="/trade"><Button variant="outline">Trade Accounts</Button></Link>
              </div>
            </div>

            <div className="space-y-4">
              {TEAM_VALUES.map(v => (
                <div key={v.title} className="p-5 bg-white rounded-xl border border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Visit Us</h2>
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center gap-2">
                <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-sky-600" />
                </div>
                <p className="text-sm font-medium text-slate-900">Address</p>
                <p className="text-sm text-slate-500 text-center">220 Vjal L-Indipendenza<br />Mosta MST 9022, Malta</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-sky-600" />
                </div>
                <p className="text-sm font-medium text-slate-900">Phone</p>
                <a href="tel:+35679661889" className="text-sm text-sky-600 hover:underline">+356 7966 1889</a>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-sky-600" />
                </div>
                <p className="text-sm font-medium text-slate-900">Email</p>
                <a href="mailto:support@theairconditionshop.com" className="text-sm text-sky-600 hover:underline">support@theairconditionshop.com</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
