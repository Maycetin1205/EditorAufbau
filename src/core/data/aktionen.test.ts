// Tests fuer das Aktions-Modell (Z2): Schritt-Typen-Registry, strenger
// Lader, deterministischer Export-Transport, Preflight-Tauglichkeit.
// LEITPLANKE: Tests niemals loeschen/abschwaechen.

import { describe, expect, it } from 'vitest'
import {
  AKTIONS_PLATZHALTER,
  createStep,
  parseBlockEvents,
  sanitizeBlockEvents,
  serializeBlockEvents,
  STEP_TYPES,
  stepProblem,
  stepTypeName,
  type ActionStep,
} from './aktionen'
import { resolveParams, unknownPlaceholders } from './relations'

function step(over: Partial<ActionStep> = {}): ActionStep {
  return { id: 's1', type: 'START_TOOL', resultKey: '', toolNr: '3003', toolParams: [], ...over }
}

describe('STEP_TYPES (Registry)', () => {
  it('Z2 liefert genau „Werkzeug starten" (Technikwert START_TOOL, altes Editor-Vokabular)', () => {
    expect(STEP_TYPES).toEqual([{ key: 'START_TOOL', name: 'Werkzeug starten' }])
  })

  it('Klarname ist nie der Technikwert', () => {
    for (const t of STEP_TYPES) {
      expect(t.name).not.toBe(t.key)
      expect(t.name).not.toMatch(/^[A-Z_]+$/)
    }
  })

  it('stepTypeName uebersetzt, unbekannte Keys fallen auf den Key zurueck', () => {
    expect(stepTypeName('START_TOOL')).toBe('Werkzeug starten')
    expect(stepTypeName('FREMD')).toBe('FREMD')
  })
})

describe('createStep', () => {
  it('erzeugt frische Schritte mit id + Defaults (resultKey ab Tag 1 im Modell)', () => {
    const s = createStep('START_TOOL')
    expect(s).not.toBeNull()
    expect(s!.id).not.toBe('')
    expect(s!.type).toBe('START_TOOL')
    expect(s!.resultKey).toBe('')
    expect(s!.toolNr).toBe('')
    expect(s!.toolParams).toEqual([])
    expect(createStep('START_TOOL')!.id).not.toBe(s!.id)
  })

  it('unbekannter Typ -> null', () => {
    expect(createStep('RELATION')).toBeNull()
  })
})

describe('sanitizeBlockEvents (strenger Lader, Muster sanitizeRelationTemplates)', () => {
  it('uebernimmt gueltige Ketten nur fuer erlaubte Ereignis-Keys', () => {
    const raw = {
      onCardClick: [step()],
      onFremd: [step({ id: 's2' })],
    }
    const out = sanitizeBlockEvents(raw, ['onCardClick', 'onCardDrop'])
    expect(out).toEqual({ onCardClick: [step()] })
  })

  it('EIN kaputter Schritt verwirft die GANZE Kette des Ereignisses', () => {
    const raw = {
      onCardClick: [step(), { id: 's2', type: 'START_TOOL', resultKey: '', toolNr: 7 }],
      onCardDrop: [step({ id: 's3' })],
    }
    const out = sanitizeBlockEvents(raw, ['onCardClick', 'onCardDrop'])
    expect(out).toEqual({ onCardDrop: [step({ id: 's3' })] })
  })

  it('Schritt ohne id und doppelte ids machen die Kette kaputt', () => {
    const ohneId = { type: 'START_TOOL', resultKey: '', toolNr: '1', toolParams: [] }
    expect(sanitizeBlockEvents({ onClick: [ohneId] }, ['onClick'])).toBeUndefined()
    expect(
      sanitizeBlockEvents({ onClick: [step(), step({ toolNr: '2' })] }, ['onClick']),
    ).toBeUndefined()
  })

  it('unbekannter Schritt-Typ macht die Kette kaputt', () => {
    expect(
      sanitizeBlockEvents({ onClick: [step({ type: 'RELATION' })] }, ['onClick']),
    ).toBeUndefined()
  })

  it('Muell-Formen -> undefined', () => {
    expect(sanitizeBlockEvents(undefined, ['onClick'])).toBeUndefined()
    expect(sanitizeBlockEvents('kaputt', ['onClick'])).toBeUndefined()
    expect(sanitizeBlockEvents([], ['onClick'])).toBeUndefined()
    expect(sanitizeBlockEvents({ onClick: [] }, ['onClick'])).toBeUndefined()
    expect(sanitizeBlockEvents({ onClick: 'x' }, ['onClick'])).toBeUndefined()
  })
})

describe('serializeBlockEvents (Export-Transport)', () => {
  it('serialisiert in Registry-Reihenfolge, ohne Editor-ids, nur nicht-leere Ketten', () => {
    const events = {
      onCardDrop: [step({ id: 'b', toolNr: '7' })],
      onCardClick: [step({ id: 'a', toolParams: ['{PINDEX}'] })],
      leer: [],
    }
    const json = serializeBlockEvents(events, ['onCardClick', 'onCardDrop'])
    expect(json).toBe(
      '{"onCardClick":[{"type":"START_TOOL","resultKey":"","toolNr":"3003","toolParams":["{PINDEX}"]}],'
      + '"onCardDrop":[{"type":"START_TOOL","resultKey":"","toolNr":"7","toolParams":[]}]}',
    )
    expect(json).not.toContain('"id"')
  })

  it('nichts zu transportieren -> null', () => {
    expect(serializeBlockEvents(undefined, ['onClick'])).toBeNull()
    expect(serializeBlockEvents({}, ['onClick'])).toBeNull()
    expect(serializeBlockEvents({ onClick: [] }, ['onClick'])).toBeNull()
    expect(serializeBlockEvents({ onFremd: [step()] }, ['onClick'])).toBeNull()
  })
})

describe('parseBlockEvents (Laufzeit-Gegenstueck)', () => {
  it('liest zurueck, was serializeBlockEvents schreibt (Rundreise)', () => {
    const events = { onCardClick: [step({ toolParams: ['{PINDEX}', 'fest'] })] }
    const json = serializeBlockEvents(events, ['onCardClick'])
    expect(parseBlockEvents(json)).toEqual({
      onCardClick: [{ type: 'START_TOOL', resultKey: '', toolNr: '3003', toolParams: ['{PINDEX}', 'fest'] }],
    })
  })

  it('Muell/fremde Formen -> leere Map, kaputter Schritt verwirft die Kette', () => {
    expect(parseBlockEvents(null)).toEqual({})
    expect(parseBlockEvents('')).toEqual({})
    expect(parseBlockEvents('kein json')).toEqual({})
    expect(parseBlockEvents('[1,2]')).toEqual({})
    expect(parseBlockEvents('{"onClick":[{"type":"FREMD"}]}')).toEqual({})
  })
})

describe('Werkzeug-Parameter: Platzhalter', () => {
  it('AKTIONS_PLATZHALTER ist eine Teilmenge des Relations-Vokabulars (dieselbe Aufloesung)', () => {
    // resolveParams loest {PINDEX}/{VALUE}/{NOW_DATE} — feste Werte laufen durch.
    const out = resolveParams(
      { params: ['{PINDEX}', 'fest', '{NOW_DATE}'] },
      { PINDEX: '3', NOW_DATE: '13.07.2026' },
    )
    expect(out).toEqual(['3', 'fest', '13.07.2026'])
  })

  it('unknownPlaceholders mit engem Vokabular faengt Relations-Platzhalter, die hier nichts verloren haben', () => {
    expect(unknownPlaceholders('{PINDEX}', AKTIONS_PLATZHALTER)).toEqual([])
    expect(unknownPlaceholders('{FELD_POS}', AKTIONS_PLATZHALTER)).toEqual(['FELD_POS'])
    expect(unknownPlaceholders('{PINDX}', AKTIONS_PLATZHALTER)).toEqual(['PINDX'])
  })
})

describe('stepProblem (Preflight-Tauglichkeit)', () => {
  it('Werkzeug starten ohne Nummer -> verstaendliche Meldung', () => {
    expect(stepProblem(step({ toolNr: '' }))).toContain('Werkzeug-Nummer')
    expect(stepProblem(step({ toolNr: '   ' }))).toContain('Werkzeug-Nummer')
  })

  it('vollstaendiger Schritt -> null', () => {
    expect(stepProblem(step())).toBeNull()
  })
})
