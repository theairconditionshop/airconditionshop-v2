import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/pricing/resolver'
import { resolveVariantPrice, shouldHideSeriesPrice } from '@/lib/pricing/variant-resolver'
import type { ProductSeries, UserRole } from '@/types/database'

interface Props {
  series: ProductSeries
  userRole?: UserRole | null
  brandSlug: string
}

const BRAND_GRADIENTS: Record<string, string> = {
  daikin: 'from-sky-950 via-blue-900 to-slate-900',
  gree:   'from-emerald-950 via-slate-900 to-slate-950',
}

export default function SeriesCard({ series, userRole, brandSlug }: Props) {
  const variants = (series.variants ?? []).filter(v => v.is_active)
  const hide = shouldHideSeriesPrice(series, userRole ?? null)

  const prices = variants.map(v => resolveVariantPrice(v, userRole ?? null).price).filter((p): p is number => p != null)
  const fromPrice = prices.length ? Math.min(...prices) : null

  const hero = (series.images ?? []).find(i => i.colour_id == null && i.is_primary)
    ?? (series.images ?? []).find(i => i.colour_id == null)
    ?? (series.images ?? [])[0]

  const btus = [...new Set(variants.map(v => v.btu).filter((b): b is number => b != null))].sort((a, b) => a - b)
  const gradient = BRAND_GRADIENTS[brandSlug] ?? 'from-slate-900 via-slate-800 to-slate-900'

  return (
    <Link
      href={`/products/${brandSlug}/${series.slug}`}
      className={cn(
        'group flex flex-col bg-white border border-slate-200 hover:border-slate-900',
        'overflow-hidden transition-colors duration-300 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      )}
      style={{ borderRadius: 2 }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        {hero ? (
          <Image src={hero.thumbnail_url ?? hero.url} alt={hero.alt_text || `${series.brand?.name ?? ''} ${series.name}`} fill sizes="(max-width:640px) 50vw, 33vw" className="object-cover transition-all duration-[600ms] ease-out group-hover:scale-[1.06]" />
        ) : (
          <div className={cn('w-full h-full bg-gradient-to-br flex flex-col items-center justify-center gap-2 p-6', gradient)}>
            {series.brand && <span className="text-[10px] font-bold tracking-[0.25em] text-white/30 uppercase">{series.brand.name}</span>}
            <div className="w-10 h-px bg-white/10" />
            <span className="text-sm font-semibold tracking-wide text-white/40 uppercase">{series.name}</span>
          </div>
        )}
        {series.has_colours && (series.colours?.length ?? 0) > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex gap-1">
            {(series.colours ?? []).filter(c => c.is_active).slice(0, 4).map(c => (
              <span key={c.id} className="w-3.5 h-3.5 rounded-full border border-white/70" style={{ backgroundColor: c.hex ?? '#e2e8f0' }} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 lg:p-5">
        {series.brand && <p className="text-[11px] font-semibold tracking-[0.15em] text-slate-400 uppercase mb-1.5">{series.brand.name}</p>}
        <h3 className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors duration-300">{series.name}</h3>
        {btus.length > 0 && (
          <p className="text-[11px] text-slate-400 mt-1">{btus.length} sizes · {btus[0].toLocaleString()}–{btus[btus.length - 1].toLocaleString()} BTU</p>
        )}

        <div className="mt-4 flex items-end justify-between">
          <div>
            {hide ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700" style={{ borderRadius: 2 }}>Trade Price</span>
            ) : fromPrice != null ? (
              <>
                <p className="text-[10px] text-slate-400 leading-none mb-0.5">from</p>
                <p className="text-base font-bold tracking-tight text-slate-900">{formatPrice(fromPrice)}</p>
              </>
            ) : (
              <p className="text-sm text-slate-400 font-medium">Contact for price</p>
            )}
          </div>
          <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">View <ArrowUpRight className="w-3 h-3" /></span>
        </div>
      </div>
    </Link>
  )
}
