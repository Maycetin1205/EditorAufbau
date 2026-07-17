import { describe, expect, it } from 'vitest'
import type { DataSource } from './dataSources'
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

describe('Quelle speichern (2026-07-17)', () => {
  const schritt = {
    id: 's1',
    type: 'QUELLE_SPEICHERN' as const,
    resultKey: '',
    dataSourceId: 'q1',
    relationId: 'rel-1',
    pindex: { source: 'previous_result' as const, value: '' },
  }
  // stepProblem prüft nur die id — der Rest der Vorlage ist hier egal.
  const quelle = { id: 'q1', name: 'Terminplaner' } as unknown as DataSource

  it('createStep: Vorbelegung PINDEX = vorheriger Schritt (GET-Fluss)', () => {
    expect(createStep('QUELLE_SPEICHERN')).toMatchObject({
      type: 'QUELLE_SPEICHERN',
      dataSourceId: '',
      relationId: '',
      pindex: { source: 'previous_result', value: '' },
    })
  })

  it('transportiert Quelle, Vorlage und PINDEX — ohne Editor-id', () => {
    const raw = serializeBlockEvents({ onClick: [schritt] }, ['onClick'])
    expect(raw).not.toContain('"id"')
    expect(parseBlockEvents(raw)).toEqual({
      onClick: [{
        type: 'QUELLE_SPEICHERN',
        resultKey: '',
        dataSourceId: 'q1',
        relationId: 'rel-1',
        pindex: { source: 'previous_result', value: '' },
      }],
    })
    // Persistenz-Weg: gespeicherter Schritt bleibt vollständig erhalten.
    expect(sanitizeBlockEvents({ onClick: [schritt] }, ['onClick']))
      .toEqual({ onClick: [schritt] })
    // Kaputter pindex wird verworfen (nie raten).
    expect(sanitizeBlockEvents({
      onClick: [{ ...schritt, pindex: 'kaputt' }],
    }, ['onClick'])).toBeUndefined()
  })

  it('stepProblem: Quelle, Schreib-Vorlage und PINDEX müssen stehen', () => {
    expect(stepProblem({ ...schritt, dataSourceId: '' })).toContain('keine Quelle')
    expect(stepProblem(schritt, undefined, [])).toContain('geloeschte Datenquelle')
    expect(stepProblem({ ...schritt, relationId: '' })).toContain('keine Schreib-Vorlage')
    expect(stepProblem({ ...schritt, relationId: 'weg' }, [relation])).toContain('geloeschte Vorlage')
    // Fachliche Grenze: eine GET-Vorlage kann nichts schreiben.
    expect(stepProblem(schritt, [{ ...relation, verb: 'GET_RELATION' }]))
      .toContain('Schreib-Vorlage (PUT/PUTADD)')
    // Leerer fester PINDEX = stiller Fehlgriff -> blocken.
    expect(stepProblem({ ...schritt, pindex: { source: 'fixed', value: '' } }))
      .toContain('PINDEX')
    expect(stepProblem(schritt, [relation], [quelle])).toBeNull()
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
    // Laufzeit-Weg: das Attribut wird zurückgelesen.
    const parsed = parseBlockEvents(raw)
    expect(parsed.onClick[0]).toMatchObject({ type: 'POPUP_OPEN', popup: 'Neue Behandlung' })
    // Persistenz-Weg: der gespeicherte Schritt (popupId) bleibt erhalten.
    const sanitized = sanitizeBlockEvents(events, ['onClick'])
    expect(sanitized?.onClick[0]).toMatchObject({ type: 'POPUP_OPEN', popupId: 'seite-1' })
  })

  it('createStep legt einen leeren Popup-Schritt an', () => {
    const step = createStep('POPUP_CLOSE')
    expect(step).toMatchObject({ type: 'POPUP_CLOSE', popupId: '', resultKey: '' })
  })

  it('stepProblem: Popup-Schritt braucht ein gewähltes, vorhandenes Popup', () => {
    const leer = { ...offen, popupId: '' }
    expect(stepProblem(leer)).toContain('kein Popup')
    expect(stepProblem(offen, undefined, undefined, ['andere-seite']))
      .toContain('gelöschte Popup-Seite')
    expect(stepProblem(offen, undefined, undefined, ['seite-1'])).toBeNull()
    // Ohne Seitenwissen (Laufzeit-fern) keine falsche Meldung.
    expect(stepProblem(offen)).toBeNull()
  })
})
