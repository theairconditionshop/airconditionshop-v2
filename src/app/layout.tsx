import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'THE AIRCONDITION SHOP | HVAC & Refrigeration Malta',
    template: '%s | THE AIRCONDITION SHOP',
  },
  description:
    'Premium air conditioning, refrigeration and HVAC solutions in Malta. Authorised dealer for Daikin, Mitsubishi Electric, Panasonic and more. Expert installation and service.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://theairconditionshop.com'),
  openGraph: {
    type: 'website',
    locale: 'en_MT',
    siteName: 'THE AIRCONDITION SHOP',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900 antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
