import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface LinkItem {
  label: string
  description: string
  href: string
  cta: string
}

interface InternalLinkPanelProps {
  heading?: string
  links: LinkItem[]
  className?: string
  variant?: 'light' | 'dark'
}

export function InternalLinkPanel({
  heading,
  links,
  className = '',
  variant = 'light',
}: InternalLinkPanelProps) {
  const bg      = variant === 'dark' ? 'bg-slate-900 border-white/[0.06]' : 'bg-slate-50 border-slate-100'
  const headCol = variant === 'dark' ? 'text-white'     : 'text-slate-900'
  const descCol = variant === 'dark' ? 'text-slate-400' : 'text-slate-500'
  const cardBg  = variant === 'dark' ? 'bg-white/[0.03] border-white/[0.07] hover:border-blue-500/30' : 'bg-white border-slate-100 hover:border-blue-100'
  const ctaCol  = variant === 'dark' ? 'text-blue-400' : 'text-blue-600'

  return (
    <div className={`border p-6 sm:p-8 ${bg} ${className}`} style={{ borderRadius: 2 }}>
      {heading && (
        <p className={`text-[11px] font-semibold uppercase tracking-[0.28em] mb-6 ${variant === 'dark' ? 'text-slate-500' : 'text-blue-600'}`}>
          {heading}
        </p>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map(({ label, description, href, cta }) => (
          <Link
            key={href}
            href={href}
            className={`group flex flex-col gap-3 p-5 border transition-colors duration-300 cursor-pointer ${cardBg}`}
            style={{ borderRadius: 2 }}
          >
            <div className="flex-1">
              <p className={`font-semibold text-sm mb-1 ${headCol}`}>{label}</p>
              <p className={`text-xs leading-relaxed ${descCol}`}>{description}</p>
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${ctaCol}`}>
              {cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
