// Tests des Tagesfilters + der Datums-Uebersetzung.
//
// Der teuerste denkbare Fehler dieser Baustelle ist ein Filter, der IMMER
// leer liefert, weil SoftEngine '27.07.2026' schickt und das Datumsfeld
// '2026-07-27' vergleicht. Genau das faellt im Browser nicht auf (die
// Maske sieht nur „keine Termine" aus) — darum steht es hier.

import { describe, expect, it } from 'vitest'
import { heuteSchluessel, tagPlus, tagSchluessel } from './datumSchluessel'
import { aufTagHoeren, gewaehlterTag, setzeGewaehltenTag } from './gewaehlterTag'
import { zeilenAmTag } from './tagFilter'

const DATUM = '183_10'

// Zeilen in der Form, die die SE-Schicht liefert (Schluessel = Feldcode).
const zeilen = [
  { [DATUM]: '27.07.2026', name: 'heute deutsch' },
  { [DATUM]: '2026-07-27', name: 'heute ISO' },
  { [DATUM]: '28.07.2026', name: 'morgen' },
  { [DATUM]: '', name: 'ohne Datum' },
  { name: 'Feld fehlt ganz' },
]

describe('tagSchluessel (deutsche und ISO-Schreibweise versoehnen)', () => {
  it('uebersetzt deutsch nach ISO', () => {
    expect(tagSchluessel('27.07.2026')).toBe('2026-07-27')
    expect(tagSchluessel('1.2.2026')).toBe('2026-02-01')
  })

  it('laesst ISO stehen', () => {
    expect(tagSchluessel('2026-07-27')).toBe('2026-07-27')
  })

  it('ignoriert eine angehaengte Uhrzeit', () => {
    expect(tagSchluessel('27.07.2026 14:30')).toBe('2026-07-27')
    expect(tagSchluessel('2026-07-27T14:30')).toBe('2026-07-27')
  })

  it('gibt bei Unlesbarem leer zurueck statt zu raten', () => {
    expect(tagSchluessel('')).toBe('')
    expect(tagSchluessel('irgendwas')).toBe('')
    expect(tagSchluessel(null)).toBe('')
    expect(tagSchluessel(undefined)).toBe('')
  })
})

describe('heuteSchluessel / tagPlus', () => {
  it('nimmt die Ortszeit, nicht UTC (sonst abends der falsche Tag)', () => {
    // 23:30 Ortszeit am 27.07. — nach UTC waere das in Berlin schon der 28.
    expect(heuteSchluessel(new Date(2026, 6, 27, 23, 30))).toBe('2026-07-27')
  })

  it('rechnet ueber Monats- und Jahresgrenzen', () => {
    expect(tagPlus('2026-07-31', 1)).toBe('2026-08-01')
    expect(tagPlus('2026-01-01', -1)).toBe('2025-12-31')
    expect(tagPlus('2026-07-27', 0)).toBe('2026-07-27')
  })

  it('gibt bei Unlesbarem leer zurueck', () => {
    expect(tagPlus('quatsch', 1)).toBe('')
  })
})

describe('zeilenAmTag', () => {
  it('findet den Tag in BEIDEN Schreibweisen', () => {
    expect(zeilenAmTag(zeilen, DATUM, '2026-07-27')).toHaveLength(2)
  })

  it('laesst alles durch, wenn kein Datumsfeld eingestellt ist', () => {
    expect(zeilenAmTag(zeilen, '', '2026-07-27')).toHaveLength(zeilen.length)
  })

  it('laesst alles durch, wenn kein Tag gewaehlt ist (Maske ohne Tageswaehler)', () => {
    expect(zeilenAmTag(zeilen, DATUM, '')).toHaveLength(zeilen.length)
  })

  it('wirft Saetze ohne lesbares Datum heraus, sobald gefiltert wird', () => {
    const treffer = zeilenAmTag(zeilen, DATUM, '2026-07-28') as { name: string }[]
    expect(treffer.map((z) => z.name)).toEqual(['morgen'])
  })

  it('gibt eine neue Liste zurueck, statt die Eingabe zu veraendern', () => {
    const vorher = [...zeilen]
    zeilenAmTag(zeilen, DATUM, '2026-07-27')
    expect(zeilen).toEqual(vorher)
  })
})

describe('gewaehlterTag', () => {
  it('nimmt deutsche Eingaben an und meldet den Wechsel genau einmal', () => {
    let gemeldet = 0
    aufTagHoeren(() => { gemeldet += 1 })
    setzeGewaehltenTag('27.07.2026')
    expect(gewaehlterTag()).toBe('2026-07-27')
    expect(gemeldet).toBe(1)
    // Derselbe Tag noch einmal: keine Meldung, sonst zeichnete jeder
    // Tastendruck im Datumsfeld die ganze Maske neu.
    setzeGewaehltenTag('2026-07-27')
    expect(gemeldet).toBe(1)
  })

  it('loescht den Tag bei unlesbarer Eingabe, statt einen falschen zu behaupten', () => {
    setzeGewaehltenTag('2026-07-27')
    setzeGewaehltenTag('quatsch')
    expect(gewaehlterTag()).toBe('')
  })
})
