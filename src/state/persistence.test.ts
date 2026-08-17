import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PopupBlock } from '../blocks/popup/PopupBlock'
import { ROOT_ID } from '../core/blocks/BlockData'
import { BACKUP_KEY, Editor } from './Editor'
import { sanitizeTree } from './ladeKette'
import { meldungen } from './meldungen'
import { CURRENT_SCHEMA_VERSION } from './migrations'
import {
  registerTestBlocks,
  TEST_BLOCK,
  TEST_BOX,
  TEST_EVENT_BLOCK,
} from '../test/testBlocks'

registerTestBlocks()

const KEY = 'aufbau_editor_mvp_v1'

function load(state: unknown): Editor {
  localStorage.setItem(KEY, JSON.stringify(state))
  return new Editor()
}

let abmelden: (() => void) | null = null
function captureMeldungen(): string[] {
  const msgs: string[] = []
  meldungen.leere()
  abmelden = meldungen.subscribe(() => {
    msgs.length = 0
    for (const m of meldungen.liste) msgs.push(m.text)
  })
  return msgs
}

beforeEach(() => { localStorage.clear(); meldungen.leere() })
afterEach(() => {
  abmelden?.()
  abmelden = null
  meldungen.leere()
})

describe('sanitizeTree (Laden verteidigt sich)', () => {
  it('lädt einen gesunden Baum vollständig', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'x'] },
        a: { id: 'a', type: TEST_BOX, props: { direction: 'row' }, parentId: 'root', childIds: ['b'] },
        b: { id: 'b', type: TEST_BLOCK, props: { text: 'Hallo' }, parentId: 'a', childIds: [] },
        x: { id: 'x', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: [] },
      },
      selectedId: 'b',
    })
    expect(ed.getNode('a')?.props.direction).toBe('row')
    expect(ed.getNode('b')?.props.text).toBe('Hallo')
    expect(ed.selectedId).toBe('b')
  })

  it('Inline-Edit-Werte überleben das Neuladen (Bugfix 2026-07-02)', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
        a: { id: 'a', type: TEST_BLOCK, props: { text: 'Vom Nutzer geändert' }, parentId: 'root', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('a')?.props.text).toBe('Vom Nutzer geändert')
  })

  it('verwirft unbekannte Typen, Waisen und fremde Props', () => {
    const tree = sanitizeTree({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'kaputt'] },
      a: { id: 'a', type: TEST_BLOCK, props: { text: 'ok', boese: 'injektion' }, parentId: 'root', childIds: [] },
      kaputt: { id: 'kaputt', type: 'gibt-es-nicht', props: {}, parentId: 'root', childIds: [] },
      waise: { id: 'waise', type: TEST_BLOCK, props: {}, parentId: 'nirgends', childIds: [] },
    })
    expect(tree.a?.props.text).toBe('ok')
    expect(tree.a?.props.boese).toBeUndefined()
    expect(tree.kaputt).toBeUndefined()
    expect(tree.waise).toBeUndefined()
  })

  it('überlebt Zyklen im gespeicherten Baum', () => {
    const tree = sanitizeTree({
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
      a: { id: 'a', type: TEST_BOX, props: {}, parentId: 'root', childIds: ['b'] },
      b: { id: 'b', type: TEST_BOX, props: {}, parentId: 'a', childIds: ['a'] }, // Zyklus!
    })
    expect(tree.a?.parentId).toBe(ROOT_ID)
    expect(tree.b?.childIds).toEqual([])
  })

  it('eine Auswahl auf einem Baustein, den es nicht gibt, faellt weg', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
        a: { id: 'a', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: [] },
      },
      selectedId: 'gibt-es-nicht',
    })
    expect(ed.blockCount).toBe(1)
    expect(ed.selectedId).toBeNull()
  })

  it('überlebt kompletten Müll im Speicher', () => {
    localStorage.setItem(KEY, '{{{kein json')
    const ed = new Editor()
    expect(ed.blockCount).toBe(0)
  })

  it('meldet verworfene unbekannte Typen sichtbar und zieht deren Kinder hoch', () => {
    const texte = captureMeldungen()
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t1', 'c1', 't2'] },
        t1: { id: 't1', type: 'text', props: {}, parentId: 'root', childIds: [] },

        c1: { id: 'c1', type: 'container', props: {}, parentId: 'root', childIds: ['drin'] },
        drin: { id: 'drin', type: TEST_BLOCK, props: { text: 'Gerettet' }, parentId: 'c1', childIds: [] },
        t2: { id: 't2', type: 'text', props: {}, parentId: 'root', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('t1')).toBeUndefined()
    expect(ed.getNode('c1')).toBeUndefined()
    expect(ed.getNode('drin')?.props.text).toBe('Gerettet')
    expect(ed.getNode('drin')?.parentId).toBe(ed.rootId)

    expect(ed.getNode(ed.rootId)?.childIds).toEqual(['drin'])
    expect(texte).toHaveLength(1)
    expect(texte[0]).toContain('3 Baustein(e)')
    expect(texte[0]).toContain('"text"')
    expect(texte[0]).toContain('"container"')
  })
})

describe('Notfallkopie bei unlesbarem Stand (U1)', () => {
  it('sichert kaputtes JSON als Notfallkopie und meldet es, statt still leer zu starten', () => {
    const msgs = captureMeldungen()
    localStorage.setItem(KEY, '{{{kein json')
    const ed = new Editor()
    expect(ed.blockCount).toBe(0)
    expect(localStorage.getItem(BACKUP_KEY)).toBe('{{{kein json')
    expect(msgs).toHaveLength(1)
    expect(msgs[0]).toContain('beschädigt')
    expect(msgs[0]).toContain(BACKUP_KEY)
  })

  it('behandelt gültiges JSON ohne verwertbaren Baum wie einen Lesefehler', () => {
    const msgs = captureMeldungen()

    const raw = JSON.stringify({ schemaVersion: 2, tree: 'kaputt', selectedId: null })
    localStorage.setItem(KEY, raw)
    const ed = new Editor()
    expect(ed.blockCount).toBe(0)
    expect(localStorage.getItem(BACKUP_KEY)).toBe(raw)
    expect(msgs).toHaveLength(1)
  })

  it('überschreibt eine bereits vorhandene Notfallkopie NICHT (früheste bleibt)', () => {
    captureMeldungen()
    localStorage.setItem(BACKUP_KEY, 'aeltere kopie')
    localStorage.setItem(KEY, '{{{kein json')
    new Editor()
    expect(localStorage.getItem(BACKUP_KEY)).toBe('aeltere kopie')
  })

  it('der Autosave überschreibt die Notfallkopie nie (getrennter Schlüssel)', () => {
    vi.useFakeTimers()
    try {
      captureMeldungen()
      localStorage.setItem(KEY, '{{{kein json')
      const ed = new Editor()
      const kopie = localStorage.getItem(BACKUP_KEY)
      expect(kopie).toBe('{{{kein json')

      ed.addBlock(TEST_BLOCK)
      vi.runAllTimers()

      const gespeichert = localStorage.getItem(KEY)
      expect(gespeichert).not.toBe('{{{kein json')
      expect(() => JSON.parse(gespeichert as string)).not.toThrow()

      expect(localStorage.getItem(BACKUP_KEY)).toBe(kopie)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('Der Browserstart laedt nachsichtig (Nutzer-Ansage 2026-08-12)', () => {
  const ZUKUNFT = JSON.stringify({
    schemaVersion: CURRENT_SCHEMA_VERSION + 1,
    tree: {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'neu'] },
      a: { id: 'a', type: TEST_BLOCK, props: { text: 'Arbeit' }, parentId: 'root', childIds: [] },
      neu: { id: 'neu', type: 'gibt-es-erst-2027', props: { wichtig: 'ja' }, parentId: 'root', childIds: [] },
    },
    selectedId: null,
  })

  it('ein Stand aus einer neueren Version laedt, was diese App lesen kann', () => {
    const msgs = captureMeldungen()
    localStorage.setItem(KEY, ZUKUNFT)
    const ed = new Editor()
    expect(ed.getNode('a')?.props.text).toBe('Arbeit')
    expect(ed.getNode('neu')).toBeUndefined()
    expect(msgs.some((m) => m.includes('gibt-es-erst-2027'))).toBe(true)
  })

  it('und der Autosave laeuft normal weiter', () => {
    captureMeldungen()
    vi.useFakeTimers()
    try {
      localStorage.setItem(KEY, ZUKUNFT)
      const ed = new Editor()
      ed.addBlock(TEST_BLOCK)
      vi.runAllTimers()
      expect(localStorage.getItem(KEY)).not.toBe(ZUKUNFT)
    } finally {
      vi.useRealTimers()
    }
  })

  it('ein Stand der AKTUELLEN Version laedt unveraendert', () => {
    const ed = load({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
        a: { id: 'a', type: TEST_BLOCK, props: { text: 'Arbeit' }, parentId: 'root', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('a')?.props.text).toBe('Arbeit')
  })
})

describe('Aktionsketten (Z2) im Speicher', () => {
  const schritt = { id: 's1', type: 'START_TOOL', resultKey: '', toolNr: '3003', toolParams: ['{PINDEX}'] }

  it('Ketten überleben das Neuladen', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
        a: { id: 'a', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [], events: { onClick: [schritt] } },
      },
      selectedId: null,
    })
    expect(ed.getNode('a')?.events).toEqual({ onClick: [schritt] })
  })

  it('verwirft Ketten an nicht deklarierten Ereignissen und kaputte Schritte', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'b', 'c'] },

        a: { id: 'a', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [], events: { onClick: [schritt], onFremd: [schritt] } },

        b: { id: 'b', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [], events: { onClick: [{ ...schritt, toolNr: 7 }] } },

        c: { id: 'c', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: [], events: { onClick: [schritt] } },
      },
      selectedId: null,
    })
    expect(ed.getNode('a')?.events).toEqual({ onClick: [schritt] })
    expect(ed.getNode('b')?.events).toBeUndefined()
    expect(ed.getNode('c')?.events).toBeUndefined()
  })

  it('ein abgeschalteter Parameter (aus) reisst die Kette nicht mehr mit', () => {
    const kette = [{
      id: 'r1', type: 'RELATION', resultKey: '', relationId: 'rel-1',
      params: [
        { source: 'fixed', value: 'vorne' },
        { source: 'aus', value: '' },
        { source: 'context', value: 'PINDEX' },
      ],
      extraParams: [],
    }]
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
        a: { id: 'a', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [], events: { onClick: kette } },
      },
      selectedId: null,
    })

    expect(ed.getNode('a')?.events).toEqual({ onClick: kette })
  })
})

describe('Popup-Seiten (P-A)', () => {
  it('Popup-Knoten mit Inhalt überlebt das Neuladen; die Hauptseite fließt ohne ihn', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'p'] },
        a: { id: 'a', type: TEST_BLOCK, props: { text: 'Haupt' }, parentId: 'root', childIds: [] },
        p: { id: 'p', type: 'popup', props: { name: 'Neue Behandlung', breite: 400, hoehe: 300 }, parentId: 'root', childIds: ['b'] },
        b: { id: 'b', type: TEST_BLOCK, props: { text: 'Im Popup' }, parentId: 'p', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('p')?.props.name).toBe('Neue Behandlung')
    expect(ed.getNode('b')?.parentId).toBe('p')

    expect(ed.childNodesOf('root').map((n) => n.id)).toEqual(['a'])

    expect(ed.pages.map((s) => s.name)).toEqual(['Hauptseite', 'Neue Behandlung'])
  })

  it('nur eine Auswahl auf der Hauptseite ueberlebt das Neuladen', () => {
    const baum = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'p'] },
      a: { id: 'a', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: [] },
      p: { id: 'p', type: 'popup', props: { name: 'Popup' }, parentId: 'root', childIds: ['b'] },
      b: { id: 'b', type: TEST_BLOCK, props: {}, parentId: 'p', childIds: [] },
    }
    expect(load({ tree: baum, selectedId: 'b' }).selectedId).toBeNull()
    expect(load({ tree: baum, selectedId: 'a' }).selectedId).toBe('a')
  })

  it('addSeite: eindeutiger Name, Seite wird aktiv, Anlegen+Benennen = EIN Undo-Schritt', () => {
    const ed = new Editor()
    const p1 = ed.addSeite(PopupBlock.blockType)
    const p2 = ed.addSeite(PopupBlock.blockType)
    expect(p1).not.toBeNull()
    expect(p2).not.toBeNull()
    expect(ed.getNode(p1!.id)?.props.name).toBe('Popup')
    expect(ed.getNode(p2!.id)?.props.name).toBe('Popup 2')
    expect(ed.activePageId).toBe(p2!.id)
    ed.undo()

    expect(ed.getNode(p2!.id)).toBeUndefined()
    expect(ed.activePageId).toBe(ed.rootId)
    expect(ed.pages.map((s) => s.name)).toEqual(['Hauptseite', 'Popup'])
  })
})

