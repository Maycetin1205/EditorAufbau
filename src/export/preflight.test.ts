import { describe, expect, it } from 'vitest'

import '../blocks/popup/PopupBlock'
import '../blocks/formfeld/FormFeldBlock'
import '../blocks/tabelle/TabelleBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { preflightMask } from './preflight'
import { failedChecks } from './validator'
import { registerTestBlocks, TEST_EVENT_BLOCK } from '../test/testBlocks'

registerTestBlocks()

describe('preflightMask', () => {
  it('blockt Bindungen ohne Quelle und auf geloeschte Felder (S1b)', () => {
    const feld = (props: Record<string, string>): BlockTree => ({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['feld'] },
      feld: {
        id: 'feld', type: 'formfeld', parentId: 'root', childIds: [],
        props: {
          fieldType: 'text', placeholder: 'Kunde', options: '',
          source: '', value: '', valueField: '', width: 240, ...props,
        },
      },
    })
    const sources = [{
      id: 'q1', name: 'Termine', kind: 'idb' as const,
      idbId: 'IDBID0001', indexField: '0_10', fields: [{ code: '2_8', label: 'Kunde' }],
    }]

    expect(preflightMask(feld({ source: 'q1', valueField: '2_8' }), sources, [])).toEqual([])

    expect(preflightMask(feld({ source: 'q1', valueField: '99_9' }), sources, [])
      .some((r) => r.name === 'Gebundenes Feld fehlt')).toBe(true)

    expect(preflightMask(feld({ valueField: '2_8' }), sources, [])
      .some((r) => r.name === 'Bindung ohne Datenquelle')).toBe(true)

    const kaputt = preflightMask(feld({ source: 'weg', valueField: '2_8' }), sources, [])
    expect(kaputt.some((r) => r.name === 'Datenquelle fehlt')).toBe(true)
    expect(kaputt.some((r) => r.name === 'Gebundenes Feld fehlt')).toBe(false)
  })

  it('nennt den Baustein mit seinem Klarnamen, nicht nur mit dem Typ (2026-08-06)', () => {
    const feld = (id: string, name: string) => ({
      id, type: 'formfeld', parentId: 'root', childIds: [],
      props: {
        fieldType: 'text', placeholder: name, options: '',
        source: '', value: '', valueField: '99_9', width: 240,
      },
    })
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'b'] },
      a: feld('a', 'Kunde'),
      b: feld('b', 'Haustier'),
    }
    const texte = preflightMask(tree, [], []).map((r) => r.detail)

    expect(texte.some((t) => t.includes('Kunde'))).toBe(true)
    expect(texte.some((t) => t.includes('Haustier'))).toBe(true)
  })

  it('Popup-Schritt reist mit dem Klarnamen; Preflight blockt gelöschte Ziele und Doppelnamen (P-B)', () => {
    const popup = (id: string, name: string) => ({
      id, type: 'popup',
      props: { name, breite: 400, hoehe: 300 },
      parentId: 'root', childIds: [],
    })
    const knopf = {
      id: 'a', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [],
      events: {
        onClick: [{ id: 's1', type: 'POPUP_OPEN' as const, resultKey: '', popupId: 'p1' }],
      },
    }
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'p1'] },
      a: knopf,
      p1: popup('p1', 'Neue Behandlung'),
    }
    const { html } = exportMask(tree)

    const attr = /data-ff-aktionen="([^"]*)"/.exec(html)?.[1] ?? ''
    expect(attr).toContain('&quot;popup&quot;:&quot;Neue Behandlung&quot;')
    expect(attr).not.toContain('popupId')
    expect(attr).not.toContain('p1')
    expect(preflightMask(tree, [], [])).toEqual([])

    const ohneSeite: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
      a: knopf,
    }
    expect(preflightMask(ohneSeite, [], []).some((r) =>
      r.detail.includes('gelöschte Popup-Seite'))).toBe(true)

    const doppelt: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['p1', 'p2'] },
      p1: popup('p1', 'Neue Behandlung'),
      p2: popup('p2', 'Neue Behandlung'),
    }
    expect(preflightMask(doppelt, [], []).some((r) => r.name === 'Seitenname doppelt')).toBe(true)

    const grossKlein: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['p1', 'p2'] },
      p1: popup('p1', 'Neue Behandlung'),
      p2: popup('p2', 'neue behandlung'),
    }
    expect(preflightMask(grossKlein, [], []).some((r) => r.name === 'Seitenname doppelt')).toBe(true)
  })

  it('prueft Tabellenspalten und die Angabe der Quelle', () => {
    const tabelle = (spalten: { titel: string; feld: string }[], weitereQuellen: unknown[] = []): BlockTree => ({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
      tab: {
        id: 'tab', type: 'tabelle', parentId: 'root', childIds: [],
        props: {
          source: 'termine', weitereQuellen, spalten,
          tagField: '', suche: 'nein',
        },
      },
    })
    const verbindung = [{ quelleId: 'tiere', keyPairs: [{ fromField: '10_8', toField: '10_8' }] }]
    const sources = [
      {
        id: 'termine', name: 'Terminplaner', kind: 'idb' as const, idbId: 'IDBID0001',
        indexField: '0_10', fields: [{ code: '10_8', label: 'Adressnummer' }, { code: '78_30', label: 'Tiername' }],
      },
      {
        id: 'tiere', name: 'Kundenhaustiere', kind: 'idb' as const, idbId: 'IDBID0004',
        fields: [{ code: '10_8', label: 'Adressnummer' }, { code: '128_350', label: 'Notiz' }],
      },
    ]
    const namen = (t: BlockTree) => preflightMask(t, sources, []).map((r) => r.name)

    expect(namen(tabelle(
      [{ titel: 'Tiername', feld: '78_30' }, { titel: 'Notiz', feld: 'tiere::128_350' }],
      verbindung,
    ))).toEqual([])

    expect(namen(tabelle([{ titel: 'Weg', feld: '99_9' }])))
      .toContain('Gebundenes Feld fehlt')

    expect(namen(tabelle([{ titel: 'Notiz', feld: 'tiere::128_350' }])))
      .toContain('Verbindung fehlt')

    // Geaendert 2026-08-20: eine verknuepfte Quelle OHNE fertiges Feldpaar
    // gilt nicht mehr als fehlende Verbindung — sie ist in Reichweite und man
    // kann in ihr suchen, sie verbindet nur nichts (s. quelleBrauchbar).
    // Gemeldet wird weiter, wenn die Quelle gar nicht am Baustein haengt.
    expect(namen(tabelle(
      [{ titel: 'Notiz', feld: 'tiere::128_350' }],
      [{ quelleId: 'tiere', keyPairs: [{ fromField: '10_8', toField: '' }] }],
    ))).toEqual([])

    expect(namen(tabelle([{ titel: 'X', feld: 'gibtsnicht::1_2' }])))
      .toContain('Datenquelle unbekannt')

    expect(namen(tabelle([{ titel: 'X', feld: 'tiere::99_9' }], verbindung)))
      .toContain('Gebundenes Feld fehlt')
  })

  it('warnt bei einer Status-Spalte ohne Zuordnung — ohne den Export zu blocken', () => {
    const sources = [{
      id: 'termine', name: 'Terminplaner', kind: 'idb' as const, idbId: 'IDBID0001',
      indexField: '0_10', fields: [{ code: '78_30', label: 'Zustand' }],
    }]
    const tabelle = (spalten: unknown[]): BlockTree => ({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
      tab: {
        id: 'tab', type: 'tabelle', parentId: 'root', childIds: [],
        props: { source: 'termine', spalten, tagField: '', suche: 'nein' },
      },
    })

    const ohne = preflightMask(tabelle([{ titel: 'Zustand', feld: '78_30', art: 'status' }]), sources, [])
    expect(ohne.map((r) => r.name)).toEqual(['Status-Zuordnung fehlt'])
    expect(ohne[0].warnung).toBe(true)
    expect(failedChecks(ohne)).toEqual([])

    expect(ohne[0].detail).toContain('Zustand')
    expect(ohne[0].detail).toContain('Grau')

    expect(preflightMask(tabelle([{
      titel: 'Zustand', feld: '78_30', art: 'status',
      zuordnung: [{ wert: 'W', name: 'Wartet', bedeutung: 'warning' }],
    }]), sources, [])).toEqual([])

    expect(preflightMask(tabelle([{ titel: 'Zustand', feld: '78_30', art: 'text' }]), sources, []))
      .toEqual([])
  })

  it('meldet eine geloeschte Quelle EINMAL, nicht zusaetzlich je gebundener Stelle', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
      tab: {
        id: 'tab', type: 'tabelle', parentId: 'root', childIds: [],
        props: {
          source: 'weg', weitereQuellen: [], spalten: [{ titel: 'Tiername', feld: '78_30' }],
          tagField: '', suche: 'nein',
        },
      },
    }
    const namen = preflightMask(tree, [], []).map((r) => r.name)
    expect(namen).toEqual(['Datenquelle fehlt'])
  })
})
