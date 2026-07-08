// Unit-Tests fuer die Relation-Vorlagen (Kap. 5.3b, Vorgriff auf 5.5):
// die mitgelieferte Standard-PUT-Vorlage, die relId-Ableitung (OHNE
// 'IDB'-Praefix — die dokumentierte Falle aus CLAUDE.md 5.3b (a)) und die
// deterministische Platzhalter-Aufloesung.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import {
  getRelationTemplate,
  RELATION_TEMPLATES,
  relIdFromIdbId,
  resolveParams,
  splitFieldCode,
} from './relations'

describe('relIdFromIdbId (PUT nutzt die Relations-ID OHNE IDB-Praefix)', () => {
  it("leitet 'IDBID0001' -> 'ID0001' ab (Beweis: behandlung-umbau sePut)", () => {
    expect(relIdFromIdbId('IDBID0001')).toBe('ID0001')
    expect(relIdFromIdbId('IDBID0004')).toBe('ID0004')
  })

  it('laesst Formen ohne Praefix unveraendert (erfindet nichts)', () => {
    expect(relIdFromIdbId('ID0001')).toBe('ID0001')
    expect(relIdFromIdbId('')).toBe('')
  })
})

describe('splitFieldCode (pos_len-Feldcode zerlegen)', () => {
  it("zerlegt '253_30' in Position und Laenge (Strings, wie geliefert)", () => {
    expect(splitFieldCode('253_30')).toEqual({ pos: '253', len: '30' })
    expect(splitFieldCode('0_10')).toEqual({ pos: '0', len: '10' })
  })

  it('liefert null fuer direkte Property-Namen und Muell', () => {
    expect(splitFieldCode('name')).toBeNull()
    expect(splitFieldCode('')).toBeNull()
    expect(splitFieldCode('1_2_3')).toBeNull()
  })
})

describe('Standard-PUT-Vorlage + resolveParams', () => {
  it('die mitgelieferte Vorlage traegt das dokumentierte Param-Layout', () => {
    const t = getRelationTemplate('standard-put')
    expect(t).toBeDefined()
    expect(t!.verb).toBe('PUT_RELATION')
    expect(t!.nr).toBe('174')
    expect(t!.params).toEqual(['{FELD_POS}', '{FELD_LEN}', 'L', '{PINDEX}', '{RELID}', '{VALUE}'])
  })

  it('fuellt Platzhalter aus dem Kontext, feste Werte laufen durch', () => {
    const t = getRelationTemplate('standard-put')!
    expect(resolveParams(t, {
      FELD_POS: '253', FELD_LEN: '30', PINDEX: '17',
      RELID: 'ID0001', VALUE: 'Zimmer 3',
    })).toEqual(['253', '30', 'L', '17', 'ID0001', 'Zimmer 3'])
  })

  it('fehlende Platzhalter werden leer, nie undefined', () => {
    const t = getRelationTemplate('standard-put')!
    expect(resolveParams(t, {})).toEqual(['', '', 'L', '', '', ''])
  })

  it('unbekannte Vorlagen-id -> undefined; Anzeigename ist kein Technikwert', () => {
    expect(getRelationTemplate('gibt-es-nicht')).toBeUndefined()
    // Regel Technikwert != Anzeigename: kein Anzeigename enthaelt NR/Verb roh.
    for (const t of RELATION_TEMPLATES) {
      expect(t.name).not.toContain(t.nr)
      expect(t.name).not.toContain('_RELATION')
    }
  })
})
