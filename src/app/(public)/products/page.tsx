import type { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-slate-50/30">
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
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} userRole={userRole} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-slate-400" />
                  </div>
                  <h3 className="font-display text-xl text-slate-900 mb-2">No products found</h3>
                  <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                    Try adjusting your filters or{' '}
                    <Link href="/products" className="text-blue-600 hover:underline font-medium">browse all products</Link>.
                  </p>
                  <Link href="/contact"
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors duration-150">
                    Ask Our Team
                  </Link>
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
