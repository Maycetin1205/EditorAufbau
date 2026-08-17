const LEER_ZULETZT = 1

const ZAHL = /^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$|^-?\d+(\.\d+)?$/

const DATUM_DE = /^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/
const DATUM_ISO = /^(\d{4})-(\d{2})-(\d{2})$/

export function alsZahl(wert: string): number | null {
  const t = wert.trim()
  if (t === '' || !ZAHL.test(t)) return null

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

    const jZahl = Number(jRoh)
    const jahr = jRoh.length === 2 ? (jZahl <= 69 ? 2000 + jZahl : 1900 + jZahl) : jZahl
    return zeitwert(jahr, Number(m), Number(tg))
  }

  return null
}

function zeitwert(jahr: number, monat: number, tag: number): number | null {
  if (monat < 1 || monat > 12 || tag < 1 || tag > 31) return null
  const d = new Date(jahr, monat - 1, tag)
  if (d.getFullYear() !== jahr || d.getMonth() !== monat - 1 || d.getDate() !== tag) return null
  return d.getTime()
}

type Art = 'zahl' | 'datum' | 'text'

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

const textVergleich = new Intl.Collator('de', { numeric: true, sensitivity: 'base' })

export function sortiereIndizes(
  zeilen: readonly (readonly string[])[],
  spalte: number,
  aufsteigend: boolean,
): number[] {
  if (spalte < 0 || zeilen.length === 0) return zeilen.map((_, i) => i)

  const zelle = (i: number): string => zeilen[i][spalte] ?? ''
  const art = erkenneArt(zeilen.map((z) => z[spalte] ?? ''))
  const richtung = aufsteigend ? 1 : -1

  return zeilen
    .map((_, i) => i)
    .sort((a, b) => {
      const wa = zelle(a).trim()
      const wb = zelle(b).trim()

      if (wa === '' && wb === '') return a - b
      if (wa === '') return LEER_ZULETZT
      if (wb === '') return -LEER_ZULETZT

      const d =
        art === 'zahl' ? (alsZahl(wa) ?? 0) - (alsZahl(wb) ?? 0)
        : art === 'datum' ? (alsDatum(wa) ?? 0) - (alsDatum(wb) ?? 0)
        : textVergleich.compare(wa, wb)

      return d !== 0 ? d * richtung : a - b
    })
}
