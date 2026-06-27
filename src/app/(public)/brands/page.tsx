import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getBrands } from '@/lib/data/queries'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import PageHeader from '@/components/shared/page-header'

export const revalidate = 300
export const metadata: Metadata = {
  title: 'Our Brands — Premium HVAC & Refrigeration',
  description: 'Explore the full range of HVAC, refrigeration and ventilation brands available from THE AIRCONDITION SHOP Malta.',
  alternates: { canonical: 'https://www.theairconditionshop.com/brands' },
}

export default async function BrandsPage() {
  const brands = await getBrands()
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <PageHeader eyebrow="What We Stock" title="Premium Brands We Stock" description="HVAC, refrigeration, ventilation and installation materials from leading manufacturers — with genuine parts, full warranty cover, and manufacturer-trained technicians." center />
          <div className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {brands.map(brand => (
              <Link key={brand.id} href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center justify-between p-5 sm:p-6 bg-white rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-lg transition-all duration-300 h-full min-h-[120px]">
                {/* Logo or name — fixed height zone for consistent alignment */}
                <div className="flex items-center justify-center h-14 w-full">
                  {brand.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brand.logo_url} alt={brand.name} loading="lazy" className="grayscale group-hover:grayscale-0 transition-all duration-300" style={{ height: '48px', width: 'auto', maxWidth: '100px', objectFit: 'contain' }} />
                  ) : (
                    <span className="text-base font-bold text-slate-700 group-hover:text-sky-700 text-center leading-tight">{brand.name}</span>
                  )}
                </div>
                <p className="mt-3 text-sm font-medium text-slate-500 group-hover:text-sky-600 flex items-center gap-1 transition-colors">
                  View products <ArrowRight className="w-3.5 h-3.5" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
