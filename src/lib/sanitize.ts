// Server-side HTML sanitizer for CMS / campaign content.
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

/**
 * Sanitizes an uploaded SVG's raw text before it is stored, removing every
 * common script-execution vector. SVGs (brand logos) are served from the
 * public storage bucket and could otherwise carry active content — even
 * though we only ever render them inside <img> (which does not execute
 * script), a raw SVG opened directly in a browser would. Defense in depth.
 *
 * Strips: <script>, <foreignObject> (can embed HTML/JS), on* handlers,
 * javascript: URIs, external/data references in href/xlink:href, and
 * <use> external references.
 */
export function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '')
    .replace(/<\/?(iframe|object|embed|applet|base|meta|link|handler|set|animate)\b[^>]*>/gi, '')
    // event handlers: onclick, onload, onmouseover, onbegin, …
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    // javascript: in any attribute
    .replace(/(href|xlink:href|src)(\s*=\s*)(["'])\s*javascript:[^"']*\3/gi, '$1$2$3#$3')
    // external / data: refs in href/xlink:href (SVG <use>, <image> exfil vectors)
    .replace(/(xlink:href|href)(\s*=\s*)(["'])\s*(?:data:|https?:|\/\/)[^"']*\3/gi, '$1$2$3#$3')
}
