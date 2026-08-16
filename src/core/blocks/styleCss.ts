// styleCss — ein Style-Objekt (camelCase) als CSS-Deklarationen.
//
// Winzig, aber bewusst in core: seit C2 (2026-08-16) braucht es AUSSER dem
// Export auch ein BAUSTEIN. Der Popup-Rumpf ist eine Rasterflaeche wie die
// Maskenwurzel und holt sein Grid-CSS aus derselben Rechnung
// (rasterLayout.rasterFlaecheCss) — laege der Wandler weiter in export/,
// zoege ein Baustein den Export-Serializer in das Runtime-Buendel.
//
// Bis dahin wohnte die Funktion woertlich so in export/knotenStil.

export function styleToCss(style: Record<string, string | number>): string {
  return Object.entries(style)
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${v}`)
    .join(';')
}
