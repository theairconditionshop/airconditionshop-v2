import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Crumb { label: string; href?: string }

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3 h-3" />}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-blue-600 transition-colors">{crumb.label}</Link>
          ) : (
            <span className="text-slate-600 font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
