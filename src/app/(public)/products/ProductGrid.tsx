import Link from 'next/link'
import { Search } from 'lucide-react'
import { getProducts, getSeriesList } from '@/lib/data/queries'
import ProductCard from '@/components/products/product-card'
import SeriesCard from '@/components/products/series-card'
import type { UserRole } from '@/types/database'

interface Props {
  categoryId?: string
  brandId?: string
  search?: string
  acType?: string
  userRole: UserRole | null
}

export default async function ProductGrid({ categoryId, brandId, search, acType, userRole }: Props) {
  const [products, allSeries] = await Promise.all([
    getProducts({ categoryId, brandId, search, acType }),
    getSeriesList({ brandId }),
  ])

  // Series respect the same filters (category / ac_type / free-text search)
  const q = search?.trim().toLowerCase()
  const series = allSeries.filter(s => {
    if (categoryId && s.category_id !== categoryId) return false
    if (acType && s.ac_type !== acType) return false
    if (q && !(`${s.brand?.name ?? ''} ${s.name}`.toLowerCase().includes(q))) return false
    return true
  })

  const total = products.length + series.length

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
          <Search className="w-7 h-7 text-slate-300" />
        </div>
        <h3 className="font-display text-xl text-slate-900 mb-2">No products found</h3>
        <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-6">
          Try removing a filter or{' '}
          <Link href="/products" className="text-blue-600 hover:underline font-medium">
            browse all products
          </Link>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors duration-150"
          >
            Browse All Products
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 hover:border-blue-200 hover:text-blue-700 text-sm font-semibold rounded-xl transition-colors duration-150"
          >
            Ask Our Team
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-slate-400 mb-4">
        {total} product{total !== 1 ? 's' : ''}
        {search && <span> for &ldquo;{search}&rdquo;</span>}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        {series.map(s => (
          <SeriesCard key={s.id} series={s} userRole={userRole} brandSlug={s.brand?.slug ?? ''} />
        ))}
        {products.map(product => (
          <ProductCard key={product.id} product={product} userRole={userRole} />
        ))}
      </div>
    </>
  )
}
