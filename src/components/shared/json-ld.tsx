// LocalBusiness JSON-LD for homepage
export function LocalBusinessJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'THE AIRCONDITION SHOP',
    url: 'https://theairconditionshop.com',
    logo: 'https://theairconditionshop.com/logo.png',
    telephone: '+35679661889',
    email: 'support@theairconditionshop.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '220 Vjal L-Indipendenza',
      addressLocality: 'Mosta',
      postalCode: 'MST 9022',
      addressCountry: 'MT',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 35.9075,
      longitude: 14.4257,
    },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '13:00' },
    ],
    sameAs: [
      'https://www.facebook.com/theairconditionshop',
      'https://www.instagram.com/theairconditionshop',
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Product JSON-LD
interface ProductJsonLdProps {
  name: string
  description?: string
  image?: string
  price?: number
  currency?: string
  sku?: string
  brand?: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  url: string
}

export function ProductJsonLd({ name, description, image, price, currency = 'EUR', sku, brand, availability = 'InStock', url }: ProductJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    url,
  }
  if (description) data.description = description
  if (image)       data.image = image
  if (sku)         data.sku = sku
  if (brand)       data.brand = { '@type': 'Brand', name: brand }
  if (price != null) {
    data.offers = {
      '@type': 'Offer',
      priceCurrency: currency,
      price: price.toFixed(2),
      availability: `https://schema.org/${availability}`,
      seller: { '@type': 'Organization', name: 'THE AIRCONDITION SHOP' },
    }
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// BreadcrumbList JSON-LD
export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
