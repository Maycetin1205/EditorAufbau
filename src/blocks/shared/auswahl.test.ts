// Tests des gemeinsamen Auswahl-Zustands (Zeile anklicken -> Folger filtern).
// Pur in Node: das Element wird als Attribut-Traeger nachgestellt (dasselbe
// Muster wie die uebrigen seRuntime-Helfer-Tests, kein DOM noetig).

import { beforeEach, describe, expect, it } from 'vitest'
import {
  aufAuswahlHoeren,
  auswahlFuer,
  auswahlMerkmal,
  folgenAusAttribut,
  klareAuswahl,
  merkmalVon,
  setzeAuswahlZurueck,
  waehleAuswahl,
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
