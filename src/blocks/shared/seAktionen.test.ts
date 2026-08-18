import { beforeEach, describe, expect, it, vi } from 'vitest'
import { applyPopupStep } from './seAktionen'
import { resolveActionParam } from '../../softengine/relations'
import { meldeFehler } from '../../softengine/meldung'
import type { ActionParamBinding } from '../../core/data/aktionen'

vi.mock('../../softengine/meldung', () => ({ meldeFehler: vi.fn() }))

function gemeldet(): string[] {
  return vi.mocked(meldeFehler).mock.calls.map((aufruf) => aufruf[0])
}

function fakePopup(name: string | null) {
  const attrs = new Map<string, string>(name === null ? [] : [['name', name]])
  return {
    getAttribute: (k: string) => attrs.get(k) ?? null,
    setAttribute: (k: string, v: string) => { attrs.set(k, v) },
    removeAttribute: (k: string) => { attrs.delete(k) },
    offen: () => attrs.has('offen'),
  }
}

function fakeRoot(popups: ReturnType<typeof fakePopup>[]): ParentNode {
  return {
    querySelectorAll: (selector: string) => (selector === 'ff-popup' ? popups : []),
  } as unknown as ParentNode
}

describe('applyPopupStep', () => {
  beforeEach(() => {
    vi.mocked(meldeFehler).mockClear()
  })

  it('öffnet und schließt genau das Popup mit dem Klarnamen', () => {
    const behandlung = fakePopup('Neue Behandlung')
    const anderes = fakePopup('Anderes')
    const root = fakeRoot([behandlung, anderes])

    applyPopupStep(root, 'Neue Behandlung', true)
    expect(behandlung.offen()).toBe(true)
    expect(anderes.offen()).toBe(false)

    applyPopupStep(root, 'Neue Behandlung', false)
    expect(behandlung.offen()).toBe(false)
  })

  it('ohne name-Attribut gilt der STANDARDNAME (sonst klickte der Knopf ins Leere)', () => {
    const unbenannt = fakePopup(null)
    applyPopupStep(fakeRoot([unbenannt]), 'Popup', true)
    expect(unbenannt.offen()).toBe(true)
  })

  it('leerer Name: nichts passiert und nichts wird gemeldet (kein Schritt gemeint)', () => {
    const popup = fakePopup('Da')
    applyPopupStep(fakeRoot([popup]), '', true)
    expect(popup.offen()).toBe(false)
    expect(gemeldet()).toEqual([])
  })

  it('kein Treffer: nichts passiert, aber der Bediener erfaehrt das Warum', () => {
    const popup = fakePopup('Da')
    applyPopupStep(fakeRoot([popup]), 'Gibt es nicht', true)
    expect(popup.offen()).toBe(false)
    expect(gemeldet()).toHaveLength(1)
    expect(gemeldet()[0]).toContain('Gibt es nicht')
  })

  it('schliesst beim Öffnen jedes andere Popup', () => {
    const a = fakePopup('A')
    const b = fakePopup('B')
    const root = fakeRoot([a, b])

    applyPopupStep(root, 'A', true)
    expect(a.offen()).toBe(true)

    applyPopupStep(root, 'B', true)
    expect(b.offen()).toBe(true)
    expect(a.offen()).toBe(false)
  })

  it('schliesst die anderen NICHT, wenn das Ziel gar nicht existiert', () => {
    const a = fakePopup('A')
    const root = fakeRoot([a])
    applyPopupStep(root, 'A', true)
    applyPopupStep(root, 'Gibt es nicht', true)

    expect(a.offen()).toBe(true)
  })

  it('rührt bei DOPPELTEM Namen nichts an — kein Fenster ist gemeint', () => {
    const doppelt1 = fakePopup('Gleich')
    const doppelt2 = fakePopup('Gleich')
    const offen = fakePopup('Offen')
    const root = fakeRoot([doppelt1, doppelt2, offen])
    applyPopupStep(root, 'Offen', true)

    applyPopupStep(root, 'Gleich', true)

    expect(doppelt1.offen()).toBe(false)
    expect(doppelt2.offen()).toBe(false)
    expect(offen.offen()).toBe(true)

    applyPopupStep(root, 'Gleich', false)
    expect(offen.offen()).toBe(true)
    expect(gemeldet()).toHaveLength(2)
  })
})

describe('resolveActionParam: Zwischenspeicher + Erste-Zeile-Regel (2026-07-17)', () => {
  it('step_result liest das Ergebnis über die Ketten-Position; Unsinn → leer', () => {
    const values = { context: {}, previousResult: '', stepResults: ['260', ''] }
    const b = (value: string): ActionParamBinding => ({ source: 'step_result', value })
    expect(resolveActionParam(b('0'), values, {})).toBe('260')
    expect(resolveActionParam(b('1'), values, {})).toBe('')
    expect(resolveActionParam(b('7'), values, {})).toBe('')
    expect(resolveActionParam(b('-1'), values, {})).toBe('')
    expect(resolveActionParam(b('x'), values, {})).toBe('')
  })

  it('aus loest zu leer auf, die Nachbarn behalten Position und Wert', () => {
    const values = { context: { PINDEX: '271' }, previousResult: '' }
    const params: ActionParamBinding[] = [
      { source: 'fixed', value: 'vorne' },
      { source: 'aus', value: '' },
      { source: 'context', value: 'PINDEX' },
    ]
    expect(params.map((b) => resolveActionParam(b, values, {}))).toEqual(['vorne', '', '271'])
  })

  it('step_result mit gewaehltem Feld liest DIESES Feld aus der Rohantwort (2026-08-07)', () => {
    const antwort = { MSG: { DATA: { RESULT: '271', 'IDBID0001_78_30': 'Rex', '2_8': '10001' } } }
    const values = {
      context: {},
      previousResult: '',
      stepResults: ['271'],
      stepRohErgebnisse: [antwort],
    }
    const b = (ergebnisFeld?: string): ActionParamBinding =>
      ({ source: 'step_result', value: '0', ...(ergebnisFeld ? { ergebnisFeld } : {}) })

    expect(resolveActionParam(b(), values, {})).toBe('271')

    expect(resolveActionParam(b('78_30'), values, {})).toBe('Rex')
    expect(resolveActionParam(b('2_8'), values, {})).toBe('10001')

    expect(resolveActionParam(b('99_4'), values, {})).toBe('')
    expect(resolveActionParam(b('78_30'), { ...values, stepRohErgebnisse: [undefined] }, {})).toBe('')
  })

  it('data_field ohne Ereignis-Index liest die ERSTE Zeile (Knopf-Fall)', () => {
    const runtime = {
      FF_DATA_SOURCES: [{ id: 'q1', name: 'Terminplaner', tableId: 'IDBID0001', indexField: '0_10' }],
      SEDATA: {
        Daten: {
          SEFileLoop: [{
            ALIAS: 'Terminplaner',
            Zeilen: [{ '0_10': '1', '78_30': 'Rex' }, { '0_10': '2', '78_30': 'Minka' }],
          }],
        },
      },
    }
    const binding: ActionParamBinding = { source: 'data_field', value: '78_30', dataSourceId: 'q1' }

    expect(resolveActionParam(binding, { context: {}, previousResult: '' }, runtime)).toBe('Rex')

    expect(resolveActionParam(binding, { context: { PINDEX: '2' }, previousResult: '' }, runtime)).toBe('Minka')
  })

  it('block_value liest den aktuellen Formularfeld-Wert ohne Datenquelle', () => {
    const field = {
      value: 'Rex',
      getAttribute: (name: string) => name === 'data-ff-block-id' ? 'feld-tiername' : null,
    }
    const runtime = {
      document: {
        querySelectorAll: (selector: string) => selector === '[data-ff-block-id]' ? [field] : [],
      },
    }
    const binding: ActionParamBinding = {
      source: 'block_value', blockId: 'feld-tiername', value: 'value',
    }
    const values = { context: {}, previousResult: '' }
    expect(resolveActionParam(binding, values, runtime)).toBe('Rex')
    field.value = 'Minka'
    expect(resolveActionParam(binding, values, runtime)).toBe('Minka')
    expect(resolveActionParam({ ...binding, blockId: 'weg' }, values, runtime)).toBe('')
  })
})

describe('resolveActionParam: „Feld der gewaehlten Zeile" (2026-08-06)', () => {
  const binding: ActionParamBinding = {
    source: 'gewaehlte_zeile', blockId: 'kunden', value: '0_10',
  }

  it('liest den Feldwert aus der Zeile, die der Geber gerade haelt', () => {
    const values = {
      context: {},
      previousResult: '',
      gewaehlteZeile: (id: string) => (id === 'kunden' ? { '0_10': '271', '2_8': '10001' } : undefined),
    }
    expect(resolveActionParam(binding, values, {})).toBe('271')

    expect(resolveActionParam({ ...binding, value: '2_8' }, values, {})).toBe('10001')
  })

  it('ohne Auswahl, ohne Geber und ohne Zulieferer bleibt es LEER (kein Raten)', () => {
    const ohneAuswahl = { context: {}, previousResult: '', gewaehlteZeile: () => undefined }
    expect(resolveActionParam(binding, ohneAuswahl, {})).toBe('')

    const anderer = {
      context: {},
      previousResult: '',
      gewaehlteZeile: (id: string) => (id === 'belege' ? { '0_10': '99' } : undefined),
    }
    expect(resolveActionParam(binding, anderer, {})).toBe('')

    expect(resolveActionParam(binding, { context: {}, previousResult: '' }, {})).toBe('')
  })
})
