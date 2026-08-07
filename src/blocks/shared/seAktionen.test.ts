// Wächter für die Popup-Schritte der Ketten-Laufzeit: applyPopupStep
// schaltet GENAU das Popup mit dem Klarnamen — mehr nicht. DOM-frei getestet
// über einen Attrappen-Wurzelknoten (Node-Umgebung, Muster seRuntime.test).

import { describe, expect, it } from 'vitest'
import { applyPopupStep } from './seAktionen'
import { resolveActionParam } from '../../softengine/relations'
import type { ActionParamBinding } from '../../core/data/aktionen'

// `name: null` = Popup OHNE name-Attribut (so exportiert der Export seit
// 2026-08-06 ein nie umbenanntes Popup — Standardwerte reisen nicht mit).
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
    // Ein nie umbenanntes Popup heisst „Popup" und traegt seit 2026-08-06 kein
    // Attribut mehr. Die Kette sucht trotzdem nach dem Klarnamen — findet sie
    // ihn nicht, passiert beim Klick NICHTS und niemand sieht warum (Regel 4).
    const unbenannt = fakePopup(null)
    applyPopupStep(fakeRoot([unbenannt]), 'Popup', true)
    expect(unbenannt.offen()).toBe(true)
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

  it('step_result mit gewaehltem Feld liest DIESES Feld aus der Rohantwort (2026-08-07)', () => {
    // Der Ergebnis-Skalar traegt nur EINEN Wert (RESULT/PINDEX/…). Wer ein
    // anderes Feld der Antwort braucht, waere ohne die Rohantwort verloren —
    // sie reist deshalb an denselben Indizes mit.
    const antwort = { MSG: { DATA: { RESULT: '271', 'IDBID0001_78_30': 'Rex', '2_8': '10001' } } }
    const values = {
      context: {},
      previousResult: '',
      stepResults: ['271'],
      stepRohErgebnisse: [antwort],
    }
    const b = (ergebnisFeld?: string): ActionParamBinding =>
      ({ source: 'step_result', value: '0', ...(ergebnisFeld ? { ergebnisFeld } : {}) })
    // OHNE Feld unveraendert das ganze Ergebnis — bestehende Masken aendern
    // sich nicht.
    expect(resolveActionParam(b(), values, {})).toBe('271')
    // MIT Feld: die Aufloesung ist DIESELBE wie ueberall sonst (getField),
    // also auch durch den Tabellen-Praefix hindurch.
    expect(resolveActionParam(b('78_30'), values, {})).toBe('Rex')
    expect(resolveActionParam(b('2_8'), values, {})).toBe('10001')
    // Feld gibt es nicht / keine Rohantwort (PUT-Schritt) -> leer, nie geraten.
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
    // Knopf-Klick: kein PINDEX im Ereignis → erste Zeile (wie feldRuntime).
    // Vorher lief dieser Fall still auf '' (Befund 2026-07-17).
    expect(resolveActionParam(binding, { context: {}, previousResult: '' }, runtime)).toBe('Rex')
    // Mit Ereignis-Index (Kanban-Karte) weiterhin die passende Zeile.
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
    // Der Satz-Index der gewaehlten Zeile ist damit als PUT-Parameter da —
    // genau das ging vorher nicht (nur der Ausloeser trug {PINDEX}).
    expect(resolveActionParam({ ...binding, value: '2_8' }, values, {})).toBe('10001')
  })

  it('ohne Auswahl, ohne Geber und ohne Zulieferer bleibt es LEER (kein Raten)', () => {
    const ohneAuswahl = { context: {}, previousResult: '', gewaehlteZeile: () => undefined }
    expect(resolveActionParam(binding, ohneAuswahl, {})).toBe('')
    // Anderer Geber angeklickt: dieser Parameter bleibt trotzdem leer.
    const anderer = {
      context: {},
      previousResult: '',
      gewaehlteZeile: (id: string) => (id === 'belege' ? { '0_10': '99' } : undefined),
    }
    expect(resolveActionParam(binding, anderer, {})).toBe('')
    // Gar kein Zulieferer (Kette ausserhalb der Maske): ebenfalls leer.
    expect(resolveActionParam(binding, { context: {}, previousResult: '' }, {})).toBe('')
  })
})
