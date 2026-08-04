// Tests des Auswahl-Filters der Tabellen-Laufzeit (zeilenNachAuswahl):
// „Kunde anklicken -> Belege-Tabelle zeigt nur seine Belege" (2026-08-05).
// Pur in Node; das Element wird als Attribut-Traeger nachgestellt (Muster
// der uebrigen seRuntime-Helfer-Tests, kein DOM noetig).

import { beforeEach, describe, expect, it } from 'vitest'
import { setzeAuswahlZurueck, waehleAuswahl } from '../shared/auswahl'
import { zeilenNachAuswahl } from './seRuntime'

const folger = (keyPairs: { fromField: string; toField: string }[]): HTMLElement =>
  ({
    getAttribute: (n: string) =>
      n === 'folgtauswahl' ? JSON.stringify([{ geberId: 'kunden', keyPairs }]) : null,
  }) as unknown as HTMLElement

const ohneFolge = ({ getAttribute: () => null }) as unknown as HTMLElement

const belege = [
  { '3_8': '10001', beleg: 'RE-1' },
  { '3_8': '20002', beleg: 'RE-2' },
  { '3_8': '10001', beleg: 'RE-3' },
]

beforeEach(() => setzeAuswahlZurueck())

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
