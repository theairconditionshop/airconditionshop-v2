import type { Product, UserRole } from '@/types/database'

export interface PriceResult {
  price: number | null
  label: string
  isTrade: boolean
  discountPct?: number
  originalPrice: number | null
  savingsAmount: number | null
  saleDiscountPct: number | null
}

/**
 * Returns true when pricing must be hidden from this user.
 *
 * Priority:
 *  1. price_visibility field (explicit, future-proof)
 *  2. product_type === 'installation_material' legacy fallback
 */
export function shouldHidePrice(product: Product, role: UserRole | null): boolean {
  const isTradeUser = role === 'trade' || role === 'admin' || role === 'super_admin'
  if (isTradeUser) return false

  // Explicit field takes priority over product_type heuristic
  if (product.price_visibility === 'trade_only') return true
  if (product.price_visibility === 'public') return false

  // Legacy fallback for products created before price_visibility existed
  return product.product_type === 'installation_material'
}

export function resolvePrice(product: Product, role: UserRole | null): PriceResult {
  const isTradeUser = role === 'trade' || role === 'admin' || role === 'super_admin'

  if (isTradeUser) {
    if (product.trade_price_mode === 'fixed' && product.trade_price != null) {
      return {
        price: product.trade_price,
        label: 'Trade Price',
        isTrade: true,
        originalPrice: null,
        savingsAmount: null,
        saleDiscountPct: null,
      }
    }

    if (
      product.trade_price_mode === 'discount' &&
      product.trade_discount_pct != null &&
      product.original_price != null
    ) {
      const discounted = product.original_price * (1 - product.trade_discount_pct / 100)
      return {
        price: Math.round(discounted * 100) / 100,
        label: 'Trade Price',
        isTrade: true,
        discountPct: product.trade_discount_pct,
        originalPrice: null,
        savingsAmount: null,
        saleDiscountPct: null,
      }
    }

    // Fallback: retail_price for accessories imported without original_price
    if (product.retail_price != null) {
      return {
        price: product.retail_price,
        label: 'Trade Price',
        isTrade: true,
        originalPrice: null,
        savingsAmount: null,
        saleDiscountPct: null,
      }
    }
  }

  // Sale pricing
  if (product.sale_price != null) {
    const rrp     = product.original_price
    const savings = rrp != null ? Math.round((rrp - product.sale_price) * 100) / 100 : null
    const pct     = rrp != null && rrp > 0
      ? Math.round(((rrp - product.sale_price) / rrp) * 100)
      : null
    return {
      price: product.sale_price,
      label: 'Sale Price',
      isTrade: false,
      originalPrice: rrp ?? null,
      savingsAmount: savings,
      saleDiscountPct: pct,
    }
  }

  return {
    price: product.original_price,
    label: 'Price',
    isTrade: false,
    originalPrice: null,
    savingsAmount: null,
    saleDiscountPct: null,
  }
}

export function formatPrice(price: number | null, currency = 'EUR'): string {
  if (price == null) return 'Contact for price'
  return new Intl.NumberFormat('en-MT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price)
}
