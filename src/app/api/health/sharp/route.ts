import { NextResponse } from 'next/server'

// TEMPORARY production diagnostic — verifies the image engine loads in the
// deployed runtime. Reports only versions and a truncated load error (no
// secrets, no paths beyond the module message). Remove after the image
// pipeline is confirmed working in production.
export const dynamic = 'force-dynamic'

export async function GET() {
  let sharpVersion: string | null = null
  let loadError: string | null = null
  try {
    const sharp = (await import('sharp')).default
    sharpVersion = (sharp as unknown as { versions?: { sharp?: string } }).versions?.sharp
      ?? 'loaded (version unknown)'
  } catch (err) {
    loadError = (err instanceof Error ? err.message : String(err)).slice(0, 500)
  }
  return NextResponse.json({
    node: process.version,
    platform: `${process.platform}-${process.arch}`,
    sharp: sharpVersion,
    sharpLoadError: loadError,
  })
}
