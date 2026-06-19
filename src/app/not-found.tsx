import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { SearchX } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 flex items-center">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <SearchX className="w-7 h-7 text-slate-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">404 — Not Found</h1>
          <p className="text-slate-500 text-lg mb-8">
            We couldn&apos;t find that page. It may have moved or been removed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/"><Button variant="brand" size="lg">Go to Homepage</Button></Link>
            <Link href="/products"><Button variant="outline" size="lg">Browse Products</Button></Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
