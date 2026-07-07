// Datenquellen-Tests (Kap. 5.1)
// Wacht über das Feld-Wörterbuch: Klarnamen sind KEINE Feldcodes (Regel
// Technikwert ≠ Anzeigename, maschinell erzwungen wie die Token-Regel),
// keine TODO-Platzhalter, eindeutige Schlüssel, SoftEngine-Formatregeln.
// LEITPLANKE: Tests niemals löschen/abschwächen, um "grün" zu werden.

import { describe, expect, it } from 'vitest'
import { DATA_SOURCES, getDataSource } from './dataSources'

const FELDCODE = /^\d+_\d+$/ // 'pos_len', z. B. '199_30'

describe('Datenquellen-Vorlagen (Feld-Wörterbuch)', () => {
  it('ids und Namen sind eindeutig und nicht leer', () => {
    const ids = DATA_SOURCES.map((s) => s.id)
    const names = DATA_SOURCES.map((s) => s.name)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(names).size).toBe(names.length)
    for (const s of DATA_SOURCES) {
      expect(s.id).not.toBe('')
      expect(s.name).not.toBe('')
    }
  })

  it('idbId hat das SoftEngine-Format IDBIDnnnn', () => {
    for (const s of DATA_SOURCES) {
      expect(s.idbId, `${s.name}: idbId "${s.idbId}"`).toMatch(/^IDBID\d{4}$/)
    }
  })

  it('Klarnamen sind nie Feldcodes und nie leer (Technikwert ≠ Anzeigename)', () => {
    for (const s of DATA_SOURCES) {
      for (const f of s.fields) {
        expect(f.label.trim(), `${s.name}: Feld ${f.code} ohne Klarnamen`).not.toBe('')
        expect(FELDCODE.test(f.label), `${s.name}: Klarname "${f.label}" sieht wie ein Feldcode aus`).toBe(false)
      }
    }
  })

  it('keine TODO-Platzhalter, Codes pro Quelle eindeutig', () => {
    for (const s of DATA_SOURCES) {
      const codes = s.fields.map((f) => f.code)
      expect(new Set(codes).size, `${s.name}: doppelte Feldcodes`).toBe(codes.length)
      for (const c of codes) {
        expect(c.startsWith('TODO'), `${s.name}: Platzhalter-Code "${c}"`).toBe(false)
        expect(c.trim()).not.toBe('')
      }
    }
  })

  it('getDataSource findet Vorlagen über die id, unbekannte ids nicht', () => {
    expect(getDataSource('terminplaner')?.name).toBe('Terminplaner')
    expect(getDataSource('terminplaner')?.idbId).toBe('IDBID0005')
    expect(getDataSource('gibt-es-nicht')).toBeUndefined()
  })
})
