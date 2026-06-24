export const AC_TYPES = [
  'Wall Mounted Split',
  'Floor Standing',
  'Ceiling Cassette',
  'Ceiling Concealed Duct',
  'Floor Ceiling',
  'Multi Split',
  'VRF',
  'Portable',
  'Other',
] as const

export type AcType = typeof AC_TYPES[number]
