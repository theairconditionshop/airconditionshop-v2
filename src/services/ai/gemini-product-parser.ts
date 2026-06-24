import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const MODEL = 'gemini-2.5-flash'

// ── Product Type taxonomy ─────────────────────────────────────────────────
export const PRODUCT_TYPES = [
  'Air Conditioner',
  'Heat Pump',
  'Ventilation',
  'Refrigeration',
  'Tool',
  'Accessory',
  'Copper Pipe',
  'Drainage',
  'Insulation',
  'Spare Part',
] as const
export type ProductType = typeof PRODUCT_TYPES[number]

// ── AC Type taxonomy ──────────────────────────────────────────────────────
export const AC_TYPES_IMPORT = [
  'Wall Mounted',
  'Ducted',
  'Cassette',
  'Floor Standing',
  'Ceiling Suspended',
  'Portable',
  'VRF',
  'Multi Split',
  'Other',
] as const
export type AcTypeImport = typeof AC_TYPES_IMPORT[number]

// ── Standard BTU classes ──────────────────────────────────────────────────
export const BTU_CLASSES = [9000, 12000, 18000, 24000, 36000, 48000] as const
export type BtuClass = typeof BTU_CLASSES[number]

// ── Core extracted product shape ──────────────────────────────────────────
export interface ParsedProduct {
  name:           string
  model:          string | null
  sku:            string | null
  brand:          string | null
  category:       string | null
  product_type:   ProductType | null
  ac_type:        AcTypeImport | null
  btu:            number | null
  description:    string | null
  specifications: Record<string, string>
  features:       string[]
  applications:   string[]
  price:          number | null
  cost_price:     number | null
  images:         string[]
}

// ── JSON extraction helper ────────────────────────────────────────────────
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (fenced) return fenced[1]
  const first = text.indexOf('{')
  const last  = text.lastIndexOf('}')
  if (first !== -1 && last !== -1) return text.slice(first, last + 1)
  return text.trim()
}

// ── Shared safety rules injected into every prompt ────────────────────────
const SAFETY_RULES = `
CRITICAL SAFETY RULES — these MUST be followed without exception:
1. Extract ONLY HVAC products: air conditioners, heat pumps, VRF systems, ventilation, refrigeration, copper pipes, insulation, drainage, HVAC tools and accessories.
2. Return null for ANY field that is not clearly and explicitly printed in the source document. NEVER invent or guess: BTU, energy ratings, SEER, SCOP, dimensions, refrigerant type, warranty, certifications, or capacity figures.
3. Preserve model numbers EXACTLY as printed — keep hyphens, spaces, slashes, and capitalisation.
4. Merge information that spans multiple pages into a single product record. If page 10 shows a product name and page 11 shows its specifications, they belong to the same product — return ONE entry, not two.
5. Do NOT create duplicate entries. If a model appears twice (e.g. in a summary table and a detail page), return it once with the most complete data.
6. Return ONLY valid compact JSON — no prose, no markdown outside the code block, no trailing commas.
7. Ignore: company pages, cover pages, warranty text, contact information, legal disclaimers, table of contents, marketing slogans.
`

const PRODUCT_TYPE_GUIDE = `
product_type must be one of: "Air Conditioner", "Heat Pump", "Ventilation", "Refrigeration", "Tool", "Accessory", "Copper Pipe", "Drainage", "Insulation", "Spare Part". Use null if genuinely uncertain.
ac_type must be one of: "Wall Mounted", "Ducted", "Cassette", "Floor Standing", "Ceiling Suspended", "Portable", "VRF", "Multi Split", "Other". Only fill if product_type is "Air Conditioner". Otherwise null.
btu: extract the cooling BTU/h figure as a number only (e.g. 12000, not "12,000 BTU/h"). Use null if not stated.
`

// ── Catalogue prompt ──────────────────────────────────────────────────────
const CATALOGUE_PROMPT = `You are an HVAC catalogue data extractor. Your task is to extract every HVAC product from this PDF catalogue.

${SAFETY_RULES}

${PRODUCT_TYPE_GUIDE}

specifications: key-value pairs of technical data only — BTU, kW, EER, SEER, SCOP, dimensions (HxWxD mm), indoor/outdoor noise (dB), refrigerant, voltage (V), operating temperature range, weight (kg), pipe size, power consumption, COP, etc.
features: bullet-point features that are explicitly listed or highlighted.
applications: where this product is typically used (e.g. "Residential rooms up to 50m²", "Small offices", "Retail spaces") — extract ONLY if explicitly stated, never invent.
description: a factual 2–4 sentence technical summary assembled from the printed text. Do not write marketing copy.

Return EXACTLY this JSON structure:
{
  "products": [
    {
      "name": "Full product name as printed",
      "model": "Model number exactly or null",
      "sku": null,
      "brand": "Brand name or null",
      "category": "e.g. Wall Mounted Split, Cassette AC, VRF System, Copper Pipe, or null",
      "product_type": "Air Conditioner",
      "ac_type": "Wall Mounted",
      "btu": 12000,
      "description": "Technical description or null",
      "specifications": {
        "Cooling Capacity": "3.5 kW",
        "Heating Capacity": "4.0 kW",
        "SEER": "8.5",
        "Refrigerant": "R-32",
        "Indoor Noise": "20 dB(A)",
        "Dimensions (HxWxD)": "290 x 798 x 215 mm"
      },
      "features": ["Inverter technology", "Wi-Fi control via app"],
      "applications": ["Living rooms up to 35m²"],
      "price": null,
      "cost_price": null,
      "images": []
    }
  ]
}`

// ── Price list prompt ─────────────────────────────────────────────────────
const PRICE_LIST_PROMPT = `You are an HVAC price list extractor. Extract every product and its pricing from this PDF.

${SAFETY_RULES}

${PRODUCT_TYPE_GUIDE}

PRICE EXTRACTION RULES:
- Extract numbers only — no currency symbols (e.g. 499.00 not €499.00).
- If two price columns exist: "price" = customer/retail/list price, "cost_price" = trade/cost/net price.
- If only one price column exists: use "price", set cost_price to null.
- If a product has size variants (9000 BTU, 12000 BTU, 18000 BTU): create a SEPARATE entry for each variant.
- Leave description, specifications, features, applications as null/empty — price lists do not enrich these fields.

Return EXACTLY this JSON structure:
{
  "products": [
    {
      "name": "Full product name as printed",
      "model": "Model number exactly or null",
      "sku": "SKU / Part number or null",
      "brand": "Brand name or null",
      "category": "Product category or null",
      "product_type": "Air Conditioner",
      "ac_type": "Wall Mounted",
      "btu": 12000,
      "description": null,
      "specifications": {},
      "features": [],
      "applications": [],
      "price": 499.00,
      "cost_price": 280.00,
      "images": []
    }
  ]
}`

// ── Detection prompt ──────────────────────────────────────────────────────
const DETECT_PROMPT = `Classify this PDF as either "catalogue" or "price_list".

"catalogue" = primarily product descriptions, specifications, technical data, features. Prices may be absent.
"price_list" = primarily a tabular list of products with prices and/or part numbers. Limited or no product descriptions.
"spec_sheet" (also classify as "catalogue") = detailed technical specifications for one or more products.

Respond with EXACTLY one word: catalogue  OR  price_list`

// ── Public API ────────────────────────────────────────────────────────────
export async function parseCataloguePdf(pdfBuffer: Buffer): Promise<ParsedProduct[]> {
  const model  = genAI.getGenerativeModel({ model: MODEL })
  const result = await model.generateContent([
    { inlineData: { mimeType: 'application/pdf', data: pdfBuffer.toString('base64') } },
    CATALOGUE_PROMPT,
  ])
  const text   = result.response.text()
  const parsed = JSON.parse(extractJson(text))
  return sanitiseProducts((parsed.products || []) as ParsedProduct[])
}

export async function parsePriceListPdf(pdfBuffer: Buffer): Promise<ParsedProduct[]> {
  const model  = genAI.getGenerativeModel({ model: MODEL })
  const result = await model.generateContent([
    { inlineData: { mimeType: 'application/pdf', data: pdfBuffer.toString('base64') } },
    PRICE_LIST_PROMPT,
  ])
  const text   = result.response.text()
  const parsed = JSON.parse(extractJson(text))
  return sanitiseProducts((parsed.products || []) as ParsedProduct[])
}

export async function detectPdfType(pdfBuffer: Buffer): Promise<'catalogue' | 'price_list'> {
  const model  = genAI.getGenerativeModel({ model: MODEL })
  const result = await model.generateContent([
    { inlineData: { mimeType: 'application/pdf', data: pdfBuffer.toString('base64') } },
    DETECT_PROMPT,
  ])
  const text = result.response.text().trim().toLowerCase()
  return text.includes('price') ? 'price_list' : 'catalogue'
}

// ── Sanitise / coerce Gemini output ──────────────────────────────────────
function sanitiseProducts(raw: Partial<ParsedProduct>[]): ParsedProduct[] {
  return raw
    .filter(p => p.name && typeof p.name === 'string' && p.name.trim().length > 0)
    .map(p => ({
      name:           (p.name ?? '').trim(),
      model:          p.model?.trim() || null,
      sku:            p.sku?.trim() || null,
      brand:          p.brand?.trim() || null,
      category:       p.category?.trim() || null,
      product_type:   validateEnum(p.product_type, PRODUCT_TYPES) as ProductType | null,
      ac_type:        validateEnum(p.ac_type, AC_TYPES_IMPORT) as AcTypeImport | null,
      btu:            typeof p.btu === 'number' ? Math.round(p.btu) : null,
      description:    p.description?.trim() || null,
      specifications: sanitiseRecord(p.specifications),
      features:       sanitiseStringArray(p.features),
      applications:   sanitiseStringArray(p.applications),
      price:          typeof p.price === 'number' ? Math.round(p.price * 100) / 100 : null,
      cost_price:     typeof p.cost_price === 'number' ? Math.round(p.cost_price * 100) / 100 : null,
      images:         [],
    }))
}

function validateEnum<T extends readonly string[]>(
  value: unknown,
  allowed: T,
): T[number] | null {
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) {
    return value as T[number]
  }
  return null
}

function sanitiseRecord(val: unknown): Record<string, string> {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
    if (typeof k === 'string' && (typeof v === 'string' || typeof v === 'number')) {
      out[k] = String(v)
    }
  }
  return out
}

function sanitiseStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return []
  return val.filter((v): v is string => typeof v === 'string' && v.trim().length > 0).map(s => s.trim())
}
