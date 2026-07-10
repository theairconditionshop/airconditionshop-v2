'use client'

import { MAX_UPLOAD_BYTES } from '@/lib/images/upload-limits'

/**
 * Single shared client for every admin upload surface (ImageUploadField,
 * media library, product/series galleries, campaign hero/gallery). Do not
 * re-implement fetch/parse/validation logic per component — import these.
 *
 * Deletion is intentionally NOT exposed here for "replace" flows. Storage
 * cleanup for superseded/removed images is handled exclusively by the
 * orphan sweep (see src/app/api/cron/cleanup-orphans/route.ts), which only
 * removes files no longer referenced anywhere in the database. Components
 * must never delete a file the instant a new one is chosen or "Remove" is
 * clicked — doing so destroys the old file even if the surrounding form is
 * never saved. See product/series image galleries for the one legitimate
 * exception: those have no draft/Save step — each add/remove is already an
 * immediately-persisted, explicit CRUD action, not part of an unsaved form.
 */

export const MAX_UPLOAD_MB = Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)

const RASTER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])

export type UploadStage = 'validating' | 'uploading' | 'optimizing' | 'saving' | 'complete'

export const STAGE_LABELS: Record<UploadStage, string> = {
  validating: 'Checking file…',
  uploading:  'Uploading…',
  optimizing: 'Optimizing…',
  saving:     'Saving…',
  complete:   'Complete',
}

/** Error whose `message` is always safe and specific enough to show the admin. */
export class UploadError extends Error {}

/**
 * Client-side validation before any bytes are sent.
 * Returns null when the file is valid, otherwise a user-displayable reason.
 */
export async function validateImageFile(
  file: File,
  opts: { allowSvg?: boolean; allowPdf?: boolean } = {},
): Promise<string | null> {
  if (file.size === 0) return `"${file.name}" is empty (0 bytes) — the file may be corrupted or still syncing.`

  const allowed = new Set(RASTER_TYPES)
  if (opts.allowSvg) allowed.add('image/svg+xml')
  if (opts.allowPdf) allowed.add('application/pdf')
  if (!allowed.has(file.type)) {
    const pretty = file.type || 'unknown type'
    return `Unsupported file type (${pretty}). Use JPG, PNG or WebP${opts.allowSvg ? ', or SVG for logos' : ''}.`
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1)
    return `File exceeds maximum size — ${mb} MB (maximum ${MAX_UPLOAD_MB} MB). Please resize or compress it first.`
  }

  // Corruption check: try to actually decode raster images in the browser.
  if (RASTER_TYPES.has(file.type) && typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file)
      bmp.close()
    } catch {
      return `"${file.name}" could not be read as an image — the file appears to be corrupted.`
    }
  }

  return null
}

/** Map a failed upload to a precise, user-friendly message. */
function describeFailure(status: number, serverMessage: string | null): string {
  if (serverMessage) return serverMessage
  switch (status) {
    case 0:   return 'Could not connect to the server — check your internet connection and try again.'
    case 401:
    case 403: return 'Your session has expired. Please sign in again and retry the upload.'
    case 404: return 'Upload endpoint not found — please refresh the page and try again.'
    case 408: return 'The upload timed out. Try a smaller image or check your connection.'
    case 413: return `This image is larger than the ${MAX_UPLOAD_MB} MB upload limit. Please resize or compress the image and try again.`
    case 415: return 'Unsupported file type — use JPG, PNG or WebP.'
    case 500:
    case 502:
    case 503: return "We couldn't process this image. Please try again or contact support if the problem continues."
    default:  return `The upload failed unexpectedly (code ${status}). Please try again.`
  }
}

interface UploadOptions {
  /** API endpoint, e.g. /api/admin/media */
  url: string
  /** multipart field name the endpoint expects ('files' for media, 'file' for galleries) */
  fieldName: string
  file: File
  /** additional form fields, e.g. colour_id / alt_text */
  extraFields?: Record<string, string>
  onStage?: (stage: UploadStage) => void
  /** 0–100 while bytes are in flight */
  onProgress?: (pct: number) => void
  timeoutMs?: number
}

/**
 * Uploads a file with real staged progress:
 *   uploading (true byte progress) → optimizing (server processing) → resolve.
 * Throws UploadError with a precise, displayable message; full diagnostics
 * (HTTP status, server response, JS error) are logged to the console.
 */
export function uploadFileStaged(opts: UploadOptions): Promise<unknown> {
  const { url, fieldName, file, extraFields, onStage, onProgress, timeoutMs = 90_000 } = opts

  const form = new FormData()
  form.append(fieldName, file)
  for (const [k, v] of Object.entries(extraFields ?? {})) form.append(k, v)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.timeout = timeoutMs
    xhr.responseType = 'text'

    const fail = (kind: string, status: number, body: string | null, jsError?: unknown) => {
      let serverMessage: string | null = null
      if (body) {
        try {
          const parsed = JSON.parse(body)
          serverMessage = parsed?.error ?? parsed?.results?.[0]?.error ?? null
        } catch { /* non-JSON body — ignore */ }
      }
      const message = kind === 'timeout'
        ? 'Upload timed out — try a smaller image or check your connection.'
        : describeFailure(status, serverMessage)
      console.error('[upload] failed', {
        url, file: file.name, size: file.size, type: file.type,
        kind, httpStatus: status, serverResponse: body?.slice(0, 1000) ?? null, jsError,
      })
      reject(new UploadError(message))
    }

    xhr.upload.onprogress = e => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    // All bytes sent — the server is now optimizing/storing the image.
    xhr.upload.onload = () => onStage?.('optimizing')

    xhr.onload = () => {
      const body = xhr.response as string
      if (xhr.status < 200 || xhr.status >= 300) return fail('http', xhr.status, body)
      try {
        resolve(body ? JSON.parse(body) : null)
      } catch (err) {
        fail('parse', xhr.status, body, err)
      }
    }
    xhr.onerror   = () => fail('network', xhr.status, xhr.response as string)
    xhr.ontimeout = () => fail('timeout', 0, null)

    onStage?.('uploading')
    xhr.send(form)
  })
}

/**
 * Upload a single image to the shared media library and return its public URL.
 * The media API returns HTTP 200 even when an individual file fails
 * validation — the per-file outcome is only visible in results[0].
 */
export async function uploadMediaFile(
  file: File,
  hooks: { onStage?: (stage: UploadStage) => void; onProgress?: (pct: number) => void } = {},
): Promise<string> {
  const data = await uploadFileStaged({
    url: '/api/admin/media', fieldName: 'files', file,
    onStage: hooks.onStage, onProgress: hooks.onProgress,
  }) as { results?: { url?: string; error?: string }[] } | null
  const first = data?.results?.[0]
  if (!first?.url) {
    const reason = first?.error || 'Upload returned no URL'
    console.error('[upload] media API reported per-file failure', { file: file.name, reason })
    throw new UploadError(reason)
  }
  return first.url
}
