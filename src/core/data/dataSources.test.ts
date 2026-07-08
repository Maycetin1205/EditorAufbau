// Datenquellen-Tests (Kap. 5.1 + 5.4)
// Wacht über das Feld-Wörterbuch: Klarnamen sind KEINE Feldcodes (Regel
// Technikwert ≠ Anzeigename, maschinell erzwungen wie die Token-Regel),
// keine TODO-Platzhalter, eindeutige Schlüssel, SoftEngine-Formatregeln.
// Ab Kap. 5.4 dazu: Quellen-ARTEN (Tabellen-ID + FELDER-Form je Art nach
// den echten behandlung-umbau-SEvariablen) und der sanitize-Lader für
// benutzerdefinierte Vorlagen aus dem localStorage.
// LEITPLANKE: Tests niemals löschen/abschwächen, um "grün" zu werden.

import { describe, expect, it } from 'vitest'
import {
  BUILTIN_DATA_SOURCES,
  felderFor,
  sanitizeDataSources,
  tableIdFor,
  type DataSource,
} from './dataSources'

const FELDCODE = /^\d+_\d+$/ // 'pos_len', z. B. '199_30'

describe('Mitgelieferte Datenquellen-Vorlagen (Feld-Wörterbuch)', () => {
  it('ids und Namen sind eindeutig und nicht leer', () => {
    const ids = BUILTIN_DATA_SOURCES.map((s) => s.id)
    const names = BUILTIN_DATA_SOURCES.map((s) => s.name)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(names).size).toBe(names.length)
    for (const s of BUILTIN_DATA_SOURCES) {
      expect(s.id).not.toBe('')
      expect(s.name).not.toBe('')
    }
  })

  it('IDB-Quellen tragen eine idbId im SoftEngine-Format IDBIDnnnn', () => {
    for (const s of BUILTIN_DATA_SOURCES) {
      expect(s.kind).toBe('idb') // Startbestand sind IDB-Tabellen
      expect(s.idbId, `${s.name}: idbId "${s.idbId}"`).toMatch(/^IDBID\d{4}$/)
    }
  })

  it('Klarnamen sind nie Feldcodes und nie leer (Technikwert ≠ Anzeigename)', () => {
    for (const s of BUILTIN_DATA_SOURCES) {
      for (const f of s.fields) {
        expect(f.label.trim(), `${s.name}: Feld ${f.code} ohne Klarnamen`).not.toBe('')
        expect(FELDCODE.test(f.label), `${s.name}: Klarname "${f.label}" sieht wie ein Feldcode aus`).toBe(false)
      }
    }
  })

  it('keine TODO-Platzhalter, Codes pro Quelle eindeutig', () => {
    for (const s of BUILTIN_DATA_SOURCES) {
      const codes = s.fields.map((f) => f.code)
      expect(new Set(codes).size, `${s.name}: doppelte Feldcodes`).toBe(codes.length)
      for (const c of codes) {
        expect(c.startsWith('TODO'), `${s.name}: Platzhalter-Code "${c}"`).toBe(false)
        expect(c.trim()).not.toBe('')
      }
    }
  })

  it('jedes Feld hat einen Beispielwert, der kein Feldcode ist (Kap. 5.2)', () => {
    for (const s of BUILTIN_DATA_SOURCES) {
      for (const f of s.fields) {
        expect(f.sample.trim(), `${s.name}: Feld "${f.label}" ohne Beispielwert`).not.toBe('')
        expect(FELDCODE.test(f.sample), `${s.name}: Beispielwert "${f.sample}" sieht wie ein Feldcode aus`).toBe(false)
      }
    }
  })
})

// Referenz: behandlung-umbau index.basis.SEvariablen.json — IDB-Tabellen
// exportieren FELDER '*', Stammtabellen (ADR/ART/BEL) die explizite Liste.
describe('Quellen-Arten → Tabellen-ID + FELDER-Form (Kap. 5.4)', () => {
  const stamm = (kind: DataSource['kind']): DataSource => ({
    id: 'x',
    name: 'X',
    kind,
    fields: [
      { code: '2_8', label: 'Nummer', sample: 'K2' },
      { code: '3292_30', label: 'Vorname', sample: 'Lisa' },
    ],
  })

  it('IDB: eingegebene idbId + FELDER "*"', () => {
    const idb = BUILTIN_DATA_SOURCES[0]
    expect(tableIdFor(idb)).toBe('IDBID0001')
    expect(felderFor(idb)).toBe('*')
  })

  it('Stammtabellen: feste ID + explizite pos_len-Liste in Wörterbuch-Reihenfolge', () => {
    expect(tableIdFor(stamm('adressstamm'))).toBe('ADR')
    expect(tableIdFor(stamm('artikelstamm'))).toBe('ART')
    expect(tableIdFor(stamm('beleg'))).toBe('BEL')
    expect(felderFor(stamm('adressstamm'))).toBe('2_8,3292_30')
  })

  it('IDB ohne idbId ergibt eine leere Tabellen-ID (Formular erzwingt die Eingabe)', () => {
    expect(tableIdFor({ ...stamm('idb'), idbId: undefined })).toBe('')
  })
})

describe('sanitizeDataSources (Lader für benutzerdefinierte Vorlagen)', () => {
  it('übernimmt gültige Einträge vollständig', () => {
    const roh = [{
      id: 'eigene',
      name: 'Eigene Tabelle',
      kind: 'idb',
      idbId: 'IDBID0007',
      indexField: '0_10',
      fields: [{ code: '10_8', label: 'Nummer', sample: 'A1' }],
    }]
    expect(sanitizeDataSources(roh)).toEqual(roh)
  })

  it('verwirft Müll, kaputte Einträge, unbekannte Arten und doppelte ids', () => {
    expect(sanitizeDataSources(undefined)).toEqual([])
    expect(sanitizeDataSources('quatsch')).toEqual([])
    const roh = [
      null,
      { id: '', name: 'Ohne id', kind: 'idb', fields: [] },
      { id: 'a', name: '  ', kind: 'idb', fields: [] },
      { id: 'b', name: 'Unbekannte Art', kind: 'raumschiff', fields: [] },
      { id: 'c', name: 'Gültig', kind: 'beleg', fields: [] },
      { id: 'c', name: 'Doppelte id', kind: 'idb', fields: [] },
    ]
    expect(sanitizeDataSources(roh)).toEqual([
      { id: 'c', name: 'Gültig', kind: 'beleg', fields: [] },
    ])
  })

  it('repariert Felder: kaputte fliegen raus, fehlender Beispielwert wird leer', () => {
    const roh = [{
      id: 'a',
      name: 'A',
      kind: 'idb',
      idbId: 'IDBID0001',
      fields: [
        { code: '10_8', label: 'Nummer' },
        { code: '', label: 'Ohne Code' },
        { code: '18_30', label: '' },
        'quatsch',
      ],
    }]
    expect(sanitizeDataSources(roh)).toEqual([{
      id: 'a',
      name: 'A',
      kind: 'idb',
      idbId: 'IDBID0001',
      fields: [{ code: '10_8', label: 'Nummer', sample: '' }],
    }])
  })
})
