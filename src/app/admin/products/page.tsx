import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPageHeader from '@/components/admin/page-header'
import DeleteButton from '@/components/admin/delete-button'
import DuplicateButton from '@/components/admin/duplicate-button'
import { ImageIcon, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'

export const metadata: Metadata = { title: 'Products — Admin' }
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 30

interface SearchParams {
  q?:        string
  brand?:    string
  category?: string
  sort?:     string
  page?:     string
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params   = await searchParams
  const q        = params.q?.trim() ?? ''
  const brand    = params.brand    ?? ''
  const category = params.category ?? ''
  const sort     = params.sort     ?? 'newest'
  const page     = Math.max(1, parseInt(params.page ?? '1', 10))

  const db = createAdminClient()

  const [{ data: allBrands }, { data: allCategories }] = await Promise.all([
    db.from('brands').select('id, name').eq('is_active', true).order('name'),
    db.from('categories').select('id, name').eq('is_active', true).order('name'),
  ])

  let query = db
    .from('products')
    .select(
      'id, name, slug, retail_price, original_price, sale_price, trade_price, price_visibility, availability, is_active, is_featured, ac_type, product_type, cooling_btu, categories(id, name), brands(id, name), product_images(id)',
      { count: 'exact' }
    )

  if (q)        query = query.ilike('name', `%${q}%`)
  if (brand)    query = query.eq('brand_id', brand)
  if (category) query = query.eq('category_id', category)

  if (sort === 'az')         query = query.order('name', { ascending: true  })
  else if (sort === 'za')    query = query.order('name', { ascending: false })
  else if (sort === 'price_asc')  query = query.order('effective_price', { ascending: true,  nullsFirst: false })
  else if (sort === 'price_desc') query = query.order('effective_price', { ascending: false, nullsFirst: false })
  else query = query.order('created_at', { ascending: false })

  const from = (page - 1) * PAGE_SIZE
  query = query.range(from, from + PAGE_SIZE - 1)

  const { data, count, error } = await query
  if (error) console.error('[admin/products] query error:', error.message)

  type Row = {
    id: string; name: string; slug: string
    retail_price?: number | null; original_price?: number | null; sale_price?: number | null; trade_price?: number | null
    price_visibility?: string | null; availability?: string
    is_active: boolean; is_featured: boolean; ac_type?: string | null
    product_type?: string | null; cooling_btu?: number | null
    categories?: { id: string; name: string } | null
    brands?:     { id: string; name: string } | null
    product_images?: { id: string }[]
  }
  const rows: Row[] = (data ?? []) as unknown as Row[]
  const totalPages  = Math.ceil((count ?? 0) / PAGE_SIZE)

  function buildUrl(overrides: Partial<SearchParams>) {
    const p      = new URLSearchParams()
    const merged = { q, brand, category, sort, page: String(page), ...overrides }
    if (merged.q)        p.set('q',        merged.q)
    if (merged.brand)    p.set('brand',    merged.brand)
    if (merged.category) p.set('category', merged.category)
    if (merged.sort && merged.sort !== 'newest') p.set('sort', merged.sort)
    if (merged.page && merged.page !== '1')      p.set('page', merged.page)
    const qs = p.toString()
    return `/admin/products${qs ? `?${qs}` : ''}`
  }

  // Resolve the displayed retail price — retail_price first, then original_price
  function displayRetailPrice(r: Row): string | null {
    const v = r.retail_price ?? r.original_price
    if (v == null) return null
    return `€${Number(v).toFixed(2)}`
  }

  function displayTradePrice(r: Row): string | null {
    if (r.trade_price == null) return null
    return `€${Number(r.trade_price).toFixed(2)}`
  }

  const activeFilters = [q, brand, category].filter(Boolean).length

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Products" newHref="/admin/products/new" newLabel="Add Product" />

      {/* Search + filter bar */}
      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <form method="GET" action="/admin/products" className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search products…"
              className="w-full h-9 pl-3 pr-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            name="brand"
            defaultValue={brand}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Brands</option>
            {(allBrands ?? []).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <select
            name="category"
            defaultValue={category}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Categories</option>
            {(allCategories ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select
            name="sort"
            defaultValue={sort}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="az">Name A→Z</option>
            <option value="za">Name Z→A</option>
            <option value="price_asc">Price low→high</option>
            <option value="price_desc">Price high→low</option>
          </select>

          <button
            type="submit"
            className="h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Filter
          </button>

          {activeFilters > 0 && (
            <a
              href="/admin/products"
              className="h-9 px-3 flex items-center text-sm text-slate-500 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors shrink-0"
            >
              Clear ({activeFilters})
            </a>
          )}
        </form>
      </div>

      <p className="text-sm text-slate-400 px-1">
        {count ?? 0} product{count !== 1 ? 's' : ''}
        {activeFilters > 0 ? ' matching filters' : ''}
        {totalPages > 1 ? ` — page ${page} of ${totalPages}` : ''}
      </p>

      {/* Mobile card list */}
      {rows.length > 0 && (
        <div className="sm:hidden space-y-2">
          {rows.map(r => {
            const retailDisplay = displayRetailPrice(r)
            const tradeDisplay  = displayTradePrice(r)
            const isTradeOnly   = r.price_visibility === 'trade_only'
            return (
              <div key={r.id} className="bg-white rounded-xl border border-slate-100 px-4 py-3.5">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 text-sm block truncate">{r.name}</span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(r.brands as { name: string } | null)?.name || ''}
                      {(r.categories as { name: string } | null)?.name ? ` · ${(r.categories as { name: string }).name}` : ''}
                    </p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {r.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700">
                      {retailDisplay ?? <span className="text-slate-400 italic">No price</span>}
                    </span>
                    {isTradeOnly && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <EyeOff className="w-2.5 h-2.5" /> Trade Only
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <a href={`/admin/products/${r.id}/edit`} className="text-blue-600 font-medium">Edit</a>
                    <DuplicateButton id={r.id} entity="products" label={r.name} editBasePath="/admin/products" />
                    <DeleteButton id={r.id} entity="products" label={r.name} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Desktop table */}
      {rows.length > 0 ? (
        <div className="hidden sm:block bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Brand</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Category</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Retail Price</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Trade Price</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Visibility</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 hidden xl:table-cell">Type</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Imgs</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map(r => {
                  const retailDisplay = displayRetailPrice(r)
                  const tradeDisplay  = displayTradePrice(r)
                  const isTradeOnly   = r.price_visibility === 'trade_only'
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-slate-800">{r.name}</span>
                          {r.is_featured && (
                            <span className="ml-2 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Featured</span>
                          )}
                          {r.cooling_btu && (
                            <span className="ml-2 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{r.cooling_btu.toLocaleString()} BTU</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-slate-500">{(r.brands as { name: string } | null)?.name || '—'}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-slate-500">{(r.categories as { name: string } | null)?.name || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {r.sale_price != null ? (
                          <span className="text-xs font-medium">
                            <span className="line-through text-slate-400 mr-1">€{Number(r.original_price ?? r.retail_price ?? 0).toFixed(2)}</span>
                            <span className="text-emerald-600">€{Number(r.sale_price).toFixed(2)}</span>
                          </span>
                        ) : retailDisplay ? (
                          <span className="text-xs font-medium text-slate-700">{retailDisplay}</span>
                        ) : (
                          <span className="text-xs text-slate-300 italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {tradeDisplay ? (
                          <span className="text-xs font-medium text-blue-700">{tradeDisplay}</span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isTradeOnly ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <EyeOff className="w-2.5 h-2.5" /> Trade Only
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                            <Eye className="w-2.5 h-2.5" /> Public
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        {r.product_type ? (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {r.product_type.replace(/_/g, ' ')}
                          </span>
                        ) : r.ac_type ? (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{r.ac_type}</span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`flex items-center gap-1 text-xs ${(r.product_images?.length ?? 0) > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                          <ImageIcon className="w-3 h-3" />
                          {r.product_images?.length ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {r.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-xs">
                          <a href={`/admin/products/${r.id}/edit`} className="text-blue-600 hover:underline font-medium">Edit</a>
                          <span className="text-slate-200">|</span>
                          <a href={`/products/${r.slug}`} target="_blank" className="text-slate-400 hover:text-slate-600">View</a>
                          <span className="text-slate-200">|</span>
                          <DuplicateButton id={r.id} entity="products" label={r.name} editBasePath="/admin/products" />
                          <span className="text-slate-200">|</span>
                          <DeleteButton id={r.id} entity="products" label={r.name} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
          <p className="text-slate-400 font-medium">
            {activeFilters > 0 ? 'No products match your filters.' : 'No products yet.'}
          </p>
          {!activeFilters && (
            <a href="/admin/products/new" className="mt-2 inline-block text-blue-600 hover:underline font-medium text-sm">
              Add your first product
            </a>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <a
                href={buildUrl({ page: String(page - 1) })}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </a>
            )}
            {page < totalPages && (
              <a
                href={buildUrl({ page: String(page + 1) })}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
