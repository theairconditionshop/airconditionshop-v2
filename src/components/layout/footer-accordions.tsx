'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

const PRODUCT_LINKS = [
  { label: 'Air Conditioners',         href: '/products/category/air-conditioners' },
  { label: 'Multi-Split Systems',      href: '/products/category/multi-split-systems' },
  { label: 'Commercial Refrigeration', href: '/products/category/commercial-refrigeration' },
  { label: 'Cold Rooms',               href: '/products/category/cold-rooms' },
  { label: 'Heat Pumps',               href: '/products/category/heat-pumps' },
  { label: 'HVAC Tools & Accessories', href: '/products/category/hvac-tools' },
]

const COMPANY_LINKS = [
  { label: 'About Us',      href: '/about' },
  { label: 'Services',      href: '/services' },
  { label: 'Blog',          href: '/blog' },
  { label: 'Brands',        href: '/brands' },
  { label: 'Contact',       href: '/contact' },
  { label: 'Trade Account', href: '/trade' },
]

const TOOL_LINKS = [
  { label: 'BTU Calculator',  href: '/btu-calculator' },
  { label: 'Request a Quote', href: '/quote' },
  { label: 'Book a Service',  href: '/services#book' },
  { label: 'Privacy Policy',  href: '/legal/privacy' },
  { label: 'Terms of Use',    href: '/legal/terms' },
]

function AccordionSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/[0.04] md:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex md:hidden w-full items-center justify-between py-4 cursor-pointer"
        aria-expanded={open}
      >
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.22em]">{title}</span>
        <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <h3 className="hidden md:block text-[11px] font-semibold text-slate-500 uppercase tracking-[0.22em] mb-5">{title}</h3>
      <div className={`${open ? 'block' : 'hidden'} md:block pb-5 md:pb-0`}>
        {children}
      </div>
    </div>
  )
}

export default function FooterAccordions({ googleReviewUrl }: { googleReviewUrl?: string }) {
  return (
    <>
      <AccordionSection title="Products">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 md:flex md:flex-col md:space-y-3">
          {PRODUCT_LINKS.map(link => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </AccordionSection>

      <AccordionSection title="Company">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 md:flex md:flex-col md:space-y-3">
          {COMPANY_LINKS.map(link => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </AccordionSection>

      <AccordionSection title="Tools &amp; Info">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 md:flex md:flex-col md:space-y-3">
          {TOOL_LINKS.map(link => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {googleReviewUrl && (
          <div className="mt-6 mb-2">
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors duration-200 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Leave us a Google Review
            </a>
          </div>
        )}

        <div className="mt-6 bg-amber-500/[0.07] border border-amber-500/20 rounded-xl p-5">
          <p className="text-sm font-semibold text-amber-400 mb-1">HVAC Trade Accounts — Malta</p>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">Competitive pricing for installers, contractors and commercial buyers</p>
          <div className="flex flex-col gap-2">
            <Link href="/trade/register" className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors duration-200 cursor-pointer">
              Apply for a Trade Account →
            </Link>
            <Link href="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200 cursor-pointer">
              Trade Login →
            </Link>
          </div>
        </div>
      </AccordionSection>
    </>
  )
}
