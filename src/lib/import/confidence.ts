/**
 * Confidence Scoring Engine
 *
 * Scores (0–100) indicate how certain we are that:
 * (a) the match is correct, OR
 * (b) the extracted data is complete enough to import safely.
 *
 * Thresholds:
 *  95–100  Exact SKU match
 *  85–94   Model number match
 *  70–84   Name similarity / partial match
 *  < 70    Needs manual review — NEVER auto-import
 */

import type { ParsedProduct } from '@/services/ai/gemini-product-parser'
import type { NormalisedBrand }    from './brand-normaliser'
import type { NormalisedCategory } from './category-normaliser'

export type MatchType = 'sku' | 'model' | 'name' | null

export interface ConfidenceResult {
  score:   number
  reason:  string
  action:  'create' | 'update' | 'skip' | 'review'
}

interface ConfidenceOpts {
  matchType:           MatchType
  isNewProduct:        boolean
  pdfType:             'catalogue' | 'price_list'
  parsed:              ParsedProduct
  normalisedBrand:     NormalisedBrand
  normalisedCategory:  NormalisedCategory
}

export function computeConfidence(opts: ConfidenceOpts): ConfidenceResult {
  const { matchType, isNewProduct, pdfType, parsed, normalisedBrand, normalisedCategory } = opts

  // ── Existing product match ─────────────────────────────────────────────
  if (!isNewProduct && matchType) {
    const base = matchType === 'sku'   ? 97
               : matchType === 'model' ? 90
               :                        75

    const reason = matchType === 'sku'
      ? `Exact SKU match — ${parsed.sku}`
      : matchType === 'model'
      ? `Model number match — ${parsed.model}`
      : `Product name match — ${parsed.name}`

    return { score: base, reason, action: base >= 70 ? 'update' : 'review' }
  }

  // ── Catalogue skip (no match) ──────────────────────────────────────────
  if (pdfType === 'catalogue' && isNewProduct) {
    return {
      score:  85,
      reason: 'No existing product found — catalogue cannot create new products',
      action: 'skip',
    }
  }

  // ── Price list create ──────────────────────────────────────────────────
  // Deduct points for missing critical fields
  let score = 80
  const reasons: string[] = []

  if (!parsed.name?.trim())  { score -= 30; reasons.push('missing name') }
  if (!parsed.sku && !parsed.model) { score -= 15; reasons.push('no SKU or model') }
  if (parsed.price == null)  { score -= 10; reasons.push('no price') }
  if (!normalisedBrand.known)  { score -= 5;  reasons.push(`unknown brand "${parsed.brand}"`) }
  if (!normalisedCategory.known) { score -= 5; reasons.push(`unknown category "${parsed.category}"`) }

  // Extra penalty for truly sparse records
  const fieldCount = [parsed.name, parsed.sku, parsed.model, parsed.brand, parsed.category]
    .filter(Boolean).length
  if (fieldCount < 2) { score -= 15; reasons.push('very sparse data') }

  score = Math.max(0, Math.min(100, score))

  const reason = reasons.length
    ? `New product — deductions: ${reasons.join(', ')}`
    : 'New product — all critical fields present'

  const action: ConfidenceResult['action'] = score < 70 ? 'review' : 'create'

  return { score, reason, action }
}

export function confidenceBadgeClass(score: number): string {
  if (score >= 90) return 'bg-green-100 text-green-700'
  if (score >= 70) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-600'
}

export function confidenceLabel(score: number): string {
  if (score >= 90) return 'High'
  if (score >= 70) return 'Medium'
  return 'Low'
}
