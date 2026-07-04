import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getBrands } from '@/lib/data/queries'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import PageHeader from '@/components/shared/page-header'
import { Stagger, StaggerItem } from '@/components/motion/primitives'

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
      <main id="main-content" className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <PageHeader eyebrow="What We Stock" title="Premium Brands We Stock" description="HVAC, refrigeration, ventilation and installation materials from leading manufacturers — with genuine parts, full warranty cover, and manufacturer-trained technicians." center />
          <Stagger className="mt-12 sm:mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200" gap={0.04}>
            {brands.map(brand => (
              <StaggerItem key={brand.id} className="h-full">
                <Link href={`/brands/${brand.slug}`}
                  className="group flex flex-col items-center justify-between p-6 sm:p-8 bg-white hover:bg-slate-50/70 transition-colors duration-300 h-full min-h-[140px]">
                  {/* Logo or name — fixed height zone for consistent alignment */}
                  <div className="flex items-center justify-center h-14 w-full">
                    {brand.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={brand.logo_url} alt={brand.name} loading="lazy" className="grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" style={{ height: '48px', width: 'auto', maxWidth: '100px', objectFit: 'contain' }} />
                    ) : (
                      <span className="text-base font-bold text-slate-500 group-hover:text-slate-900 text-center leading-tight transition-colors">{brand.name}</span>
                    )}
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400 group-hover:text-blue-600 flex items-center gap-1 transition-colors duration-300">
                    View products <ArrowRight className="w-3 h-3" />
                  </p>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </main>
      <Footer />
    </>
  )
}
