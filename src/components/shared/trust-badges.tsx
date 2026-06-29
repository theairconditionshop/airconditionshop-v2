import { ShieldCheck, Award, Wrench, MapPin, Package, Star, Clock, CheckCircle2 } from 'lucide-react'

type BadgeVariant = 'light' | 'dark' | 'subtle'

interface Badge {
  icon: React.ElementType
  label: string
}

const BADGE_SETS = {
  core: [
    { icon: ShieldCheck, label: 'F-Gas Certified Engineers' },
    { icon: Award,       label: 'Official Brand Stockist' },
    { icon: Wrench,      label: 'Manufacturer-Authorised Installer' },
    { icon: MapPin,      label: 'Malta-Based Team' },
  ],
  product: [
    { icon: Package,      label: 'Genuine Products' },
    { icon: Award,        label: 'Manufacturer Warranty' },
    { icon: Wrench,       label: 'Installation Available' },
    { icon: CheckCircle2, label: 'Local Support' },
  ],
  service: [
    { icon: ShieldCheck,  label: 'F-Gas Certified' },
    { icon: Clock,        label: 'Fast Response' },
    { icon: Star,         label: 'After-Sales Support' },
    { icon: MapPin,       label: 'All Malta' },
  ],
  trade: [
    { icon: Award,        label: 'Official Dealer' },
    { icon: Package,      label: 'Trade Pricing' },
    { icon: Wrench,       label: 'Technical Support' },
    { icon: ShieldCheck,  label: 'Malta VAT Registered' },
  ],
} satisfies Record<string, Badge[]>

interface TrustBadgesProps {
  set?: keyof typeof BADGE_SETS
  badges?: { label: string }[]
  variant?: BadgeVariant
  className?: string
}

export function TrustBadges({
  set = 'core',
  badges,
  variant = 'light',
  className = '',
}: TrustBadgesProps) {
  const items = badges
    ? badges.map(b => ({ icon: CheckCircle2 as React.ElementType, label: b.label }))
    : BADGE_SETS[set]

  if (variant === 'dark') {
    return (
      <div className={`flex flex-wrap gap-3 ${className}`}>
        {items.map(({ icon: Icon, label }) => (
          <span key={label} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] text-[12px] font-medium text-slate-300">
            <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            {label}
          </span>
        ))}
      </div>
    )
  }

  if (variant === 'subtle') {
    return (
      <div className={`flex flex-wrap gap-x-5 gap-y-2 ${className}`}>
        {items.map(({ label }) => (
          <span key={label} className="inline-flex items-center gap-1.5 text-[12px] text-slate-500">
            <span className="w-1 h-1 rounded-full bg-blue-500/60 shrink-0" />
            {label}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {items.map(({ icon: Icon, label }) => (
        <span key={label} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-[12px] font-medium text-slate-600 shadow-sm">
          <Icon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          {label}
        </span>
      ))}
    </div>
  )
}

interface InlineTrustProps {
  items: string[]
  variant?: 'light' | 'dark'
  className?: string
}

export function InlineTrust({ items, variant = 'light', className = '' }: InlineTrustProps) {
  const textColor = variant === 'dark' ? 'text-slate-500' : 'text-slate-400'
  const dotColor  = variant === 'dark' ? 'bg-blue-600/50' : 'bg-blue-400/60'

  return (
    <div className={`flex flex-wrap gap-x-5 gap-y-1.5 ${className}`}>
      {items.map(item => (
        <span key={item} className={`inline-flex items-center gap-1.5 text-[12px] ${textColor}`}>
          <span className={`w-1 h-1 rounded-full ${dotColor} shrink-0`} />
          {item}
        </span>
      ))}
    </div>
  )
}
