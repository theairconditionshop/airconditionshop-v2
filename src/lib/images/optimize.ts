import type SharpType from 'sharp'

// Lazy-load sharp so a native-module load failure surfaces as a readable
// runtime error from the calling route instead of a module-load 500 that
// takes down every route importing this file.
let sharpModule: typeof SharpType | null = null
async function getSharp(): Promise<typeof SharpType> {
  if (!sharpModule) {
    try {
      sharpModule = (await import('sharp')).default
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      throw new Error(`Image engine unavailable (sharp failed to load): ${msg}`)
    }
  }
  return sharpModule
}

const MAX_RAW_BYTES = 20 * 1024 * 1024

// SVG and PDF cannot be raster-processed — pass through unchanged.
const PASSTHROUGH_TYPES = new Set(['image/svg+xml', 'application/pdf'])

export function isPassthrough(mimeType: string): boolean {
  return PASSTHROUGH_TYPES.has(mimeType)
}

export interface OptimizedImage {
  buffer: Buffer
  contentType: 'image/webp'
  /** Final pixel width after resize */
  width: number
  height: number
  /** Byte size of the optimized buffer */
  size: number
}

export interface OptimizedProductImages {
  full:      OptimizedImage
  thumbnail: OptimizedImage
}

function rejectIfTooLarge(input: Buffer): void {
  if (input.length > MAX_RAW_BYTES) {
    throw new Error(
      `File too large: max 20 MB (received ${(input.length / 1024 / 1024).toFixed(1)} MB)`
    )
  }
}

/**
 * Optimizes a product image upload.
 * Returns a full-size (max 1800 px) and a thumbnail (max 600 px), both as WebP.
 * Auto-rotates from EXIF orientation and strips all metadata.
 */
export async function optimizeProductImage(input: Buffer): Promise<OptimizedProductImages> {
  rejectIfTooLarge(input)

  const sharp = await getSharp()
  // Create a shared Sharp pipeline once — rotate handles EXIF orientation;
  // not calling withMetadata() strips all EXIF on output.
  const pipeline = sharp(input, { failOn: 'none' }).rotate()

  const [fullResult, thumbResult] = await Promise.all([
    pipeline
      .clone()
      .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toBuffer({ resolveWithObject: true }),
    pipeline
      .clone()
      .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer({ resolveWithObject: true }),
  ])

  return {
    full: {
      buffer:      fullResult.data,
      contentType: 'image/webp',
      width:       fullResult.info.width,
      height:      fullResult.info.height,
      size:        fullResult.info.size,
    },
    thumbnail: {
      buffer:      thumbResult.data,
      contentType: 'image/webp',
      width:       thumbResult.info.width,
      height:      thumbResult.info.height,
      size:        thumbResult.info.size,
    },
  }
}

/**
 * Optimizes a general media upload (hero images, brand logos, blog covers).
 * Returns a single WebP image resized to max 2000 px wide with EXIF stripped.
 * Call isPassthrough() first — SVG and PDF must be uploaded as-is.
 */
export async function optimizeGeneralImage(input: Buffer): Promise<OptimizedImage> {
  rejectIfTooLarge(input)

  const sharp = await getSharp()
  const result = await sharp(input, { failOn: 'none' })
    .rotate()
    .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85, effort: 4 })
    .toBuffer({ resolveWithObject: true })

  return {
    buffer:      result.data,
    contentType: 'image/webp',
    width:       result.info.width,
    height:      result.info.height,
    size:        result.info.size,
  }
}
