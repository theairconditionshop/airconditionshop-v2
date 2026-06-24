import type { ParsedProduct } from '@/services/ai/gemini-product-parser'
import { computeConfidence } from './confidence'
import { normaliseBrand } from './brand-normaliser'
import { normaliseCategory } from './category-normaliser'

export interface ProductStub {
  id:           string
  sku:          string | null
  model_number: string | null
  name:         string
}

export interface ProductLookup {
  bySku:   Map<string, string>
  byModel: Map<string, string>
  byName:  Map<string, string>
}

export function buildLookup(products: ProductStub[]): ProductLookup {
  const bySku   = new Map<string, string>()
  const byModel = new Map<string, string>()
  const byName  = new Map<string, string>()

  for (const p of products) {
    if (p.sku)          bySku.set(p.sku.toLowerCase().trim(), p.id)
    if (p.model_number) byModel.set(p.model_number.toLowerCase().trim(), p.id)
    byName.set(p.name.toLowerCase().trim(), p.id)
  }

  return { bySku, byModel, byName }
}

export interface MatchResult {
  product_id:         string | null
  match_type:         'sku' | 'model' | 'name' | null
  action:             'create' | 'update' | 'skip' | 'review'
  confidence_score:   number
  confidence_reason:  string
  normalised_brand:   string | null
  normalised_category: string | null
}

export function matchProduct(
  parsed: ParsedProduct,
  lookup: ProductLookup,
  pdfType: 'catalogue' | 'price_list',
): MatchResult {
  const nb = normaliseBrand(parsed.brand)
  const nc = normaliseCategory(parsed.category)

  let product_id: string | null = null
  let match_type: 'sku' | 'model' | 'name' | null = null

  if (parsed.sku) {
    const id = lookup.bySku.get(parsed.sku.toLowerCase().trim())
    if (id) { product_id = id; match_type = 'sku' }
  }

  if (!product_id && parsed.model) {
    const id = lookup.byModel.get(parsed.model.toLowerCase().trim())
    if (id) { product_id = id; match_type = 'model' }
  }

  if (!product_id && parsed.name) {
    const id = lookup.byName.get(parsed.name.toLowerCase().trim())
    if (id) { product_id = id; match_type = 'name' }
  }

  const conf = computeConfidence({
    matchType:         match_type,
    isNewProduct:      product_id === null,
    pdfType,
    parsed,
    normalisedBrand:   nb,
    normalisedCategory: nc,
  })

  return {
    product_id,
    match_type,
    action:             conf.action,
    confidence_score:   conf.score,
    confidence_reason:  conf.reason,
    normalised_brand:   nb.canonical,
    normalised_category: nc.canonical,
  }
}
