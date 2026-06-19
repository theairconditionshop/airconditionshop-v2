import Link from 'next/link'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

const PRODUCT_LINKS = [
  { label: 'Air Conditioners',       href: '/products/category/air-conditioners' },
  { label: 'Multi-Split Systems',    href: '/products/category/multi-split-systems' },
  { label: 'Commercial Refrigeration',href: '/products/category/commercial-refrigeration' },
  { label: 'Cold Rooms',             href: '/products/category/cold-rooms' },
  { label: 'Heat Pumps',             href: '/products/category/heat-pumps' },
  { label: 'HVAC Tools & Accessories',href: '/products/category/hvac-tools' },
]

const COMPANY_LINKS = [
  { label: 'About Us',    href: '/about' },
  { label: 'Services',    href: '/services' },
  { label: 'Blog',        href: '/blog' },
  { label: 'Brands',      href: '/brands' },
  { label: 'Contact',     href: '/contact' },
  { label: 'Trade Account', href: '/trade' },
]

const TOOL_LINKS = [
  { label: 'BTU Calculator',  href: '/btu-calculator' },
  { label: 'Request a Quote', href: '/quote' },
  { label: 'Book a Service',  href: '/services#book' },
  { label: 'Privacy Policy',  href: '/legal/privacy' },
  { label: 'Terms of Use',    href: '/legal/terms' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-white font-bold text-lg tracking-tight">
                THE AIRCONDITION SHOP
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Malta&apos;s premier HVAC and refrigeration specialists. Authorised dealers for
              Daikin, Mitsubishi Electric, Panasonic and more.
            </p>

            {/* Contact info */}
            <ul className="space-y-3 text-sm">
              <li>
                <a href="tel:+35679661889" className="flex items-center gap-2.5 text-slate-400 hover:text-sky-400 transition-colors">
                  <Phone className="w-4 h-4 shrink-0 text-sky-500" />
                  +356 7966 1889
                </a>
              </li>
              <li>
                <a href="mailto:support@theairconditionshop.com" className="flex items-center gap-2.5 text-slate-400 hover:text-sky-400 transition-colors">
                  <Mail className="w-4 h-4 shrink-0 text-sky-500" />
                  support@theairconditionshop.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-slate-400">
                <MapPin className="w-4 h-4 shrink-0 text-sky-500 mt-0.5" />
                <span>220 Vjal L-Indipendenza<br />Mosta MST 9022, Malta</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-400">
                <Clock className="w-4 h-4 shrink-0 text-sky-500 mt-0.5" />
                <span>Mon–Fri: 08:00–18:00<br />Sat: 09:00–13:00</span>
              </li>
            </ul>

            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              <a href="https://facebook.com/theairconditionshop" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-sky-500 hover:text-white transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H8v-2.88h2.44V9.8c0-2.41 1.44-3.74 3.63-3.74 1.05 0 2.15.19 2.15.19v2.37h-1.21c-1.19 0-1.56.74-1.56 1.5v1.8H16l-.44 2.88h-2.32v6.99A10 10 0 0 0 22 12z"/></svg>
              </a>
              <a href="https://instagram.com/theairconditionshop" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-sky-500 hover:text-white transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-sky-500 hover:text-white transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Products</h3>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Tools & Info</h3>
            <ul className="space-y-2.5">
              {TOOL_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Trade CTA */}
            <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
              <p className="text-sm font-semibold text-white mb-1">Trade Customers</p>
              <p className="text-xs text-slate-400 mb-3">Installers & contractors — apply for trade pricing</p>
              <Link href="/trade/register"
                className="inline-block text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors">
                Apply now →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {year} THE AIRCONDITION SHOP. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            220 Vjal L-Indipendenza, Mosta MST 9022, Malta
          </p>
        </div>
      </div>
    </footer>
  )
}
