/**
 * Brand Normaliser
 * Prevents duplicate brands by mapping AI-generated strings to canonical names.
 * Unknown brands are flagged for review — never created automatically.
 */

// Maps lowercase normalised input → canonical brand name
const BRAND_ALIASES: Record<string, string> = {
  // Daikin
  'daikin':                  'Daikin',
  'daikin europe':           'Daikin',
  'daikin ac':               'Daikin',
  'daikin air':              'Daikin',
  'daikin industries':       'Daikin',

  // Mitsubishi Electric
  'mitsubishi electric':     'Mitsubishi Electric',
  'mitsubishi':              'Mitsubishi Electric',
  'mse':                     'Mitsubishi Electric',
  'msz':                     'Mitsubishi Electric',

  // Mitsubishi Heavy Industries
  'mitsubishi heavy':        'Mitsubishi Heavy Industries',
  'mitsubishi heavy industries': 'Mitsubishi Heavy Industries',
  'mhi':                     'Mitsubishi Heavy Industries',

  // Fujitsu
  'fujitsu':                 'Fujitsu',
  'fujitsu general':         'Fujitsu General',
  'fujitsu general limited': 'Fujitsu General',

  // LG
  'lg':                      'LG',
  'lg electronics':          'LG',

  // Samsung
  'samsung':                 'Samsung',
  'samsung electronics':     'Samsung',

  // Panasonic
  'panasonic':               'Panasonic',

  // Hitachi
  'hitachi':                 'Hitachi',
  'hitachi cooling':         'Hitachi',
  'hitachi johnson controls':'Hitachi',

  // Toshiba
  'toshiba':                 'Toshiba',
  'toshiba air conditioning':'Toshiba',

  // Carrier
  'carrier':                 'Carrier',
  'carrier corporation':     'Carrier',

  // Gree
  'gree':                    'Gree',
  'gree electric':           'Gree',

  // Midea
  'midea':                   'Midea',
  'midea group':             'Midea',

  // Haier
  'haier':                   'Haier',

  // Hisense
  'hisense':                 'Hisense',

  // Trane
  'trane':                   'Trane',
  'trane technologies':      'Trane',

  // Lennox
  'lennox':                  'Lennox',
  'lennox international':    'Lennox',

  // York
  'york':                    'York',
  'york international':      'York',

  // Bosch
  'bosch':                   'Bosch',
  'bosch thermotechnology':  'Bosch',

  // Vaillant
  'vaillant':                'Vaillant',

  // Grunaire
  'grunaire':                'Grunaire',

  // Midea / Comfee variants
  'comfee':                  'Comfee',

  // APG
  'apg':                     'APG',

  // Generic / no brand
  'oem':                     'OEM',
  'generic':                 'Generic',
  'no brand':                'Generic',
  'unbranded':               'Generic',
}

export interface NormalisedBrand {
  canonical: string | null
  original:  string | null
  known:     boolean
}

export function normaliseBrand(raw: string | null): NormalisedBrand {
  if (!raw?.trim()) return { canonical: null, original: null, known: false }

  const key = raw.toLowerCase().trim()
    .replace(/[^a-z0-9\s\-]/g, '')
    .replace(/\s+/g, ' ')

  // Exact match
  if (BRAND_ALIASES[key]) {
    return { canonical: BRAND_ALIASES[key], original: raw, known: true }
  }

  // Check if any known brand name is contained in the input (e.g. "Daikin VRV")
  for (const [alias, canonical] of Object.entries(BRAND_ALIASES)) {
    if (key.startsWith(alias) || alias.startsWith(key)) {
      return { canonical, original: raw, known: true }
    }
  }

  // Unknown brand — flag for review
  return { canonical: null, original: raw, known: false }
}

// Return the canonical set of known brand names for lookup
export function getKnownBrandNames(): string[] {
  return [...new Set(Object.values(BRAND_ALIASES))]
}
