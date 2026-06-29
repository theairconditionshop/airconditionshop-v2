import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.theairconditionshop.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/account/', '/trade/dashboard', '/login', '/register', '/reset-password', '/verify-otp'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
