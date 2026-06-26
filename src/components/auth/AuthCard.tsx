import Link from 'next/link'
import { ReactNode } from 'react'

interface AuthCardProps {
  children:    ReactNode
  heading:     string
  subheading?: string
  icon?:       ReactNode
  backHref?:   string
  backLabel?:  string
}

export default function AuthCard({
  children,
  heading,
  subheading,
  icon,
  backHref,
  backLabel = 'Back',
}: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F4F8] px-4 py-12">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-[11px] font-bold tracking-[0.14em] text-[#0F6FFF] uppercase">
              THE AIRCONDITION SHOP
            </span>
          </Link>

          {icon && (
            <div className="mt-5 flex items-center justify-center mx-auto w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm">
              {icon}
            </div>
          )}

          <h1 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">{heading}</h1>
          {subheading && (
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{subheading}</p>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {children}
        </div>

        {/* Back link */}
        {backHref && (
          <p className="mt-5 text-center text-sm text-slate-400">
            <Link href={backHref} className="hover:text-slate-600 transition-colors">
              ← {backLabel}
            </Link>
          </p>
        )}

      </div>
    </div>
  )
}
