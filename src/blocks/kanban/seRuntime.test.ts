// Unit-Tests fuer die puren Helfer der Kanban-SoftEngine-Anbindung
// (Kap. 5.3): Feldcode-Aufloesung (direkt + pos_len aus dem SATZ), Zeilen
// aus den SEDATA-Formen der Referenzmaske, Spalten-Zuordnung mit Auffang.
// Die DOM-Hydrierung selbst prueft e2e/kanban-data.spec.ts im echten Browser.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import { columnIndexFor, findRuntimeDataSource, getField, rowsFor, setField } from './seRuntime'

// Kap. 5.4: die exportierte Maske traegt ihre Quellen-Definitionen selbst
// (var FF_DATA_SOURCES aus exportMask) — hier die pure Aufloesung dazu.
describe('findRuntimeDataSource (FF_DATA_SOURCES -> Quelle)', () => {
  const liste = [
    { id: 'terminplaner', name: 'Terminplaner', tableId: 'IDBID0001', indexField: '0_10' },
    { id: 'adressen', name: 'Adressen', tableId: 'ADR', indexField: '' },
  ]

  it('findet den Eintrag zur source-id', () => {
    expect(findRuntimeDataSource(liste, 'terminplaner')).toEqual(liste[0])
    expect(findRuntimeDataSource(liste, 'adressen')).toEqual(liste[1])
  })

  it('liefert undefined bei unbekannter/leerer id oder fehlender Liste', () => {
    expect(findRuntimeDataSource(liste, 'gibt-es-nicht')).toBeUndefined()
    expect(findRuntimeDataSource(liste, '')).toBeUndefined()
    expect(findRuntimeDataSource(undefined, 'terminplaner')).toBeUndefined()
    expect(findRuntimeDataSource('quatsch', 'terminplaner')).toBeUndefined()
  })

  it('ignoriert kaputte Eintraege statt zu raten; fehlendes indexField wird leer', () => {
    expect(findRuntimeDataSource([{ id: 'x', name: 42, tableId: 'A' }], 'x')).toBeUndefined()
    expect(findRuntimeDataSource([{ id: 'x', name: 'X', tableId: 'A' }], 'x'))
      .toEqual({ id: 'x', name: 'X', tableId: 'A', indexField: '' })
  })
})

describe('getField (Feldcode -> Wert)', () => {
  it('liest direkte Properties und trimmt', () => {
    expect(getField({ '78_30': ' Minka ' }, '78_30')).toBe('Minka')
    expect(getField({ name: 'Buddy' }, 'name')).toBe('Buddy')
  })

  it('faellt auf pos_len aus dem SATZ-Rohstring zurueck (SATZNEU vor SATZ)', () => {
    //            0123456789
    const satz = 'K2      Katze                         '
    expect(getField({ SATZ: satz }, '0_8')).toBe('K2')
    expect(getField({ SATZ: satz }, '8_30')).toBe('Katze')
    expect(getField({ SATZNEU: 'NEU     ', SATZ: satz }, '0_8')).toBe('NEU')
  })

  it('liefert leer bei fehlendem Feld, leerem Code oder kaputter Zeile', () => {
    expect(getField({ a: 1 }, 'fehlt')).toBe('')
    expect(getField({ a: 1 }, '')).toBe('')
    expect(getField(null, '78_30')).toBe('')
    expect(getField('keine zeile', '78_30')).toBe('')
  })
})

describe('setField (Schreibweg 5.3b: Wert -> Zeile)', () => {
  it('setzt eine direkte Property', () => {
    const row: Record<string, unknown> = { '253_30': '2', name: 'alt' }
    expect(setField(row, '253_30', '3')).toBe(true)
    expect(setField(row, 'name', 'neu')).toBe(true)
    expect(row['253_30']).toBe('3')
    expect(row.name).toBe('neu')
  })

  it('patcht pos_len im SATZ-Rohstring: exakte Feldlaenge, Rest unberuehrt', () => {
    //            0123456789
    const row = { SATZ: 'K2      Katze                         X' }
    expect(setField(row, '8_30', 'Hund')).toBe(true)
    expect(row.SATZ).toBe('K2      Hund                          X')
    expect(getField(row, '8_30')).toBe('Hund') // liest zurueck, was geschrieben wurde
    expect(getField(row, '0_8')).toBe('K2')    // Nachbarfeld unveraendert
  })

  it('kuerzt zu lange Werte auf die Feldlaenge und patcht SATZNEU vor SATZ', () => {
    const row = { SATZNEU: 'abcdefgh', SATZ: 'unberuehrt' }
    expect(setField(row, '0_4', 'LANGERWERT')).toBe(true)
    expect(row.SATZNEU).toBe('LANGefgh')
    expect(row.SATZ).toBe('unberuehrt')
  })

  it('verlaengert zu kurze Rohstrings deterministisch bis zur Feldposition', () => {
    const row = { SATZ: 'K2' }
    expect(setField(row, '8_4', 'OP')).toBe(true)
    expect(row.SATZ).toBe('K2      OP  ')
    expect(getField(row, '8_4')).toBe('OP')
  })

  it('haelt direkte Property UND Rohstring konsistent, wenn beide existieren', () => {
    const row: Record<string, unknown> = { '0_4': 'alt', SATZ: 'alt       ' }
    expect(setField(row, '0_4', 'neu')).toBe(true)
    expect(row['0_4']).toBe('neu')
    expect(row.SATZ).toBe('neu       ')
  })

  it('schreibt nichts bei kaputter Zeile, leerem Code oder unbekanntem Feld', () => {
    expect(setField(null, '0_4', 'x')).toBe(false)
    expect(setField({ SATZ: 'abc' }, '', 'x')).toBe(false)
    const row: Record<string, unknown> = { name: 'bleibt' }
    expect(setField(row, 'fehlt', 'x')).toBe(false)
    expect(row).toEqual({ name: 'bleibt' })
  })
})

describe('rowsFor (SEDATA -> Zeilen einer Quelle)', () => {
  const zeilen = [{ '10_8': 'K1' }, { '10_8': 'K2' }]

  it('findet den SEFileLoop-Eintrag ueber den ALIAS (Array-Form, Gross/klein egal)', () => {
    const seData = { Daten: { SEFileLoop: [
      { ALIAS: 'Kundenhaustiere', Zeilen: [{ x: 1 }] },
      { ALIAS: ' terminplaner ', Zeilen: zeilen },
    ] } }
    expect(rowsFor(seData, 'Terminplaner', 'IDBID0001')).toEqual(zeilen)
  })

  it('findet den SEFileLoop-Eintrag in der Objekt-Form (Schluessel oder ALIAS)', () => {
    const perKey = { Daten: { SEFileLoop: { Terminplaner: { Saetze: zeilen } } } }
    expect(rowsFor(perKey, 'Terminplaner', 'IDBID0001')).toEqual(zeilen)
    const perAlias = { Daten: { SEFileLoop: { egal: { alias: 'Terminplaner', rows: zeilen } } } }
    expect(rowsFor(perAlias, 'Terminplaner', 'IDBID0001')).toEqual(zeilen)
  })

  it('faellt auf Tabellen zurueck (ALIAS- oder IDB-ID-Schluessel, auch als JSON-String)', () => {
    const perAlias = { Daten: { Tabellen: { Terminplaner: { Daten: zeilen } } } }
    expect(rowsFor(perAlias, 'Terminplaner', 'IDBID0001')).toEqual(zeilen)
    const perId = { Daten: { Tabellen: { IDBID0001: { Zeilen: JSON.stringify(zeilen) } } } }
    expect(rowsFor(perId, 'Terminplaner', 'IDBID0001')).toEqual(zeilen)
  })

  it('liefert [] ohne SEDATA, ohne Daten oder ohne passenden Eintrag', () => {
    expect(rowsFor(undefined, 'Terminplaner', 'IDBID0001')).toEqual([])
    expect(rowsFor({}, 'Terminplaner', 'IDBID0001')).toEqual([])
    expect(rowsFor({ Daten: { SEFileLoop: [] } }, 'Terminplaner', 'IDBID0001')).toEqual([])
  })
})

describe('columnIndexFor (Zeilenwert -> Spalte)', () => {
  const values = ['', '2', 'Fertig']

  it('trifft exakt (getrimmt, Gross/klein egal)', () => {
    expect(columnIndexFor('2', values)).toBe(1)
    expect(columnIndexFor(' fertig ', values)).toBe(2)
  })

  it('kein Treffer oder leerer Wert -> erste Spalte (Auffang)', () => {
    expect(columnIndexFor('3', values)).toBe(0)
    expect(columnIndexFor('', values)).toBe(0)
  })

  it('leere Spalten-Datenwerte treffen nie (nur als Auffang erreichbar)', () => {
    // Zeilenwert '' darf NICHT auf die leere Spalte 1 "matchen", sondern
    // faellt in den Auffang (hier ebenfalls 0 — aber ueber die Auffang-Regel).
    expect(columnIndexFor('', ['x', '', 'y'])).toBe(0)
    expect(columnIndexFor('unbekannt', ['x', '', 'y'])).toBe(0)
  })
})
