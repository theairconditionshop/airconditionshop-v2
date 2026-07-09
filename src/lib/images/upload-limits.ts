// Vercel serverless functions reject request bodies larger than ~4.5 MB with a
// platform-level 413 (FUNCTION_PAYLOAD_TOO_LARGE) before our route handlers run,
// so oversized uploads must be caught client-side with a clear message.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024 // 4 MB — safety margin under 4.5 MB

/** Returns an error message if the batch would exceed the upload limit, else null. */
export function uploadSizeError(files: File[]): string | null {
  const tooBig = files.find(f => f.size > MAX_UPLOAD_BYTES)
  if (tooBig) return `"${tooBig.name}" is too large (max 4 MB per upload). Please resize or compress it first.`
  const total = files.reduce((sum, f) => sum + f.size, 0)
  if (total > MAX_UPLOAD_BYTES) return 'Selected files exceed 4 MB combined. Please upload them in smaller batches.'
  return null
}
