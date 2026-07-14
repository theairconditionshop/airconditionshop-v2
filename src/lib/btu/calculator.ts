// BTU cooling-load calculator.
//
// STRICT RULE: all calculation is done in FEET. Metric inputs are converted to
// feet first (1 m = 3.281 ft), then:
//     volume_ft3 = length_ft × width_ft × height_ft
//     BTU        = volume_ft3 × 7.5
// The result is rounded to a whole number — decimals are never shown to users.
//
// Worked example (4 m × 4 m × 3 m):
//   13.124 ft × 13.124 ft × 9.843 ft = 1695.35 ft³ × 7.5 = 12,715 BTU

export const M_TO_FT = 3.281
const BTU_PER_CUBIC_FT = 7.5

// Standard AC capacities we recommend from, in BTU/hr (ascending).
export const AC_CAPACITIES = [9000, 12000, 18000, 24000, 36000, 48000] as const

/** Room dimensions, always in FEET. */
export interface BtuInputs {
  length: number
  width: number
  height: number
}

export interface BtuResult {
  /** Calculated cooling load, whole BTU/hr. */
  btu: number
  /** Smallest standard AC capacity ≥ the calculated load. */
  recommendedCapacity: number
}

/** 1 metre = 3.281 feet (spec-mandated factor). */
export function metresToFeet(metres: number): number {
  return metres * M_TO_FT
}

export function calculateBtu({ length, width, height }: BtuInputs): BtuResult {
  const volumeFt3 = length * width * height          // full floating-point precision
  const btu = Math.round(volumeFt3 * BTU_PER_CUBIC_FT)

  // Nearest suitable capacity = smallest standard size that meets or exceeds
  // the requirement. Anything above the largest size falls back to the largest.
  const recommendedCapacity =
    AC_CAPACITIES.find(c => c >= btu) ?? AC_CAPACITIES[AC_CAPACITIES.length - 1]

  return { btu, recommendedCapacity }
}
