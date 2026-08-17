import { beforeEach, describe, expect, it, vi } from 'vitest'

import '../blocks/card/CardBlock'
import '../blocks/kanban/KanbanBlock'
import '../blocks/popup/PopupBlock'

import '../blocks/tabelle/TabelleBlock'
import { DataSourceStore } from './DataSourceStore'
import { Editor } from './Editor'
import { pruefeBaumStand } from './ladeKette'
import { registerTestBlocks, TEST_BLOCK } from '../test/testBlocks'

registerTestBlocks()

const KEY = 'aufbau_editor_mvp_v1'
const QUELLEN_KEY = 'aufbau_editor_datenquellen_v1'

beforeEach(() => { localStorage.clear() })

function lade(tree: Record<string, unknown>): Editor {
  localStorage.setItem(KEY, JSON.stringify({ schemaVersion: 5, tree, selectedId: null }))
  return new Editor()
}

function pruefe(tree: Record<string, unknown>) {
  return pruefeBaumStand({ schemaVersion: 5, tree })
}

const MIT_WAISE = {
  root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
  a: { id: 'a', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: [] },
  waise: { id: 'waise', type: TEST_BLOCK, props: { text: 'echte Arbeit' }, parentId: 'nirgends', childIds: [] },
}

const MIT_UNBEKANNTER_PROP = {
  root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
  a: { id: 'a', type: TEST_BLOCK, props: { text: 'ok', gibtEsNicht: 'wichtig' }, parentId: 'root', childIds: [] },
}

describe('Der Browser-Weg laedt nachsichtig (Nutzer-Ansage 2026-08-12)', () => {
  it('eine Waise faellt weg, der Rest oeffnet und der Autosave laeuft', () => {
    vi.useFakeTimers()
    try {
      const ed = lade(MIT_WAISE)
      expect(ed.getNode('a')).toBeDefined()
      expect(ed.getNode('waise')).toBeUndefined()

      ed.addBlock(TEST_BLOCK)
      vi.runAllTimers()
      expect(localStorage.getItem(KEY)).not.toBeNull()
      expect(localStorage.getItem(KEY)).toContain('"a"')
    } finally {
      vi.useRealTimers()
    }
  })

  it('eine unbekannte Eigenschaft faellt weg, der Baustein bleibt', () => {
    const ed = lade(MIT_UNBEKANNTER_PROP)
    expect(ed.getNode('a')?.props.text).toBe('ok')
    expect(ed.getNode('a')?.props).not.toHaveProperty('gibtEsNicht')
  })

  it('eine Tabelle mit dem alten Zeilen-Waehler laedt', () => {
    const ed = lade({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
      tab: { id: 'tab', type: 'tabelle', props: { width: 'fill', proSeite: '25', zeilenWaehler: 'ja' }, parentId: 'root', childIds: [] },
    })
    expect(ed.getNode('tab')).toBeDefined()
    expect(ed.getNode('tab')?.props).not.toHaveProperty('proSeite')
    expect(ed.getNode('tab')?.props).not.toHaveProperty('zeilenWaehler')
  })
})

describe('Der Datei-Weg prueft weiter streng (pruefeBaumStand)', () => {
  it('eine Waise lehnt ab und nennt die Zahlen', () => {
    const stand = pruefe(MIT_WAISE)
    expect(stand.art).toBe('abgelehnt')
    if (stand.art === 'abgelehnt') {
      expect(stand.probleme.some((p) => p.grund.includes('fehlen Bausteine (1 von 2)'))).toBe(true)
    }
  })

  it('eine unbekannte Eigenschaft lehnt ab und nennt den Baustein', () => {
    const stand = pruefe(MIT_UNBEKANNTER_PROP)
    expect(stand.art).toBe('abgelehnt')
    if (stand.art === 'abgelehnt') {
      expect(stand.probleme.some((p) => p.stelle === 'a' && p.grund.includes('stimmen Angaben nicht'))).toBe(true)
    }
  })

  it('der Eltern-Kind-Vertrag gilt: eine Karte ausserhalb einer Spalte lehnt ab', () => {
    const stand = pruefe({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['k'] },
      k: { id: 'k', type: 'card', props: {}, parentId: 'root', childIds: [] },
    })
    expect(stand.art).toBe('abgelehnt')
    if (stand.art === 'abgelehnt') {
      expect(stand.probleme.some((p) => p.grund.includes('„card"') && p.grund.includes('„root"'))).toBe(true)
    }
  })

  it('eine abgeschaffte Eigenschaft (S2.1) ist kein Verlust', () => {
    const stand = pruefe({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
      tab: { id: 'tab', type: 'tabelle', props: { width: 'fill', proSeite: '25', zeilenWaehler: 'ja' }, parentId: 'root', childIds: [] },
    })
    expect(stand.art).toBe('ok')
  })

  it('ein alter Vorlagen-Kasten (Rohdaten-Migration) ist kein Verlust', () => {
    const stand = pruefe({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
      board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['kasten', 's1'] },
      kasten: { id: 'kasten', type: 'kanban-vorlage', props: {}, parentId: 'board', childIds: ['muster'] },
      muster: { id: 'muster', type: 'card', props: { heading: 'Musterkarte' }, parentId: 'kasten', childIds: [] },
      s1: { id: 's1', type: 'kanban-spalte', props: {}, parentId: 'board', childIds: [] },
    })
    expect(stand.art).toBe('ok')
    if (stand.art === 'ok') {
      expect(stand.baum.tree.kasten).toBeUndefined()
      expect(stand.baum.tree.muster?.props.heading).toBe('Musterkarte')
    }
  })
})

describe('Bibliotheken laden nachsichtig', () => {
  const GUTE_QUELLE = {
    id: 'q1', name: 'Terminplaner', kind: 'idb' as const, idbId: 'IDBID0001',
    fields: [{ code: '78_30', label: 'Tiername' }],
  }

  it('ein kaputter Eintrag faellt weg, der Rest oeffnet und schreibt wieder', () => {
    vi.useFakeTimers()
    try {
      localStorage.setItem(QUELLEN_KEY, JSON.stringify({ sources: [GUTE_QUELLE, { id: 'kaputt' }] }))
      const store = new DataSourceStore()
      expect(store.list).toHaveLength(1)
      store.add({ ...GUTE_QUELLE, name: 'Zweite' })
      vi.advanceTimersByTime(600)
      const roh = localStorage.getItem(QUELLEN_KEY) ?? ''
      expect(roh).toContain('Zweite')
      expect(roh).not.toContain('kaputt')
    } finally {
      vi.useRealTimers()
    }
  })
})
