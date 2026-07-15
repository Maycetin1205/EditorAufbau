import { describe, expect, it } from 'vitest'
import type { RelationTemplate } from './relations'
import {
  createStep,
  defaultRelationParams,
  parseBlockEvents,
  sanitizeBlockEvents,
  serializeBlockEvents,
  stepProblem,
  type BlockEventsMap,
  type RelationStep,
  type StartToolStep,
} from './aktionen'

const relation: RelationTemplate = {
  id: 'rel-1',
  name: 'Termin schreiben',
  verb: 'PUT_RELATION',
  nr: '0174',
  params: ['fest', '{PINDEX}', '{WERT}'],
  allowExtraParams: true,
}

describe('Aktionsmodell', () => {
  it('trennt Werkzeug- und Relationsfelder', () => {
    expect(createStep('START_TOOL')).toMatchObject({
      type: 'START_TOOL', toolNr: '', toolParams: [],
    })
    expect(createStep('RELATION')).toMatchObject({
      type: 'RELATION', relationId: '', params: [], extraParams: [],
    })
  })

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
        { source: 'fixed', value: 'A' },
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

  it('uebernimmt jede Syntaxposition mit ihrem festen oder dynamischen Startwert', () => {
    expect(defaultRelationParams(relation)).toEqual([
      { source: 'fixed', value: 'fest' },
      { source: 'context', value: 'PINDEX' },
      { source: 'fixed', value: '' },
    ])
    expect(defaultRelationParams({ params: ['', 'A'] })).toEqual([
      { source: 'fixed', value: '' },
      { source: 'fixed', value: 'A' },
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
    expect(stepProblem({ ...step, relationId: 'weg' }, [relation])).toContain('geloeschte')
  })
})
