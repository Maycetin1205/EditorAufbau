// Wächter für die Popup-Schritte der Ketten-Laufzeit (P-B): applyPopupStep
// schaltet GENAU das Popup mit dem Klarnamen — mehr nicht. DOM-frei getestet
// über einen Attrappen-Wurzelknoten (Node-Umgebung, Muster seRuntime.test).
// Dazu (2026-07-17) der Wächter für „Quelle speichern": geänderte Felder →
// je ein PUT über die gewählte Vorlage, relId ohne IDB-Präfix.

import { afterEach, describe, expect, it } from 'vitest'
import { applyPopupStep, applyQuelleSpeichern } from './seAktionen'
import { geaenderteFelder, setField } from '../../softengine/data'

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

describe('Quelle speichern (2026-07-17)', () => {
  const g = globalThis as Record<string, unknown>
  afterEach(() => {
    delete g.FF_RELATIONS
    delete g.FF_DATA_SOURCES
    delete g.SEDATA
    delete g.basisHTML_SND_MSG
  })

  // Beliebige Schreib-Vorlage — die Platzhalter bestimmen die Positionen
  // (nichts fest verdrahtet; dieselbe Auflösung wie sendPut).
  const vorlage = {
    id: 'rel-put',
    verb: 'PUT_RELATION',
    nr: '0174',
    params: ['{FELD_POS}', '{FELD_LEN}', 'L', '{PINDEX}', '{RELID}', '{VALUE}'],
  }
  const quelle = { id: 'q1', name: 'Terminplaner', tableId: 'IDBID0001', indexField: '0_10' }

  function stelleWelt(row: Record<string, unknown>): Array<[string, unknown]> {
    const gesendet: Array<[string, unknown]> = []
    g.FF_RELATIONS = [vorlage]
    g.FF_DATA_SOURCES = [quelle]
    g.SEDATA = { Daten: { SEFileLoop: [{ ALIAS: 'Terminplaner', Zeilen: [row] }] } }
    g.basisHTML_SND_MSG = (verb: string, obj: unknown) => { gesendet.push([verb, obj]) }
    return gesendet
  }

  it('schreibt GENAU die lokal geänderten Felder — je ein PUT, relId ohne IDB', () => {
    const row: Record<string, unknown> = { '78_30': 'Minka', '253_30': '2', '99_10': 'bleibt' }
    const gesendet = stelleWelt(row)
    setField(row, '78_30', 'Rex')
    setField(row, '253_30', '3')

    applyQuelleSpeichern(
      { dataSourceId: 'q1', relationId: 'rel-put', pindex: { source: 'fixed', value: '7' } },
      { context: {}, previousResult: '' },
    )

    expect(gesendet).toEqual([
      ['PUT_RELATION', { NR: '0174', PARAMS: ['78', '30', 'L', '7', 'ID0001', 'Rex'] }],
      ['PUT_RELATION', { NR: '0174', PARAMS: ['253', '30', 'L', '7', 'ID0001', '3'] }],
    ])
  })

  it('PINDEX aus dem vorherigen Schritt (der gelebte GET-Fluss)', () => {
    const row: Record<string, unknown> = { '78_30': 'Minka' }
    const gesendet = stelleWelt(row)
    setField(row, '78_30', 'Rex')

    applyQuelleSpeichern(
      { dataSourceId: 'q1', relationId: 'rel-put', pindex: { source: 'previous_result', value: '' } },
      { context: {}, previousResult: '42' },
    )

    expect(gesendet).toEqual([
      ['PUT_RELATION', { NR: '0174', PARAMS: ['78', '30', 'L', '42', 'ID0001', 'Rex'] }],
    ])
  })

  it('nichts geändert oder Quelle/Vorlage unauflösbar: stiller No-op', () => {
    const row: Record<string, unknown> = { '78_30': 'Minka' }
    const gesendet = stelleWelt(row)

    applyQuelleSpeichern(
      { dataSourceId: 'q1', relationId: 'rel-put', pindex: { source: 'fixed', value: '7' } },
      { context: {}, previousResult: '' },
    )
    applyQuelleSpeichern(
      { dataSourceId: 'weg', relationId: 'rel-put', pindex: { source: 'fixed', value: '7' } },
      { context: {}, previousResult: '' },
    )
    expect(gesendet).toEqual([])
  })
})

describe('Änderungs-Spur (setField → geaenderteFelder)', () => {
  it('merkt jeden geschriebenen Feldcode genau einmal, je Zeilen-Objekt', () => {
    const row: Record<string, unknown> = { '78_30': 'Minka', '253_30': '2' }
    expect(geaenderteFelder(row)).toEqual([])
    setField(row, '78_30', 'Rex')
    setField(row, '78_30', 'Rexi') // doppelt geschrieben = EIN Eintrag
    setField(row, '253_30', '3')
    expect(geaenderteFelder(row)).toEqual(['78_30', '253_30'])
    // Neues Zeilen-Objekt (nächster Daten-Push) beginnt mit leerer Spur.
    expect(geaenderteFelder({ '78_30': 'Rex' })).toEqual([])
    expect(geaenderteFelder(undefined)).toEqual([])
  })

  it('nicht geschriebene Codes hinterlassen keine Spur', () => {
    const row: Record<string, unknown> = {}
    expect(setField(row, '', 'x')).toBe(false)
    expect(geaenderteFelder(row)).toEqual([])
  })
})
