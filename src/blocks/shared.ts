// shared
// Helfer fuer Block-Templates: HTML-Escape + kleine Style-Helfer.
// Wird sowohl im Lit render (via unsafeHTML) als auch im static exportHtml benutzt,
// damit es nur eine Wahrheit pro Block gibt.

export function escapeHtml(value: unknown): string {
  if (value == null) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Erzeugt eine Inline-Style-Eigenschaft aus key/value-Paaren. Leere Werte werden weggelassen.
export function inlineStyle(parts: Record<string, string | number | undefined | null>): string {
  return Object.entries(parts)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}:${v}`)
    .join(';')
}
