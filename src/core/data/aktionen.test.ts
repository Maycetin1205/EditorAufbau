import { describe, expect, it } from 'vitest'
import type { RelationTemplate } from './relations'
import {
  createStep,
  defaultRelationParams,
  ergebnisSchritteVor,
  parseBlockEvents,
  sanitizeBlockEvents,
  serializeBlockEvents,
  type BlockEventsMap,
  type RelationStep,
  type StartToolStep,
} from './aktionen'
// Die Vollstaendigkeits-Pruefung wohnt seit 2026-08-06 nebenan
// (schrittPruefung) — dieselbe Funktion, nur eine Datei weiter.
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

  // Nutzer-Entscheidung 2026-08-06: die Syntaxzeile listet die Parameter-NAMEN,
  // nicht deren Inhalte. Sie als Startwert zu uebernehmen schickte in
  // SoftEngine jeden Feldnamen als seinen eigenen Wert (belegter Fall, s.
  // defaultRelationParams). Nur ein bekannter {KONTEXT}-Wert wird zugeordnet.
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
    expect(stepProblem({ ...step, relationId: 'weg' }, [relation])).toContain('geloeschte')
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
      .toContain('geloeschten Baustein')
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
    // Neuer Schritt (ans Ende) sieht beide GETs — zwei Zwischenspeicher
    // gleichzeitig (SE-Log „Termin anlegen": Termin- UND Haustier-Index).
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

  it('stepProblem: Verweis muss auf einen GET-Schritt davor zeigen', () => {
    const put = kettenPut('pB', 'gA')
    expect(stepProblem(put, [relation], undefined, undefined, ['gA'])).toBeNull()
    expect(stepProblem(put, [relation], undefined, undefined, []))
      .toContain('GET-Schritt davor')
    // Ohne Ketten-Wissen (Laufzeit-fern) keine falsche Meldung.
    expect(stepProblem(put, [relation])).toBeNull()
    // Leere Auswahl bleibt ein normaler unvollständiger Parameter.
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
