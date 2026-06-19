import type { Metadata } from 'next'
import { getProducts, getCategories, getBrands } from '@/lib/data/queries'
import { getRole } from '@/lib/auth/session'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import ProductCard from '@/components/products/product-card'
import PageHeader from '@/components/shared/page-header'

export const revalidate = 300
export const metadata: Metadata = {
  title: 'Products — HVAC & Refrigeration',
  description: 'Browse our full range of air conditioners, refrigeration equipment, HVAC tools and accessories.',
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar filters */}
            <aside className="w-full lg:w-56 shrink-0">
              <div className="sticky top-24 space-y-6">

                {/* Categories */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Categories</p>
                  <nav className="space-y-1">
                    <a href="/products"
                      className={`block px-3 py-2 text-sm rounded-lg transition-colors ${!params.category ? 'bg-sky-50 text-sky-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                      All Products
                    </a>
                    {categories.map(cat => (
                      <a key={cat.id}
                        href={`/products?category=${cat.id}`}
                        className={`block px-3 py-2 text-sm rounded-lg transition-colors ${params.category === cat.id ? 'bg-sky-50 text-sky-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {cat.name}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Brands */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Brands</p>
                  <nav className="space-y-1">
                    {brands.map(brand => (
                      <a key={brand.id}
                        href={`/products?brand=${brand.id}`}
                        className={`block px-3 py-2 text-sm rounded-lg transition-colors ${params.brand === brand.id ? 'bg-sky-50 text-sky-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {brand.name}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6">
                <PageHeader
                  eyebrow="Our Range"
                  title={params.category ? categories.find(c => c.id === params.category)?.name || 'Products' : 'All Products'}
                  description={`${products.length} product${products.length !== 1 ? 's' : ''} found`}
                />
              </div>

              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} userRole={userRole} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <span className="text-5xl mb-4">🔍</span>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No products found</h3>
                  <p className="text-slate-500 text-sm">Try adjusting your filters or <a href="/products" className="text-sky-600 hover:underline">browse all products</a>.</p>
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
