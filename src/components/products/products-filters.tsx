'use client'

import { Suspense, useState } from 'react'
import { SlidersHorizontal, X, Search, ChevronDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

interface Category { id: string; name: string; product_count?: number }
interface Brand    { id: string; name: string; product_count?: number }

interface AcFacets { btus: number[]; energyClasses: string[]; refrigerants: string[]; colours: string[] }

interface Props {
  categories: Category[]
  brands: Brand[]
  acTypes: string[]
  facets?: AcFacets
  activeCategory?: string
  activeBrand?: string
  activeSearch?: string
  activeAcType?: string
  activeBtu?: string
  activeEnergy?: string
  activeRefrigerant?: string
  activeWifi?: string
  activeColour?: string
}

type FilterKey = 'category' | 'brand' | 'ac_type' | 'search' | 'btu' | 'energy' | 'refrigerant' | 'wifi' | 'colour'

const MAX_VISIBLE = 6

// ─── shared filter section ─────────────────────────────────────────────────

interface SectionProps {
  label: string
  items: Array<{ id: string; name: string }>
  activeId: string | undefined
  onSelect: (id: string | null) => void
  allLabel?: string
}

function FilterSection({ label, items, activeId, onSelect, allLabel = 'All' }: SectionProps) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? items : items.slice(0, MAX_VISIBLE)
  const hasMore = items.length > MAX_VISIBLE

  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{label}</p>
      <nav className="space-y-0.5">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer',
            !activeId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
          )}
        >
          {allLabel}
        </button>
        {visible.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer',
              activeId === item.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            {item.name}
          </button>
        ))}
        {hasMore && (
          <button
            onClick={() => setShowAll(s => !s)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
          >
            <ChevronDown className={cn('w-3 h-3 transition-transform', showAll && 'rotate-180')} />
            {showAll ? 'Show less' : `+${items.length - MAX_VISIBLE} more`}
          </button>
        )}
      </nav>
    </div>
  )
}

// ─── filter chips (above grid) ─────────────────────────────────────────────

interface ChipsProps {
  categories: Category[]
  brands: Brand[]
  activeCategory?: string
  activeBrand?: string
  activeAcType?: string
  activeSearch?: string
  onRemove: (key: 'category' | 'brand' | 'ac_type' | 'search') => void
  onClearAll: () => void
}

export function FilterChips({ categories, brands, activeCategory, activeBrand, activeAcType, activeSearch, onRemove, onClearAll }: ChipsProps) {
  const hasAny = activeCategory || activeBrand || activeAcType || activeSearch
  if (!hasAny) return null

  const categoryName = categories.find(c => c.id === activeCategory)?.name
  const brandName    = brands.find(b => b.id === activeBrand)?.name

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {categoryName && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
          {categoryName}
          <button onClick={() => onRemove('category')} className="hover:text-blue-900 cursor-pointer" aria-label="Remove category filter">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {brandName && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
          {brandName}
          <button onClick={() => onRemove('brand')} className="hover:text-blue-900 cursor-pointer" aria-label="Remove brand filter">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {activeAcType && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
          {activeAcType}
          <button onClick={() => onRemove('ac_type')} className="hover:text-blue-900 cursor-pointer" aria-label="Remove AC type filter">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {activeSearch && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200">
          &ldquo;{activeSearch}&rdquo;
          <button onClick={() => onRemove('search')} className="hover:text-slate-900 cursor-pointer" aria-label="Remove search filter">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      <button
        onClick={onClearAll}
        className="text-xs text-red-500 hover:text-red-600 font-medium underline-offset-2 hover:underline transition-colors cursor-pointer"
      >
        Clear all
      </button>
    </div>
  )
}

// ─── main component ────────────────────────────────────────────────────────

function ProductsFiltersInner({ categories, brands, acTypes, facets, activeCategory, activeBrand, activeSearch, activeAcType, activeBtu, activeEnergy, activeRefrigerant, activeWifi, activeColour }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Local state for mobile sheet (committed on Apply)
  const [localCategory, setLocalCategory] = useState(activeCategory)
  const [localBrand, setLocalBrand]       = useState(activeBrand)
  const [localAcType, setLocalAcType]     = useState(activeAcType)

  const activeCount = [activeCategory, activeBrand, activeSearch, activeAcType, activeBtu, activeEnergy, activeRefrigerant, activeWifi, activeColour].filter(Boolean).length

  // Merge-based navigation — patch only what's passed, keep the rest
  function navigate(patch: Partial<Record<FilterKey, string | null>>) {
    const sp = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') sp.delete(k)
      else if (v !== undefined) sp.set(k, v)
    }
    router.replace(`/products${sp.toString() ? '?' + sp.toString() : ''}`, { scroll: false })
  }

  function clearAll() {
    router.replace('/products', { scroll: false })
  }

  function applyMobile() {
    const sp = new URLSearchParams(searchParams.toString())
    if (localCategory) sp.set('category', localCategory); else sp.delete('category')
    if (localBrand)    sp.set('brand', localBrand);       else sp.delete('brand')
    if (localAcType)   sp.set('ac_type', localAcType);    else sp.delete('ac_type')
    router.replace(`/products${sp.toString() ? '?' + sp.toString() : ''}`, { scroll: false })
    setMobileOpen(false)
  }

  function clearMobile() {
    setLocalCategory(undefined)
    setLocalBrand(undefined)
    setLocalAcType(undefined)
  }

  const acTypeItems = acTypes.map(t => ({ id: t, name: t }))

  // Desktop sidebar filter content
  const sidebarContent = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Search</p>
        <form onSubmit={e => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          navigate({ search: fd.get('search') as string || null })
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

      {categories.length > 0 && (
        <FilterSection
          label="Categories"
          items={categories}
          activeId={activeCategory}
          onSelect={id => navigate({ category: id })}
          allLabel="All Products"
        />
      )}

      {brands.length > 0 && (
        <FilterSection
          label="Brands"
          items={brands}
          activeId={activeBrand}
          onSelect={id => navigate({ brand: id })}
          allLabel="All Brands"
        />
      )}

      {acTypeItems.length > 0 && (
        <FilterSection
          label="AC Type"
          items={acTypeItems}
          activeId={activeAcType}
          onSelect={id => navigate({ ac_type: id })}
          allLabel="All Types"
        />
      )}

      {/* ── Air-conditioner facet filters ── */}
      {facets && facets.btus.length > 0 && (
        <FilterSection
          label="BTU / Capacity"
          items={facets.btus.map(b => ({ id: String(b), name: `${b.toLocaleString()} BTU` }))}
          activeId={activeBtu}
          onSelect={id => navigate({ btu: id })}
          allLabel="Any capacity"
        />
      )}
      {facets && facets.energyClasses.length > 0 && (
        <FilterSection
          label="Energy Class"
          items={facets.energyClasses.map(e => ({ id: e, name: e }))}
          activeId={activeEnergy}
          onSelect={id => navigate({ energy: id })}
          allLabel="Any class"
        />
      )}
      {facets && facets.refrigerants.length > 0 && (
        <FilterSection
          label="Refrigerant"
          items={facets.refrigerants.map(r => ({ id: r, name: r }))}
          activeId={activeRefrigerant}
          onSelect={id => navigate({ refrigerant: id })}
          allLabel="Any refrigerant"
        />
      )}
      {facets && facets.colours.length > 0 && (
        <FilterSection
          label="Colour"
          items={facets.colours.map(c => ({ id: c, name: c }))}
          activeId={activeColour}
          onSelect={id => navigate({ colour: id })}
          allLabel="Any colour"
        />
      )}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Connectivity</p>
        <label className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 cursor-pointer">
          <input type="checkbox" checked={activeWifi === '1'} onChange={e => navigate({ wifi: e.target.checked ? '1' : null })} className="w-4 h-4" />
          Wi-Fi capable
        </label>
      </div>

      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => {
            setLocalCategory(activeCategory)
            setLocalBrand(activeBrand)
            setLocalAcType(activeAcType)
            setMobileOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-blue-300 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile bottom sheet */}
      <Dialog.Root open={mobileOpen} onOpenChange={open => { if (!open) setMobileOpen(false) }}>
        <AnimatePresence>
          {mobileOpen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div
                  className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col"
                  style={{ maxHeight: '88vh' }}
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  drag="y"
                  dragConstraints={{ top: 0 }}
                  dragElastic={{ top: 0, bottom: 0.5 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 100 || info.velocity.y > 400) setMobileOpen(false)
                  }}
                >
                  {/* Drag handle */}
                  <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
                    <div className="w-10 h-1 rounded-full bg-slate-200" />
                  </div>

                  {/* Fixed header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
                    <Dialog.Title className="font-semibold text-slate-900">
                      Filters
                      {activeCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">{activeCount}</span>
                      )}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button className="p-2 rounded-xl hover:bg-slate-100 cursor-pointer" aria-label="Close filters">
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Scrollable filter body */}
                  <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
                    {categories.length > 0 && (
                      <FilterSection
                        label="Categories"
                        items={categories}
                        activeId={localCategory}
                        onSelect={id => setLocalCategory(id ?? undefined)}
                        allLabel="All Products"
                      />
                    )}

                    {brands.length > 0 && (
                      <FilterSection
                        label="Brands"
                        items={brands}
                        activeId={localBrand}
                        onSelect={id => setLocalBrand(id ?? undefined)}
                        allLabel="All Brands"
                      />
                    )}

                    {acTypeItems.length > 0 && (
                      <FilterSection
                        label="AC Type"
                        items={acTypeItems}
                        activeId={localAcType}
                        onSelect={id => setLocalAcType(id ?? undefined)}
                        allLabel="All Types"
                      />
                    )}
                  </div>

                  {/* Fixed footer */}
                  <div className="shrink-0 px-5 py-4 border-t border-slate-100 flex gap-3">
                    <button
                      onClick={clearMobile}
                      className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-slate-300 transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={applyMobile}
                      className="flex-[2] py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Apply Filters
                    </button>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-24">
          {sidebarContent}
        </div>
      </aside>
    </>
  )
}

export default function ProductsFilters(props: Props) {
  return (
    <Suspense fallback={null}>
      <ProductsFiltersInner {...props} />
    </Suspense>
  )
}
