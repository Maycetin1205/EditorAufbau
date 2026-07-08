// Unit-Tests fuer die Relation-Vorlagen (Kap. 5.3b/5.5):
// die mitgelieferte Standard-PUT-Vorlage (Seed), die relId-Ableitung (OHNE
// 'IDB'-Praefix — die dokumentierte Falle aus CLAUDE.md 5.3b (a)), die
// deterministische Platzhalter-Aufloesung, das Platzhalter-Vokabular und
// der strukturelle Lader fuer gespeicherte Nutzer-Vorlagen.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import {
  BUILTIN_RELATION_TEMPLATES,
  relIdFromIdbId,
  resolveParams,
  sanitizeRelationTemplates,
  splitFieldCode,
  unknownPlaceholders,
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

const standardPut = BUILTIN_RELATION_TEMPLATES.find((t) => t.id === 'standard-put')

describe('Standard-PUT-Vorlage + resolveParams', () => {
  it('die mitgelieferte Vorlage traegt das dokumentierte Param-Layout', () => {
    expect(standardPut).toBeDefined()
    expect(standardPut!.verb).toBe('PUT_RELATION')
    expect(standardPut!.nr).toBe('174')
    expect(standardPut!.params).toEqual(['{FELD_POS}', '{FELD_LEN}', 'L', '{PINDEX}', '{RELID}', '{VALUE}'])
  })

  it('fuellt Platzhalter aus dem Kontext, feste Werte laufen durch', () => {
    expect(resolveParams(standardPut!, {
      FELD_POS: '253', FELD_LEN: '30', PINDEX: '17',
      RELID: 'ID0001', VALUE: 'Zimmer 3',
    })).toEqual(['253', '30', 'L', '17', 'ID0001', 'Zimmer 3'])
  })

  it('fehlende Platzhalter werden leer, nie undefined', () => {
    expect(resolveParams(standardPut!, {})).toEqual(['', '', 'L', '', '', ''])
  })

  it('fuellt auch die Kap.-8-Platzhalter (DROP_PINDEX/SELKEY/NOW_DATE)', () => {
    expect(resolveParams(
      { params: ['{DROP_PINDEX}', '{SELKEY}', '{NOW_DATE}'] },
      { DROP_PINDEX: '7', NOW_DATE: '08.07.2026' },
    )).toEqual(['7', '', '08.07.2026'])
  })

  it('Anzeigename ist kein Technikwert', () => {
    // Regel Technikwert != Anzeigename: kein Anzeigename enthaelt NR/Verb roh.
    for (const t of BUILTIN_RELATION_TEMPLATES) {
      expect(t.name).not.toContain(t.nr)
      expect(t.name).not.toContain('_RELATION')
    }
  })
})

describe('unknownPlaceholders (Formular-Validierung 5.5b)', () => {
  it('meldet Tippfehler-Platzhalter, kennt das ganze Vokabular', () => {
    expect(unknownPlaceholders('{PINDX}')).toEqual(['PINDX'])
    expect(unknownPlaceholders('{FELD_POS}{FELD_LEN}{PINDEX}{SELKEY}{DROP_PINDEX}{RELID}{VALUE}{NOW_DATE}')).toEqual([])
  })

  it('feste Werte ohne Platzhalter sind immer gueltig', () => {
    expect(unknownPlaceholders('L')).toEqual([])
    expect(unknownPlaceholders('')).toEqual([])
  })
})

describe('sanitizeRelationTemplates (struktureller Lader, Muster sanitizeDataSources)', () => {
  const gueltig = {
    id: 'r1', name: 'Termin verschieben', verb: 'PUT_RELATION',
    nr: '1205', params: ['{PINDEX}', 'L'],
  }

  it('laedt gueltige Vorlagen und dedupliziert ids', () => {
    expect(sanitizeRelationTemplates([gueltig, { ...gueltig, name: 'Doppelt' }]))
      .toEqual([{ ...gueltig, params: ['{PINDEX}', 'L'] }])
  })

  it('verwirft Muell, leere Pflichtfelder und unbekannte Verben', () => {
    expect(sanitizeRelationTemplates('quatsch')).toEqual([])
    expect(sanitizeRelationTemplates([
      null,
      { ...gueltig, id: '' },
      { ...gueltig, name: '  ' },
      { ...gueltig, verb: 'DELETE_RELATION' },
      { ...gueltig, nr: '' },
    ])).toEqual([])
  })

  it('verwirft Vorlagen mit kaputten params KOMPLETT (Stelligkeit!)', () => {
    expect(sanitizeRelationTemplates([
      { ...gueltig, params: 'kein-array' },
      { ...gueltig, params: ['ok', 42] },
    ])).toEqual([])
  })
})
