import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, ArrowRight, Calculator, Phone } from 'lucide-react'
import { getProducts, getCategories, getBrands } from '@/lib/data/queries'
import { getRole } from '@/lib/auth/session'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import ProductCard from '@/components/products/product-card'
import ProductsFilters from '@/components/products/products-filters'

export const revalidate = 300
export const metadata: Metadata = {
  title: 'Products — HVAC & Refrigeration',
  description: 'Browse our full range of air conditioners, refrigeration equipment, HVAC tools and accessories.',
  alternates: { canonical: 'https://theairconditionshop.com/products' },
}

interface Props {
  searchParams: Promise<{ category?: string; brand?: string; search?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const [products, categories, brands, userRole] = await Promise.all([
    getProducts({
      categoryId: params.category,
      brandId: params.brand,
      search: params.search,
    }),
    getCategories(null),
    getBrands(),
    getRole(),
  ])

  const activeCategory = categories.find(c => c.id === params.category)
  const activeBrand    = brands.find(b => b.id === params.brand)
  const title = activeCategory?.name || activeBrand?.name || 'All Products'
  const isFiltered = !!(params.category || params.brand || params.search)

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-slate-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

          {/* Page title */}
          <div className="mb-6 lg:mb-10">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Our Range</p>
            <h1 className="font-display text-2xl lg:text-3xl text-slate-900">{title}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {products.length} product{products.length !== 1 ? 's' : ''} found
              {params.search && <span> for &ldquo;{params.search}&rdquo;</span>}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

            {/* Sidebar filters */}
            <ProductsFilters
              categories={categories}
              brands={brands}
              activeCategory={params.category}
              activeBrand={params.brand}
              activeSearch={params.search}
            />

            {/* Product grid */}
            <div className="flex-1 min-w-0">
              {products.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
                    {products.map(product => (
                      <ProductCard key={product.id} product={product} userRole={userRole} />
                    ))}
                  </div>

                  {/* Sparse-grid support strip — shown when fewer than 6 products */}
                  {products.length < 6 && !isFiltered && (
                    <div className="mt-8 grid sm:grid-cols-2 gap-4">
                      <Link href="/btu-calculator"
                        className="group flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-blue-100 hover:shadow-[0_8px_30px_-8px_rgba(14,165,233,0.12)] transition-all duration-200">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors">
                          <Calculator className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm">BTU Calculator</p>
                          <p className="text-xs text-slate-400 mt-0.5">Find the right size for your room</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
                      </Link>
                      <Link href="/quote"
                        className="group flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-blue-100 hover:shadow-[0_8px_30px_-8px_rgba(14,165,233,0.12)] transition-all duration-200">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors">
                          <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm">Request a Quote</p>
                          <p className="text-xs text-slate-400 mt-0.5">Free quote within 48 hours</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                    <Search className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="font-display text-xl text-slate-900 mb-2">No products found</h3>
                  <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-6">
                    Try adjusting your filters or{' '}
                    <Link href="/products" className="text-blue-600 hover:underline font-medium">browse all products</Link>.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/products"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors duration-150">
                      View All Products
                    </Link>
                    <Link href="/contact"
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 hover:border-blue-200 hover:text-blue-700 text-sm font-semibold rounded-xl transition-colors duration-150">
                      Ask Our Team
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
