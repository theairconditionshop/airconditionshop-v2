export type RoomType = 'bedroom' | 'living' | 'kitchen' | 'office' | 'commercial'
export type Occupancy = '1-2' | '3-5' | '6+'
export type SunExposure = 'shaded' | 'partial' | 'full_sun'

export interface BtuInputs {
  length: number     // metres
  width: number      // metres
  height: number     // metres
  roomType: RoomType
  occupancy: Occupancy
  sunExposure: SunExposure
}

export interface BtuResult {
  btu: number
  kw: number
  recommendedBtuRange: { min: number; max: number }
}

const ROOM_TYPE_MULTIPLIER: Record<RoomType, number> = {
  bedroom: 1.0,
  living: 1.0,
  office: 1.1,
  kitchen: 1.25,
  commercial: 1.4,
}

const OCCUPANCY_MULTIPLIER: Record<Occupancy, number> = {
  '1-2': 1.0,
  '3-5': 1.1,
  '6+': 1.2,
}

const SUN_MULTIPLIER: Record<SunExposure, number> = {
  shaded: 1.0,
  partial: 1.1,
  full_sun: 1.2,
}

export function calculateBtu(inputs: BtuInputs): BtuResult {
  const volume = inputs.length * inputs.width * inputs.height
  const baseBtu = volume * 337

  const multiplier =
    ROOM_TYPE_MULTIPLIER[inputs.roomType] *
    OCCUPANCY_MULTIPLIER[inputs.occupancy] *
    SUN_MULTIPLIER[inputs.sunExposure]

  const btu = Math.ceil(baseBtu * multiplier)
  const kw = Math.round((btu / 3412) * 10) / 10

  return {
    btu,
    kw,
    recommendedBtuRange: {
      min: Math.round(btu * 0.9 / 500) * 500,
      max: Math.round(btu * 1.1 / 500) * 500,
    },
  }
}
