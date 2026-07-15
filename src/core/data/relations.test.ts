import { describe, expect, it } from 'vitest'
import {
  formatRelationSyntax,
  parseRelationSyntax,
  relationGroup,
  relationMatchesSearch,
  relationPlaceholderNames,
  resolveParams,
  sanitizeRelationTemplates,
} from './relations'

describe('Relations-Syntax', () => {
  it('bewahrt führende Nullen, Reihenfolge und leere Parameter', () => {
    expect(parseRelationSyntax(
      'GET_RELATION[01!00!LAG_1_4!ZZZZ!0!!!ART_1_25]',
    )).toEqual({
      verb: 'GET_RELATION',
      nr: '01',
      params: ['00', 'LAG_1_4', 'ZZZZ', '0', '', '', 'ART_1_25'],
      allowExtraParams: false,
    })
  })

  it('liest den letzten ] als äußeren Abschluss und erhält DATUM[10', () => {
    expect(parseRelationSyntax('GET_RELATION[518!IDBSE0586_1228_10!DATUM[10]'))
      .toEqual({
        verb: 'GET_RELATION',
        nr: '518',
        params: ['IDBSE0586_1228_10', 'DATUM[10'],
        allowExtraParams: false,
      })
  })

  it('akzeptiert freie Platzhalternamen und trennt den ...-Marker ab', () => {
    const syntax = `put_relation[82!{{GJ}}!{BELART}!{EINFUEGE_SNR}!...]`
    expect(parseRelationSyntax(syntax))
      .toEqual({
        verb: 'PUT_RELATION',
        nr: '82',
        params: ['{GJ}', '{BELART}', '{EINFUEGE_SNR}'],
        allowExtraParams: true,
      })
  })

  it('formatiert die strukturierte Wahrheit ohne Informationsverlust', () => {
    const syntax = `PUTADD_RELATION[007!A!!!{VALUE}!...]`
    const parsed = parseRelationSyntax(syntax)
    expect(parsed).not.toBeNull()
    expect(formatRelationSyntax(parsed!)).toBe(syntax)
  })

  it('weist unbekannte Verben, fehlenden Abschluss und nichtnumerische NR ab', () => {
    expect(parseRelationSyntax('DELETE_RELATION[1!A]')).toBeNull()
    expect(parseRelationSyntax('GET_RELATION[1!A')).toBeNull()
    expect(parseRelationSyntax('GET_RELATION[ABC!A]')).toBeNull()
    expect(parseRelationSyntax('GET_RELATION[1!A]\nPUT_RELATION[2!B]')).toBeNull()
  })
})

describe('Relations-Vorlagen', () => {
  it('füllt auch benutzerdefinierte Platzhalter', () => {
    expect(resolveParams(
      { params: ['{GJ}', 'vor-{BELART}', '{NICHT_GESETZT}'] },
      { GJ: '2026', BELART: 'AU' },
    )).toEqual(['2026', 'vor-AU', ''])
  })

  it('bewahrt allowExtraParams beim Laden und setzt Altbestände auf false', () => {
    expect(sanitizeRelationTemplates([
      { id: 'a', name: 'A', verb: 'GET_RELATION', nr: '01', params: [''], allowExtraParams: true },
      { id: 'b', name: 'B', verb: 'PUT_RELATION', nr: '174', params: [] },
    ])).toEqual([
      { id: 'a', name: 'A', verb: 'GET_RELATION', nr: '01', params: [''], allowExtraParams: true },
      { id: 'b', name: 'B', verb: 'PUT_RELATION', nr: '174', params: [], allowExtraParams: false },
    ])
  })

  it('gruppiert GET als Lesen und PUT/PUTADD als Schreiben', () => {
    expect(relationGroup({ verb: 'GET_RELATION' })).toBe('lesen')
    expect(relationGroup({ verb: 'PUT_RELATION' })).toBe('schreiben')
    expect(relationGroup({ verb: 'PUTADD_RELATION' })).toBe('schreiben')
  })

  it('sucht gemeinsam in Name, Nummer und vollständiger Syntax', () => {
    const relation = {
      name: 'Termin verschieben',
      verb: 'PUT_RELATION' as const,
      nr: '0174',
      params: ['{PINDEX}', '', '{VALUE}'],
      allowExtraParams: true,
    }
    expect(relationMatchesSearch(relation, 'termin')).toBe(true)
    expect(relationMatchesSearch(relation, '0174')).toBe(true)
    expect(relationMatchesSearch(relation, '!!{value}!...')).toBe(true)
    expect(relationMatchesSearch(relation, '640')).toBe(false)
  })

  it('liefert freie Platzhalter einmalig in Syntax-Reihenfolge', () => {
    expect(relationPlaceholderNames({
      params: ['fest', '{GJ}', 'vor-{BELART}', '{GJ}', ''],
    })).toEqual(['GJ', 'BELART'])
  })
})
