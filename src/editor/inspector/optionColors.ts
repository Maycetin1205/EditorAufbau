// optionColors — Options-Wert einer Auswahl -> echte Masken-Farbe (Kachel).
//
// Reine Editor-seitige Zuordnungstabelle (Muster blockIcons.ts; Regel 2:
// Daten-Tabelle statt `if attr === …`). BEWUSST hier und NICHT in den
// Baustein-Dateien: `src/blocks/*` speist das Runtime-Buendel/den Export —
// die Eigenschafts-Art bleibt dort ein `select`, check:runtime „Buendel
// identisch". Nur der Inspector rendert daraus Farb-Kacheln.
//
// Der Inspector zeigt Kacheln statt Dropdown, wenn ALLE Options-Werte einer
// select-Eigenschaft hier stehen (allOptionsHaveColor). Die Farbe ist der
// echte Masken-Token (var(--se-*), global in main.tsx geladen) — die Kachel
// zeigt damit die wahre Farbe der Spalte/Karte, nicht eine Editor-Nachbildung.

const OPTION_COLORS: Record<string, string> = {
  info: 'var(--se-blue)',      // „Hinweis"
  success: 'var(--se-green)',  // „Erfolg"
  warning: 'var(--se-amber)',  // „Warnung"
  danger: 'var(--se-red)',     // „Fehler"
}

export function optionColor(value: string): string | undefined {
  return OPTION_COLORS[value]
}

// true, wenn JEDE Option eine Farbe hat — erst dann sind Kacheln sinnvoll.
export function allOptionsHaveColor(options: readonly { value: string }[]): boolean {
  return options.length > 0 && options.every((o) => o.value in OPTION_COLORS)
}
