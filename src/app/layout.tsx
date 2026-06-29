import type { Metadata } from 'next'
import { Inter, DM_Serif_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import { SpeedInsights } from '@vercel/speed-insights/next'
import RouteProgress from '@/components/layout/route-progress'
import PromoBanner from '@/components/layout/promo-banner'
import { getSiteSettings } from '@/lib/data/queries'
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
    default: 'Air Conditioners, Heat Pumps & HVAC Solutions in Malta',
    template: '%s | THE AIRCONDITION SHOP Malta',
  },
  description:
    "THE AIRCONDITION SHOP — Malta's trusted supplier and installer of air conditioners, heat pumps, ventilation and commercial refrigeration. F-Gas certified engineers. All Malta.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.theairconditionshop.com'),
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.jpg', sizes: '180x180', type: 'image/jpeg' },
    shortcut: '/icon-192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_MT',
    siteName: 'THE AIRCONDITION SHOP',
    title: 'Air Conditioners, Heat Pumps & HVAC Solutions in Malta',
    description: 'Supply and installation of Daikin, Gree, Fujitsu and other leading air conditioning and HVAC systems for homes, offices and commercial buildings across Malta.',
    images: [{ url: '/shop-logo.jpg', width: 1200, height: 1200, alt: 'THE AIRCONDITION SHOP — Air Conditioning & HVAC Malta' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Air Conditioners & HVAC Malta — THE AIRCONDITION SHOP',
    description: "Malta's trusted HVAC supplier and installer. Air conditioners, heat pumps, ventilation, refrigeration. F-Gas certified engineers. All Malta.",
    images: ['/shop-logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  other: {
    'theme-color': '#2563EB',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const promoBanner = (settings.promo_banner as Record<string, unknown>) ?? {}
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : null

  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable} h-full`}>
      <head>
        {supabaseHostname && (
          <>
            <link rel="preconnect" href={`https://${supabaseHostname}`} />
            <link rel="dns-prefetch" href={`https://${supabaseHostname}`} />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900 antialiased">
        {/* Skip to main content — WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:text-sm focus:font-semibold focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <RouteProgress />
        <PromoBanner data={promoBanner as Parameters<typeof PromoBanner>[0]['data']} />
        {children}
        <Toaster richColors position="top-right" />
        <SpeedInsights />
      </body>
    </html>
  )
}
