// Tabellen-Sortierung
// „Sortierung wie Windows" (Merkliste): der Bediener erwartet, was der
// Explorer macht — Zahlen als Zahlen, Datum als Datum, Text alphabetisch.
//
// Warum eine eigene Datei: die erste Fassung sortierte stumpf per
// String-Vergleich. Das ergibt „10" vor „9" und wirft Datumsangaben
// durcheinander — in einer ERP-Maske ein Fehler, den der Bediener sofort
// sieht und dem Editor nie wieder glaubt. Sortier-Logik gehoert an EINE
// pruefbare Stelle, nicht ins Rendering.
//
// SoftEngine liefert alle Werte als STRING. Die Art einer Spalte steht
// nirgends — also wird sie aus den Werten erkannt, nicht geraten:
// erst wenn ALLE gefuellten Werte einer Spalte Zahl (bzw. Datum) sind,
// wird numerisch (bzw. zeitlich) sortiert. Eine einzige Textzelle kippt
// die Spalte auf Text — lieber alphabetisch als falsch.

// Leere Zellen landen IMMER unten, in beiden Richtungen (Explorer-Verhalten:
// „nichts" ist kein kleiner Wert, sondern gehoert ans Ende).
const LEER_ZULETZT = 1

// Deutsche Zahl: 1.234,56 / -12 / 3,5 — Punkt = Tausender, Komma = Dezimal.
// Bewusst streng: reine Ziffernfolgen mit optionalem Vorzeichen/Trennern.
const ZAHL = /^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$|^-?\d+(\.\d+)?$/

// Datum: 24.07.2026 / 24.7.26 (SE-Praxis) oder ISO 2026-07-24.
const DATUM_DE = /^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/
const DATUM_ISO = /^(\d{4})-(\d{2})-(\d{2})$/

export function alsZahl(wert: string): number | null {
  const t = wert.trim()
  if (t === '' || !ZAHL.test(t)) return null
  // Deutsche Schreibweise nur dann aufloesen, wenn ein Komma da ist —
  // sonst ist „1.234" die Zahl 1234 (Tausenderpunkt), nicht 1,234.
  const norm = t.includes(',')
    ? t.replace(/\./g, '').replace(',', '.')
    : /^-?\d{1,3}(\.\d{3})+$/.test(t) ? t.replace(/\./g, '') : t
  const n = Number(norm)
  return Number.isFinite(n) ? n : null
}

export function alsDatum(wert: string): number | null {
  const t = wert.trim()
  if (t === '') return null

  const iso = DATUM_ISO.exec(t)
  if (iso) {
    const [, j, m, tg] = iso
    return zeitwert(Number(j), Number(m), Number(tg))
  }

  const de = DATUM_DE.exec(t)
  if (de) {
    const [, tg, m, jRoh] = de
    // Zweistelliges Jahr: 00–69 -> 2000er, 70–99 -> 1900er (uebliche Regel).
    const jZahl = Number(jRoh)
    const jahr = jRoh.length === 2 ? (jZahl <= 69 ? 2000 + jZahl : 1900 + jZahl) : jZahl
    return zeitwert(jahr, Number(m), Number(tg))
  }

  return null
}

// Nur echte Kalendertage zaehlen — „32.13.2026" ist kein Datum, sondern Text.
function zeitwert(jahr: number, monat: number, tag: number): number | null {
  if (monat < 1 || monat > 12 || tag < 1 || tag > 31) return null
  const d = new Date(jahr, monat - 1, tag)
  if (d.getFullYear() !== jahr || d.getMonth() !== monat - 1 || d.getDate() !== tag) return null
  return d.getTime()
}

type Art = 'zahl' | 'datum' | 'text'

// Die Art einer Spalte aus ihren Werten erkennen. Leere Zellen zaehlen nicht
// mit (eine halb gefuellte Zahlenspalte bleibt eine Zahlenspalte).
export function erkenneArt(werte: readonly string[]): Art {
  let gefuellt = 0
  let zahlen = 0
  let daten = 0
  for (const w of werte) {
    if (w.trim() === '') continue
    gefuellt++
    if (alsZahl(w) !== null) zahlen++
    if (alsDatum(w) !== null) daten++
  }
  if (gefuellt === 0) return 'text'
  if (daten === gefuellt) return 'datum'
  if (zahlen === gefuellt) return 'zahl'
  return 'text'
}

// Text vergleichen wie der Explorer: deutsche Sortierreihenfolge (ä bei a),
// Gross/Klein egal, eingebettete Zahlen natuerlich ("Pos 2" vor "Pos 10").
const textVergleich = new Intl.Collator('de', { numeric: true, sensitivity: 'base' })

// Zeilen nach einer Spalte sortieren. Gibt IMMER eine neue Liste zurueck
// (die Eingabe bleibt unangetastet) und ist stabil: gleiche Werte behalten
// ihre urspruengliche Reihenfolge.
export function sortiereZeilen(
  zeilen: readonly (readonly string[])[],
  spalte: number,
  aufsteigend: boolean,
): string[][] {
  if (spalte < 0 || zeilen.length === 0) return zeilen.map((z) => [...z])

  const zelle = (z: readonly string[]): string => z[spalte] ?? ''
  const art = erkenneArt(zeilen.map(zelle))
  const richtung = aufsteigend ? 1 : -1

  return zeilen
    .map((zeile, i) => ({ zeile, i })) // Index mitfuehren = stabile Sortierung
    .sort((a, b) => {
      const wa = zelle(a.zeile).trim()
      const wb = zelle(b.zeile).trim()

      // Leer immer ans Ende — unabhaengig von der Richtung.
      if (wa === '' && wb === '') return a.i - b.i
      if (wa === '') return LEER_ZULETZT
      if (wb === '') return -LEER_ZULETZT

      const d =
        art === 'zahl' ? (alsZahl(wa) ?? 0) - (alsZahl(wb) ?? 0)
        : art === 'datum' ? (alsDatum(wa) ?? 0) - (alsDatum(wb) ?? 0)
        : textVergleich.compare(wa, wb)

      // Gleichstand -> urspruengliche Reihenfolge (stabil).
      return d !== 0 ? d * richtung : a.i - b.i
    })
    .map((x) => [...x.zeile])
}
