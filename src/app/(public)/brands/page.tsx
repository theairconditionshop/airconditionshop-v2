import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getBrands } from '@/lib/data/queries'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import PageHeader from '@/components/shared/page-header'

export const revalidate = 300
export const metadata: Metadata = {
  title: 'Our Brands — Daikin, Mitsubishi Electric, Panasonic & More',
  description: 'Authorised dealer for Daikin, Mitsubishi Electric, Panasonic, Toshiba, Fujitsu, Gree and more.',
  alternates: { canonical: 'https://theairconditionshop.com/brands' },
}

export default async function BrandsPage() {
  const brands = await getBrands()
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <PageHeader eyebrow="Authorised Dealer" title="Premium Brands We Stock" description="Authorised to supply and support Daikin, Mitsubishi Electric, Panasonic, Toshiba, Fujitsu and more — with genuine parts, full warranty cover, and manufacturer-trained technicians." center />
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {brands.map(brand => (
              <Link key={brand.id} href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-lg transition-all duration-300">
                {brand.logo_url ? (
                  <Image src={brand.logo_url} alt={brand.name} width={100} height={50} className="object-contain max-h-12 grayscale group-hover:grayscale-0 transition-all duration-300" />
                ) : (
                  <span className="text-xl font-bold text-slate-700 group-hover:text-sky-700">{brand.name}</span>
                )}
                <p className="mt-3 text-sm font-medium text-slate-600 group-hover:text-sky-600 flex items-center gap-1 transition-colors">
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
