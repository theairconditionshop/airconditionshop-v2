// Vercel serverless functions reject request bodies larger than ~4.5 MB with a
// platform-level 413 (FUNCTION_PAYLOAD_TOO_LARGE) before our route handlers run,
// so oversized uploads must be caught client-side with a clear message.
// Validation lives in src/lib/media/client.ts (validateImageFile) — the single
// source of truth for upload rules.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024 // 4 MB — safety margin under 4.5 MB
