// optionColors — Options-Wert einer Auswahl -> echte Masken-Farbe (Kachel).
//
// Reine Editor-seitige Zuordnungstabelle (Regel 2: Daten-Tabelle statt
// `if attr === …`). BEWUSST hier und NICHT in den Baustein-Dateien:
// `src/blocks/*` speist das Runtime-Buendel/den Export — die Eigenschafts-Art
// bleibt dort ein `select`, check:runtime „Buendel identisch". Nur der
// Inspector rendert daraus Farb-Kacheln.
//
// Bleibt hier — geprueft am 2026-08-04, als Icons und Inspector-Hinweise in
// die Registry gewandert sind (core/blocks/editorAngaben). Zwei Gruende, warum
// diese Tabelle NICHT mitkommt:
//  1. Sie ist nicht nach Bausteintyp geschluesselt, sondern nach OPTIONS-WERT
//     (info/success/warning/danger aus blocks/shared/statusVariant.ts). Sie
//     enthaelt also gar kein Baustein-Wissen, das ein Baustein erklaeren
//     koennte — Regel 2 ist hier nicht verletzt.
//  2. Ihr natuerlicher Platz waere die Options-Liste selbst
//     (customProperties) — und die steht in der Baustein-Klasse, also im
//     Runtime-Buendel. Sie dorthin zu heben, wuerde jede exportierte Maske
//     um Farbwerte verlaengern, die nur der Inspector liest. Die Werte je
//     Baustein zu wiederholen (Karte UND Kanban-Spalte nutzen dieselben vier)
//     waere Doppelpflege mit Driftgefahr.
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
  // Textfarben des Text-Bausteins (2026-08-04). Eigene Technikwerte statt der
  // Status-Werte oben: „Standard/Gedaempft/Akzent" haben im Status-Vokabular
  // kein Gegenstueck, und EINE Eigenschaft mit gemischten Werten (deutsch +
  // englisch) waere schlimmer als drei Zeilen mehr Tabelle. Die Farbe selbst
  // steht NUR im Baustein (FARBEN in blocks/text/TextBlock.ts) — hier
  // dieselben Tokens, damit die Kachel im Inspector die echte Maskenfarbe
  // zeigt statt einer Nachbildung.
  standard: 'var(--se-ink)',
  gedaempft: 'var(--se-muted)',
  akzent: 'var(--se-accent)',
  erfolg: 'var(--se-green)',
  warnung: 'var(--se-amber)',
  fehler: 'var(--se-red)',
}

export function optionColor(value: string): string | undefined {
  return OPTION_COLORS[value]
}

// true, wenn JEDE Option eine Farbe hat — erst dann sind Kacheln sinnvoll.
export function allOptionsHaveColor(options: readonly { value: string }[]): boolean {
  return options.length > 0 && options.every((o) => o.value in OPTION_COLORS)
}
