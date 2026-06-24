/**
 * Category Normaliser
 * Maps AI-generated category strings to canonical site categories.
 * Unknown categories are flagged for review — never created automatically.
 */

export const CANONICAL_CATEGORIES = [
  'Wall Mounted Air Conditioners',
  'Ducted Air Conditioners',
  'Ceiling Cassette Air Conditioners',
  'Ceiling Suspended Air Conditioners',
  'Floor Standing Air Conditioners',
  'Portable Air Conditioners',
  'Multi Split Systems',
  'VRF Systems',
  'Heat Pumps',
  'Ventilation Systems',
  'Refrigeration Products',
  'Copper Pipes',
  'Drainage Components',
  'Insulation',
  'HVAC Tools',
  'Accessories',
] as const

export type CanonicalCategory = typeof CANONICAL_CATEGORIES[number]

// Maps normalised AI strings → canonical category
const CATEGORY_MAP: Record<string, CanonicalCategory> = {
  // Wall Mounted
  'wall mounted split':           'Wall Mounted Air Conditioners',
  'wall mounted ac':              'Wall Mounted Air Conditioners',
  'wall mounted air conditioner': 'Wall Mounted Air Conditioners',
  'wall mounted':                 'Wall Mounted Air Conditioners',
  'split ac':                     'Wall Mounted Air Conditioners',
  'split type ac':                'Wall Mounted Air Conditioners',
  'split system':                 'Wall Mounted Air Conditioners',
  'wall split':                   'Wall Mounted Air Conditioners',
  'room air conditioner':         'Wall Mounted Air Conditioners',
  'mini split':                   'Wall Mounted Air Conditioners',
  'mini-split':                   'Wall Mounted Air Conditioners',
  'air conditioner':              'Wall Mounted Air Conditioners',
  'air conditioning':             'Wall Mounted Air Conditioners',

  // Ducted
  'ducted ac':                    'Ducted Air Conditioners',
  'duct type ac':                 'Ducted Air Conditioners',
  'ducted system':                'Ducted Air Conditioners',
  'ceiling concealed duct':       'Ducted Air Conditioners',
  'concealed duct':               'Ducted Air Conditioners',
  'ducted air conditioner':       'Ducted Air Conditioners',
  'slim duct':                    'Ducted Air Conditioners',

  // Cassette
  'cassette':                     'Ceiling Cassette Air Conditioners',
  'ceiling cassette':             'Ceiling Cassette Air Conditioners',
  'ceiling cassette ac':          'Ceiling Cassette Air Conditioners',
  '4-way cassette':               'Ceiling Cassette Air Conditioners',
  '4 way cassette':               'Ceiling Cassette Air Conditioners',
  'cassette type':                'Ceiling Cassette Air Conditioners',

  // Ceiling Suspended
  'ceiling suspended':            'Ceiling Suspended Air Conditioners',
  'ceiling suspended ac':         'Ceiling Suspended Air Conditioners',
  'ceiling suspended unit':       'Ceiling Suspended Air Conditioners',
  'high wall':                    'Ceiling Suspended Air Conditioners',

  // Floor Standing
  'floor standing':               'Floor Standing Air Conditioners',
  'floor standing ac':            'Floor Standing Air Conditioners',
  'floor console':                'Floor Standing Air Conditioners',
  'floor ceiling':                'Floor Standing Air Conditioners',
  'floor mounted':                'Floor Standing Air Conditioners',
  'column type':                  'Floor Standing Air Conditioners',

  // Portable
  'portable ac':                  'Portable Air Conditioners',
  'portable air conditioner':     'Portable Air Conditioners',
  'portable':                     'Portable Air Conditioners',
  'portable unit':                'Portable Air Conditioners',

  // Multi Split
  'multi split':                  'Multi Split Systems',
  'multi-split':                  'Multi Split Systems',
  'multi split system':           'Multi Split Systems',
  'multi system':                 'Multi Split Systems',
  'multi zone':                   'Multi Split Systems',

  // VRF
  'vrf':                          'VRF Systems',
  'vrf system':                   'VRF Systems',
  'vrv':                          'VRF Systems',
  'vrv system':                   'VRF Systems',
  'variable refrigerant flow':    'VRF Systems',
  'variable refrigerant volume':  'VRF Systems',

  // Heat Pumps
  'heat pump':                    'Heat Pumps',
  'air source heat pump':         'Heat Pumps',
  'air to water heat pump':       'Heat Pumps',
  'air-to-water heat pump':       'Heat Pumps',
  'monobloc heat pump':           'Heat Pumps',

  // Ventilation
  'ventilation':                  'Ventilation Systems',
  'ventilation fan':              'Ventilation Systems',
  'hrv':                          'Ventilation Systems',
  'erv':                          'Ventilation Systems',
  'heat recovery ventilation':    'Ventilation Systems',
  'fresh air unit':               'Ventilation Systems',
  'energy recovery ventilator':   'Ventilation Systems',
  'mechanical ventilation':       'Ventilation Systems',

  // Refrigeration
  'refrigeration':                'Refrigeration Products',
  'cold room':                    'Refrigeration Products',
  'chiller':                      'Refrigeration Products',
  'cold storage':                 'Refrigeration Products',
  'display case':                 'Refrigeration Products',
  'condensing unit':              'Refrigeration Products',

  // Copper Pipes
  'copper pipe':                  'Copper Pipes',
  'copper pipes':                 'Copper Pipes',
  'copper tube':                  'Copper Pipes',
  'copper tubes':                 'Copper Pipes',
  'copper tubing':                'Copper Pipes',
  'copper piping':                'Copper Pipes',
  'refrigerant pipe':             'Copper Pipes',
  'refrigerant piping':           'Copper Pipes',
  'ac pipe':                      'Copper Pipes',
  'ac piping':                    'Copper Pipes',

  // Drainage
  'drain':                        'Drainage Components',
  'drainage':                     'Drainage Components',
  'drain components':             'Drainage Components',
  'condensate pump':              'Drainage Components',
  'drain pump':                   'Drainage Components',
  'condensate drain':             'Drainage Components',
  'drain pipe':                   'Drainage Components',

  // Insulation
  'insulation':                   'Insulation',
  'pipe insulation':              'Insulation',
  'foam insulation':              'Insulation',
  'insulating pipe':              'Insulation',
  'thermal insulation':           'Insulation',
  'armaflex':                     'Insulation',
  'lagging':                      'Insulation',

  // Tools
  'tool':                         'HVAC Tools',
  'tools':                        'HVAC Tools',
  'hvac tool':                    'HVAC Tools',
  'hvac tools':                   'HVAC Tools',
  'refrigeration tool':           'HVAC Tools',
  'refrigeration tools':          'HVAC Tools',
  'manifold gauge':               'HVAC Tools',
  'vacuum pump':                  'HVAC Tools',
  'flaring tool':                 'HVAC Tools',
  'pipe bender':                  'HVAC Tools',
  'leak detector':                'HVAC Tools',
  'digital manifold':             'HVAC Tools',

  // Accessories
  'accessory':                    'Accessories',
  'accessories':                  'Accessories',
  'bracket':                      'Accessories',
  'wall bracket':                 'Accessories',
  'mounting bracket':             'Accessories',
  'remote control':               'Accessories',
  'controller':                   'Accessories',
  'wi-fi adapter':                'Accessories',
  'wifi adapter':                 'Accessories',
  'spare part':                   'Accessories',
  'spare parts':                  'Accessories',
  'line set':                     'Accessories',
  'flare nut':                    'Accessories',
  'service valve':                'Accessories',
}

export interface NormalisedCategory {
  canonical: CanonicalCategory | null
  original:  string | null
  known:     boolean
}

export function normaliseCategory(raw: string | null): NormalisedCategory {
  if (!raw?.trim()) return { canonical: null, original: null, known: false }

  const key = raw.toLowerCase().trim()
    .replace(/[^a-z0-9\s\-]/g, '')
    .replace(/\s+/g, ' ')

  // Exact match
  if (CATEGORY_MAP[key]) {
    return { canonical: CATEGORY_MAP[key], original: raw, known: true }
  }

  // Partial / substring match — find best
  for (const [alias, canonical] of Object.entries(CATEGORY_MAP)) {
    if (key.includes(alias) || alias.includes(key)) {
      return { canonical, original: raw, known: true }
    }
  }

  // Unknown category — flag for review, never create automatically
  return { canonical: null, original: raw, known: false }
}
