// Server-side HTML sanitizer for CMS / blog content.
// Removes script execution vectors while preserving formatting HTML.
// Apply to any HTML rendered with dangerouslySetInnerHTML in public pages.

export function sanitizeHtml(html: string): string {
  return html
    // Strip <script> tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Strip dangerous embedding tags
    .replace(/<\/?(iframe|object|embed|applet|base|form|meta|link)\b[^>]*>/gi, '')
    // Strip on* event handlers (onclick, onerror, onload, etc.)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    // Strip javascript: protocol in href/src/action attributes
    .replace(/(href|src|action)(\s*=\s*")\s*javascript:[^"]*"/gi, '$1$2#"')
    .replace(/(href|src|action)(\s*=\s*')\s*javascript:[^']*'/gi, "$1$2#'")
    // Strip data: URIs from src (can carry SVG+JS payloads)
    .replace(/\bsrc(\s*=\s*")\s*data:[^"]*"/gi, 'src$1""')
    .replace(/\bsrc(\s*=\s*')\s*data:[^']*'/gi, "src$1''")
}

// Safe JSON-LD serializer — prevents </script> injection in
// dangerouslySetInnerHTML script tags.
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/<\/script>/gi, '<\\/script>')
}
