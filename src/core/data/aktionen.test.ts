import { describe, expect, it } from 'vitest'
import type { RelationTemplate } from './relations'
import {
  defaultRelationParams,
  ergebnisSchritteVor,
  parseBlockEvents,
  sanitizeBlockEvents,
  serializeBlockEvents,
  type ActionParamBinding,
  type ActionStep,
  type BlockEventsMap,
  type RelationStep,
  type StartToolStep,
} from './aktionen'

import { stepProblem } from './schrittPruefung'

const relation: RelationTemplate = {
  id: 'rel-1',
  name: 'Termin schreiben',
  verb: 'PUT_RELATION',
  nr: '0174',
  params: ['fest', '{PINDEX}', '{WERT}'],
  allowExtraParams: true,
}

describe('Aktionsmodell', () => {
  it('transportiert beide Schritttypen ohne Editor-IDs', () => {
    const tool: StartToolStep = {
      id: 'tool', type: 'START_TOOL', resultKey: '', toolNr: '3003', toolParams: ['{PINDEX}'],
    }
    const rel: RelationStep = {
      id: 'rel',
      type: 'RELATION',
      resultKey: '',
      relationId: relation.id,
      params: [
        { source: 'fixed', value: 'fest' },
        { source: 'context', value: 'PINDEX' },
        { source: 'block_value', value: 'value', blockId: 'feld-tiername' },
      ],
      extraParams: [{ source: 'previous_result', value: '' }],
    }
    const events: BlockEventsMap = { onClick: [tool, rel] }
    const raw = serializeBlockEvents(events, ['onClick'])
    expect(raw).not.toContain('"id"')
    expect(parseBlockEvents(raw)).toEqual({
      onClick: [
        { type: 'START_TOOL', resultKey: '', toolNr: '3003', toolParams: ['{PINDEX}'] },
        {
          type: 'RELATION', resultKey: '', relationId: relation.id,
          params: rel.params, extraParams: rel.extraParams,
        },
      ],
    })
  })

  it('laedt bestehende START_TOOL-Ketten unveraendert und verwirft kaputte Relations', () => {
    const old = {
      id: 's1', type: 'START_TOOL', resultKey: '', toolNr: '3003', toolParams: [],
    }
    expect(sanitizeBlockEvents({ onClick: [old] }, ['onClick']))
      .toEqual({ onClick: [old] })
    expect(sanitizeBlockEvents({
      onClick: [{ id: 'r1', type: 'RELATION', resultKey: '', relationId: 'rel-1', params: 'kaputt', extraParams: 'kaputt' }],
    }, ['onClick'])).toBeUndefined()
  })

  it('nimmt einen abgeschalteten Parameter (aus) an, in Syntax wie Zusatz', () => {
    const kette = [{
      id: 'r1', type: 'RELATION', resultKey: '', relationId: 'rel-1',
      params: [
        { source: 'fixed', value: 'vorne' },
        { source: 'aus', value: '' },
        { source: 'context', value: 'PINDEX' },
      ],
      extraParams: [{ source: 'aus', value: '' }],
    }]
    expect(sanitizeBlockEvents({ onClick: kette }, ['onClick'])).toEqual({ onClick: kette })

    expect(sanitizeBlockEvents({
      onClick: [{ ...kette[0], params: [{ source: 'ausgedacht', value: '' }] }],
    }, ['onClick'])).toBeUndefined()
  })

  it('transportiert einen abgeschalteten Parameter bis in die Maske', () => {
    const rel: RelationStep = {
      id: 'r1', type: 'RELATION', resultKey: '', relationId: relation.id,
      params: [
        { source: 'fixed', value: 'vorne' },
        { source: 'aus', value: '' },
        { source: 'context', value: 'PINDEX' },
      ],
      extraParams: [],
    }
    const geladen = parseBlockEvents(serializeBlockEvents({ onClick: [rel] }, ['onClick']))
    expect(geladen.onClick?.[0]).toMatchObject({ params: rel.params })
  })

  it('startet jede Syntaxposition leer, nur bekannte {KONTEXT}-Werte zugeordnet', () => {
    expect(defaultRelationParams(relation)).toEqual([
      { source: 'fixed', value: '' },
      { source: 'context', value: 'PINDEX' },
      { source: 'fixed', value: '' },
    ])
    expect(defaultRelationParams({ params: ['', 'A'] })).toEqual([
      { source: 'fixed', value: '' },
      { source: 'fixed', value: '' },
    ])
  })

  it('prueft alle Parameterpositionen ohne ihre Bedeutung zu raten', () => {
    const step: RelationStep = {
      id: 'r1', type: 'RELATION', resultKey: '', relationId: relation.id,
      params: [],
      extraParams: [],
    }
    expect(stepProblem(step, [relation])).toContain('Syntaxparameter')
    step.params = defaultRelationParams(relation)
    expect(stepProblem(step, [relation])).toBeNull()
    step.params[2] = { source: 'se_variable', value: '' }
    expect(stepProblem(step, [relation])).toContain('Parameter 3')
    expect(stepProblem({ ...step, relationId: 'weg' }, [relation])).toContain('gelöschte')
  })

  it('prueft Bausteinwerte auf vollstaendige und noch vorhandene Ziele', () => {
    const step: RelationStep = {
      id: 'r1', type: 'RELATION', resultKey: '', relationId: relation.id,
      params: [
        { source: 'fixed', value: 'fest' },
        { source: 'fixed', value: '1' },
        { source: 'block_value', value: 'value', blockId: 'feld-tiername' },
      ],
      extraParams: [],
    }
    expect(stepProblem(step, [relation], [], [], [], [
      { blockId: 'feld-tiername', prop: 'value' },
    ])).toBeNull()
    expect(stepProblem(step, [relation], [], [], [], []))
      .toContain('gelöschten Baustein')
    step.params[2] = { source: 'block_value', value: '', blockId: '' }
    expect(stepProblem(step, [relation])).toContain('Parameter 3')
  })
})

describe('Schritt-Ergebnis (Zwischenspeicher, 2026-07-17)', () => {
  const relGet: RelationTemplate = {
    id: 'rel-get', name: 'Neuer Index', verb: 'GET_RELATION', nr: '0640',
    params: ['ID0001'], allowExtraParams: false,
  }
  const kettenGet = (id: string): RelationStep => ({
    id, type: 'RELATION', resultKey: '', relationId: relGet.id,
    params: [{ source: 'fixed', value: 'ID0001' }], extraParams: [],
  })
  const kettenPut = (id: string, pindexQuelle: string): RelationStep => ({
    id, type: 'RELATION', resultKey: '', relationId: relation.id,
    params: [
      { source: 'fixed', value: 'fest' },
      { source: 'step_result', value: pindexQuelle },
      { source: 'fixed', value: 'A' },
    ],
    extraParams: [],
  })

  it('ergebnisSchritteVor: nur GET-Schritte VOR der eigenen Position', () => {
    const chain = [kettenGet('gA'), kettenPut('pB', 'gA'), kettenGet('gC')]
    const vorlagen = [relGet, relation]
    expect(ergebnisSchritteVor(chain, 'pB', vorlagen))
      .toEqual([{ id: 'gA', nr: 1, name: 'Neuer Index' }])
    expect(ergebnisSchritteVor(chain, 'gA', vorlagen)).toEqual([])

    expect(ergebnisSchritteVor(chain, undefined, vorlagen).map((s) => s.nr)).toEqual([1, 3])
  })

  it('Export übersetzt die Schritt-id in die Ketten-Position — nie die Editor-id', () => {
    const chain = [kettenGet('gA'), kettenPut('pB', 'gA')]
    const raw = serializeBlockEvents({ onClick: chain }, ['onClick'])
    expect(raw).not.toContain('gA')
    const parsed = parseBlockEvents(raw)
    expect(parsed.onClick[1]).toMatchObject({
      params: [
        { source: 'fixed', value: 'fest' },
        { source: 'step_result', value: '0' },
        { source: 'fixed', value: 'A' },
      ],
    })
  })

  it('Ergebnis-Feld reist mit — und nur an der Quelle, die es liest (2026-08-07)', () => {
    const put = kettenPut('pB', 'gA')
    put.params[1] = { source: 'step_result', value: 'gA', ergebnisFeld: '78_30' }

    put.params[2] = { source: 'fixed', value: 'A', ergebnisFeld: '2_8' }
    const gelesen = (kette: ActionStep[]): readonly ActionParamBinding[] => {
      const schritt = parseBlockEvents(serializeBlockEvents({ onClick: kette }, ['onClick'])).onClick[1]
      return schritt.type === 'RELATION' ? schritt.params : []
    }
    expect(gelesen([kettenGet('gA'), put])).toEqual([
      { source: 'fixed', value: 'fest' },

      { source: 'step_result', value: '0', ergebnisFeld: '78_30' },

      { source: 'fixed', value: 'A' },
    ])

    expect(gelesen([kettenGet('gA'), kettenPut('pB', 'gA')])[1])
      .toEqual({ source: 'step_result', value: '0' })
  })

  it('stepProblem: ein leer getipptes Ergebnis-Feld ist ein unvollstaendiger Parameter', () => {
    const put = kettenPut('pB', 'gA')
    put.params[1] = { source: 'step_result', value: 'gA', ergebnisFeld: '  ' }
    expect(stepProblem(put, [relation], undefined, undefined, ['gA'])).toContain('Parameter 2')
    put.params[1] = { source: 'step_result', value: 'gA', ergebnisFeld: '78_30' }
    expect(stepProblem(put, [relation], undefined, undefined, ['gA'])).toBeNull()
  })

  it('stepProblem: Verweis muss auf einen GET-Schritt davor zeigen', () => {
    const put = kettenPut('pB', 'gA')
    expect(stepProblem(put, [relation], undefined, undefined, ['gA'])).toBeNull()
    expect(stepProblem(put, [relation], undefined, undefined, []))
      .toContain('GET-Schritt davor')

    expect(stepProblem(put, [relation])).toBeNull()

    expect(stepProblem(kettenPut('pB', ''), [relation])).toContain('Parameter 2')
  })
})

describe('Popup-Schritte (P-B)', () => {
  const offen = {
    id: 's1', type: 'POPUP_OPEN' as const, resultKey: '', popupId: 'seite-1',
  }

  it('Editor speichert die Seiten-id, der Export reist mit dem Klarnamen — nie mit der id', () => {
    const events: BlockEventsMap = { onClick: [offen] }
    const raw = serializeBlockEvents(events, ['onClick'], (id) =>
      id === 'seite-1' ? 'Neue Behandlung' : '')
    expect(raw).toBe(JSON.stringify({
      onClick: [{ type: 'POPUP_OPEN', resultKey: '', popup: 'Neue Behandlung' }],
    }))

    const parsed = parseBlockEvents(raw)
    expect(parsed.onClick[0]).toMatchObject({ type: 'POPUP_OPEN', popup: 'Neue Behandlung' })

    const sanitized = sanitizeBlockEvents(events, ['onClick'])
    expect(sanitized?.onClick[0]).toMatchObject({ type: 'POPUP_OPEN', popupId: 'seite-1' })
  })

  it('stepProblem: Popup-Schritt braucht ein gewähltes, vorhandenes Popup', () => {
    const leer = { ...offen, popupId: '' }
    expect(stepProblem(leer)).toContain('kein Popup')
    expect(stepProblem(offen, undefined, undefined, ['andere-seite']))
      .toContain('gelöschte Popup-Seite')
    expect(stepProblem(offen, undefined, undefined, ['seite-1'])).toBeNull()

    expect(stepProblem(offen)).toBeNull()
  })
})
