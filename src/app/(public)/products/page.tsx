import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getCategoriesWithCount, getBrandsWithCount, getActiveAcTypes } from '@/lib/data/queries'
import { getRole } from '@/lib/auth/session'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import ProductsFilters from '@/components/products/products-filters'
import ProductGrid from './ProductGrid'
import FilterChipsWrapper from './FilterChipsWrapper'
import { ProductGridSkeleton } from '@/components/ui/skeleton'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Products — HVAC & Refrigeration',
  description: 'Browse our full range of air conditioners, refrigeration equipment, HVAC tools and accessories.',
  alternates: { canonical: 'https://theairconditionshop.com/products' },
}

interface Props {
  searchParams: Promise<{ category?: string; brand?: string; search?: string; ac_type?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams

  const [categories, brands, acTypes, userRole] = await Promise.all([
    getCategoriesWithCount(),
    getBrandsWithCount(),
    getActiveAcTypes(),
    getRole(),
  ])

  const activeCategory = categories.find(c => c.id === params.category)
  const activeBrand    = brands.find(b => b.id === params.brand)

  const pageTitle =
    activeCategory?.name ||
    activeBrand?.name ||
    (params.ac_type ? `${params.ac_type} Units` : 'All Products')

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-slate-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

          {/* Page title */}
          <div className="mb-6 lg:mb-8">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Our Range</p>
            <h1 className="font-display text-2xl lg:text-3xl text-slate-900">{pageTitle}</h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

            {/* Sidebar + mobile filter toggle */}
            <ProductsFilters
              categories={categories}
              brands={brands}
              acTypes={acTypes}
              activeCategory={params.category}
              activeBrand={params.brand}
              activeSearch={params.search}
              activeAcType={params.ac_type}
            />

            {/* Product grid — Suspense boundary means only this re-renders on filter changes */}
            <div className="flex-1 min-w-0">
              <FilterChipsWrapper
                categories={categories}
                brands={brands}
                activeCategory={params.category}
                activeBrand={params.brand}
                activeSearch={params.search}
                activeAcType={params.ac_type}
              />
              <Suspense
                key={`${params.category}-${params.brand}-${params.search}-${params.ac_type}`}
                fallback={<ProductGridSkeleton count={12} />}
              >
                <ProductGrid
                  categoryId={params.category}
                  brandId={params.brand}
                  search={params.search}
                  acType={params.ac_type}
                  userRole={userRole}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
