// Tests des gemeinsamen Auswahl-Zustands (Zeile anklicken -> Folger filtern).
// Pur in Node: das Element wird als Attribut-Traeger nachgestellt (dasselbe
// Muster wie die uebrigen seRuntime-Helfer-Tests, kein DOM noetig).

import { beforeEach, describe, expect, it } from 'vitest'
import {
  aufAuswahlHoeren,
  auswahlFuer,
  auswahlMerkmal,
  ersteZeileNachAuswahl,
  folgenAusAttribut,
  klareAuswahl,
  merkmalVon,
  setzeAuswahlZurueck,
  waehleAuswahl,
  zeilenNachAuswahl,
} from './auswahl'

const elementMit = (attrs: Record<string, string>): HTMLElement =>
  ({ getAttribute: (n: string) => attrs[n] ?? null }) as unknown as HTMLElement

beforeEach(() => setzeAuswahlZurueck())

describe('waehleAuswahl (Toggle, Nutzer 2026-08-05: „rausklicken")', () => {
  const zeile = { '2_8': '10001', name: 'Meier' }

  it('waehlt eine Zeile und findet sie wieder', () => {
    waehleAuswahl('t1', zeile)
    expect(auswahlFuer('t1')).toBe(zeile)
    expect(auswahlMerkmal('t1')).toBe(merkmalVon(zeile))
  })

  it('dieselbe Zeile noch einmal = abgewaehlt — auch als NEUES Objekt gleichen Inhalts', () => {
    waehleAuswahl('t1', zeile)
    // Nach einem SE-Push sind die Zeilen NEUE Objekte: die Identitaet ist
    // der Inhalt (JSON-Abdruck), nie die Referenz.
    waehleAuswahl('t1', { '2_8': '10001', name: 'Meier' })
    expect(auswahlFuer('t1')).toBeUndefined()
  })

  it('eine ANDERE Zeile ersetzt die Auswahl statt sie aufzuheben', () => {
    waehleAuswahl('t1', zeile)
    waehleAuswahl('t1', { '2_8': '20002', name: 'Schmidt' })
    expect(auswahlFuer('t1')).toEqual({ '2_8': '20002', name: 'Schmidt' })
  })

  it('zwei Geber halten getrennte Auswahlen', () => {
    waehleAuswahl('t1', zeile)
    waehleAuswahl('k1', { '2_8': '30003' })
    expect(auswahlFuer('t1')).toBe(zeile)
    expect(auswahlFuer('k1')).toEqual({ '2_8': '30003' })
  })

  it('ohne Geber-id oder ohne brauchbare Zeile passiert nichts', () => {
    waehleAuswahl('', zeile)
    waehleAuswahl('t1', null)
    expect(auswahlFuer('t1')).toBeUndefined()
  })

  it('meldet jede Aenderung an die Hoerer (Neu-Hydrierung)', () => {
    let rufe = 0
    aufAuswahlHoeren(() => { rufe++ })
    waehleAuswahl('t1', zeile)
    klareAuswahl('t1')
    klareAuswahl('t1') // schon leer -> keine Meldung
    expect(rufe).toBe(2)
  })
})

describe('folgenAusAttribut (Laufzeit-Leser des Export-Attributs)', () => {
  const folge = [{ geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: '3_8' }] }]

  it('liest eine gueltige Folge', () => {
    const el = elementMit({ folgtauswahl: JSON.stringify(folge) })
    expect(folgenAusAttribut(el)).toEqual(folge)
  })

  it('fehlendes/kaputtes Attribut = keine Folge, nie ein Wurf', () => {
    expect(folgenAusAttribut(elementMit({}))).toEqual([])
    expect(folgenAusAttribut(elementMit({ folgtauswahl: '{kaputt' }))).toEqual([])
    expect(folgenAusAttribut(elementMit({ folgtauswahl: '"nur-text"' }))).toEqual([])
  })

  it('laesst halbe Feldpaare und Eintraege ohne Geber weg (streng wie fremdeQuellen)', () => {
    const roh = JSON.stringify([
      { geberId: '', keyPairs: [{ fromField: '2_8', toField: '3_8' }] },
      { geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: ' ' }] },
      { geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: '3_8' }, { fromField: '', toField: 'x' }] },
    ])
    expect(folgenAusAttribut(elementMit({ folgtauswahl: roh }))).toEqual([
      { geberId: 'geber', keyPairs: [{ fromField: '2_8', toField: '3_8' }] },
    ])
  })
})

// Der Filter wohnte bis 2026-08-06 in tabelle/seRuntime (samt dieser Tests).
// Er ist hierher gezogen, weil die Einzelwert-Bausteine der zweite Folger
// sind und beide DIESELBE Regel brauchen. LEITPLANKE: Tests niemals
// loeschen/abschwaechen — sie sind unveraendert mitgezogen.
const folger = (keyPairs: { fromField: string; toField: string }[]): HTMLElement =>
  elementMit({ folgtauswahl: JSON.stringify([{ geberId: 'kunden', keyPairs }]) })

const ohneFolge = elementMit({})

const belege = [
  { '3_8': '10001', beleg: 'RE-1' },
  { '3_8': '20002', beleg: 'RE-2' },
  { '3_8': '10001', beleg: 'RE-3' },
]

describe('zeilenNachAuswahl', () => {
  it('ohne Folge-Attribut bleibt alles wie es ist', () => {
    const { rows, gefiltert } = zeilenNachAuswahl(ohneFolge, belege)
    expect(rows).toBe(belege)
    expect(gefiltert).toBe(false)
  })

  it('ohne aktive Auswahl filtert NICHTS — nichts passiert automatisch', () => {
    const { rows, gefiltert } = zeilenNachAuswahl(
      folger([{ fromField: '2_8', toField: '3_8' }]),
      belege,
    )
    expect(rows).toBe(belege)
    expect(gefiltert).toBe(false)
  })

  it('mit Auswahl bleiben nur die passenden Zeilen (Kunde -> seine Belege)', () => {
    waehleAuswahl('kunden', { '2_8': '10001', name: 'Meier' })
    const { rows, gefiltert } = zeilenNachAuswahl(
      folger([{ fromField: '2_8', toField: '3_8' }]),
      belege,
    )
    expect(rows.map((r) => (r as { beleg: string }).beleg)).toEqual(['RE-1', 'RE-3'])
    expect(gefiltert).toBe(true)
  })

  it('kein Treffer = leere Liste, aber ehrlich als gefiltert markiert', () => {
    waehleAuswahl('kunden', { '2_8': '99999' })
    const { rows, gefiltert } = zeilenNachAuswahl(
      folger([{ fromField: '2_8', toField: '3_8' }]),
      belege,
    )
    expect(rows).toEqual([])
    expect(gefiltert).toBe(true)
  })

  it('mehrere Feldpaare sind ein UND', () => {
    waehleAuswahl('kunden', { '2_8': '10001', '9_2': 'A' })
    const zeilen = [
      { '3_8': '10001', '7_2': 'A', beleg: 'passt' },
      { '3_8': '10001', '7_2': 'B', beleg: 'falsche-art' },
    ]
    const { rows } = zeilenNachAuswahl(
      folger([
        { fromField: '2_8', toField: '3_8' },
        { fromField: '9_2', toField: '7_2' },
      ]),
      zeilen,
    )
    expect(rows.map((r) => (r as { beleg: string }).beleg)).toEqual(['passt'])
  })

  it('LEERER Schluesselwert beim Geber trifft NICHTS (Regel wie schluesselAus)', () => {
    // Der gewaehlte Kunde hat keine Adressnummer: „alle Belege" waere
    // geraten, „die mit ebenfalls leerem Feld" auch — also keine.
    waehleAuswahl('kunden', { '2_8': '   ' })
    const { rows, gefiltert } = zeilenNachAuswahl(
      folger([{ fromField: '2_8', toField: '3_8' }]),
      [...belege, { '3_8': '', beleg: 'auch-leer' }],
    )
    expect(rows).toEqual([])
    expect(gefiltert).toBe(true)
  })

  it('die Auswahl eines FREMDEN Gebers filtert hier nicht', () => {
    waehleAuswahl('andere-tabelle', { '2_8': '10001' })
    const { gefiltert } = zeilenNachAuswahl(
      folger([{ fromField: '2_8', toField: '3_8' }]),
      belege,
    )
    expect(gefiltert).toBe(false)
  })
})

describe('ersteZeileNachAuswahl (Einzelwert-Bausteine, 2026-08-06)', () => {
  const paar = [{ fromField: '2_8', toField: '3_8' }]

  it('ohne Folge die ERSTE Zeile — der Grundzustand bleibt', () => {
    expect(ersteZeileNachAuswahl(ohneFolge, belege)).toBe(belege[0])
  })

  it('mit Auswahl die erste PASSENDE Zeile', () => {
    waehleAuswahl('kunden', { '2_8': '20002' })
    expect(ersteZeileNachAuswahl(folger(paar), belege)).toBe(belege[1])
  })

  // Strenge Leer-Regel (Nutzer-Entscheidung 2026-08-06 nach dem SE-Echttest):
  // wer der Auswahl folgt, zeigt NUR, was die Auswahl liefert. „Die erste
  // Zeile" waere ein konkreter Datensatz, den der Bediener fuer den
  // ausgewaehlten haelt.
  it('mit Folge, aber ohne Auswahl: LEER — nicht die erste Zeile', () => {
    expect(ersteZeileNachAuswahl(folger(paar), belege)).toBeUndefined()
  })

  it('wieder rausgeklickt: LEER', () => {
    const el = folger(paar)
    waehleAuswahl('kunden', { '2_8': '20002' })
    expect(ersteZeileNachAuswahl(el, belege)).toBe(belege[1])
    // Dieselbe Zeile noch einmal = abgewaehlt (Toggle).
    waehleAuswahl('kunden', { '2_8': '20002' })
    expect(ersteZeileNachAuswahl(el, belege)).toBeUndefined()
  })

  it('gewaehlt, aber kein Partner in der eigenen Quelle: LEER', () => {
    waehleAuswahl('kunden', { '2_8': '99999' })
    expect(ersteZeileNachAuswahl(folger(paar), belege)).toBeUndefined()
  })

  it('HALBES Feldpaar zaehlt nicht: Grundzustand, kein Leer-Blinken beim Einstellen', () => {
    // Der Bediener hat den Geber gewaehlt und tippt gerade am Feldpaar.
    const halb = folger([{ fromField: '2_8', toField: '' }])
    expect(ersteZeileNachAuswahl(halb, belege)).toBe(belege[0])
    waehleAuswahl('kunden', { '2_8': '20002' })
    expect(ersteZeileNachAuswahl(halb, belege)).toBe(belege[0])
  })

  it('leere Quelle bleibt leer — nichts wird erfunden', () => {
    waehleAuswahl('kunden', { '2_8': '10001' })
    expect(ersteZeileNachAuswahl(folger(paar), [])).toBeUndefined()
  })
})
