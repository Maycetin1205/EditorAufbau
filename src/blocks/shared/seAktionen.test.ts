// Wächter für die Popup-Schritte der Ketten-Laufzeit (P-B): applyPopupStep
// schaltet GENAU das Popup mit dem Klarnamen — mehr nicht. DOM-frei getestet
// über einen Attrappen-Wurzelknoten (Node-Umgebung, Muster seRuntime.test).

import { describe, expect, it } from 'vitest'
import { applyPopupStep } from './seAktionen'
import { resolveActionParam } from '../../softengine/relations'
import type { ActionParamBinding } from '../../core/data/aktionen'

function fakePopup(name: string) {
  const attrs = new Map<string, string>([['name', name]])
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

  it('leerer Name oder kein Treffer: nichts passiert (still-harmlos)', () => {
    const popup = fakePopup('Da')
    applyPopupStep(fakeRoot([popup]), '', true)
    applyPopupStep(fakeRoot([popup]), 'Gibt es nicht', true)
    expect(popup.offen()).toBe(false)
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
    // Knopf-Klick: kein PINDEX im Ereignis → erste Zeile (wie feldRuntime).
    // Vorher lief dieser Fall still auf '' (Befund 2026-07-17).
    expect(resolveActionParam(binding, { context: {}, previousResult: '' }, runtime)).toBe('Rex')
    // Mit Ereignis-Index (Kanban-Karte) weiterhin die passende Zeile.
    expect(resolveActionParam(binding, { context: { PINDEX: '2' }, previousResult: '' }, runtime)).toBe('Minka')
  })
})
