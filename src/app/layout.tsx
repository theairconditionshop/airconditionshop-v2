import type { Metadata } from 'next'
import { Inter, DM_Serif_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import { SpeedInsights } from '@vercel/speed-insights/next'
import RouteProgress from '@/components/layout/route-progress'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'THE AIRCONDITION SHOP | HVAC & Refrigeration Malta',
    template: '%s | THE AIRCONDITION SHOP',
  },
  description:
    'Premium HVAC, refrigeration, ventilation and installation materials supplier in Malta. Expert installation and service.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://theairconditionshop.com'),
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_MT',
    siteName: 'THE AIRCONDITION SHOP',
    title: 'THE AIRCONDITION SHOP | HVAC & Refrigeration Malta',
    description: 'Premium HVAC, refrigeration, ventilation and installation materials supplier in Malta.',
    images: [{ url: '/shop-logo.jpg', width: 1200, height: 1200, alt: 'THE AIRCONDITION SHOP' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'THE AIRCONDITION SHOP | HVAC & Refrigeration Malta',
    description: 'Premium HVAC, refrigeration, ventilation and installation materials supplier in Malta.',
    images: ['/shop-logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900 antialiased">
        <RouteProgress />
        {children}
        <Toaster richColors position="top-right" />
        <SpeedInsights />
      </body>
    </html>
  )
}
