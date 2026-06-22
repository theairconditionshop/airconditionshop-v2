'use client'

import { useState } from 'react'
import { SlidersHorizontal, X, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Category { id: string; name: string }
interface Brand    { id: string; name: string }

interface Props {
  categories: Category[]
  brands: Brand[]
  activeCategory?: string
  activeBrand?: string
  activeSearch?: string
}

interface FilterContentProps {
  categories: Category[]
  brands: Brand[]
  activeCategory?: string
  activeBrand?: string
  activeSearch?: string
  onNavigate: (params: Record<string, string | undefined>) => void
}

function FilterContent({ categories, brands, activeCategory, activeBrand, activeSearch, onNavigate }: FilterContentProps) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Search</p>
        <form onSubmit={e => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          onNavigate({ search: fd.get('search') as string || undefined })
        }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              name="search"
              defaultValue={activeSearch}
              placeholder="Search products…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </form>
      </div>

      {/* Categories */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Categories</p>
        <nav className="space-y-0.5">
          <button
            onClick={() => onNavigate({})}
            className={cn(
              'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer',
              !activeCategory ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onNavigate({ category: cat.id })}
              className={cn(
                'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer',
                activeCategory === cat.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Brands</p>
          <nav className="space-y-0.5">
            {brands.map(brand => (
              <button
                key={brand.id}
                onClick={() => onNavigate({ brand: brand.id })}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer',
                  activeBrand === brand.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                {brand.name}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Clear filters */}
      {(activeCategory || activeBrand || activeSearch) && (
        <button
          onClick={() => onNavigate({})}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
          Clear all filters
        </button>
      )}
    </div>
  )
}

export default function ProductsFilters({ categories, brands, activeCategory, activeBrand, activeSearch }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()

  function navigate(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v) })
    router.push(`/products${sp.toString() ? '?' + sp.toString() : ''}`)
  }

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-blue-300 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {(activeCategory || activeBrand || activeSearch) && (
            <span className="ml-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
              {[activeCategory, activeBrand, activeSearch].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="relative ml-auto w-72 bg-white h-full shadow-2xl overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-slate-900">Filters</h2>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <FilterContent
                categories={categories}
                brands={brands}
                activeCategory={activeCategory}
                activeBrand={activeBrand}
                activeSearch={activeSearch}
                onNavigate={navigate}
              />
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-24">
          <FilterContent
            categories={categories}
            brands={brands}
            activeCategory={activeCategory}
            activeBrand={activeBrand}
            activeSearch={activeSearch}
            onNavigate={navigate}
          />
        </div>
      </aside>
    </>
  )
}
