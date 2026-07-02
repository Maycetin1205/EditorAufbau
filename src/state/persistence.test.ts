// Persistenz-Tests (Kap. 2.5 Sicherheitsnetz)
// Prüfen den Lade-Weg: kaputte/fremde Speicherstände dürfen den Editor nie
// zerlegen (sanitize), alte Formate werden migriert, und Inline-Edit-Werte
// überleben das Neuladen (der am 2026-07-02 gefixte Bug).
// LEITPLANKE: Tests niemals löschen/abschwächen, um "grün" zu werden.

import { beforeEach, describe, expect, it } from 'vitest'
import { Editor } from './Editor'
import { registerTestBlocks, TEST_BLOCK, TEST_BOX } from '../test/testBlocks'

registerTestBlocks()

const KEY = 'aufbau_editor_mvp_v1'

function load(state: unknown): Editor {
  localStorage.setItem(KEY, JSON.stringify(state))
  return new Editor()
}

beforeEach(() => localStorage.clear())

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
    // text ist KEIN Inspector-Feld (customProperties leer) — muss trotzdem
    // erhalten bleiben, weil es in den defaultProps deklariert ist.
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
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'kaputt'] },
        a: { id: 'a', type: TEST_BLOCK, props: { text: 'ok', boese: 'injektion' }, parentId: 'root', childIds: [] },
        kaputt: { id: 'kaputt', type: 'gibt-es-nicht', props: {}, parentId: 'root', childIds: [] },
        waise: { id: 'waise', type: TEST_BLOCK, props: {}, parentId: 'nirgends', childIds: [] },
      },
      selectedId: 'kaputt',
    })
    expect(ed.getNode('a')?.props.text).toBe('ok')
    expect(ed.getNode('a')?.props.boese).toBeUndefined() // unbekannte Keys fliegen raus
    expect(ed.getNode('kaputt')).toBeUndefined()
    expect(ed.getNode('waise')).toBeUndefined()
    expect(ed.selectedId).toBeNull() // Auswahl auf gelöschtem Knoten → weg
  })

  it('überlebt Zyklen im gespeicherten Baum', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a'] },
        a: { id: 'a', type: TEST_BOX, props: {}, parentId: 'root', childIds: ['b'] },
        b: { id: 'b', type: TEST_BOX, props: {}, parentId: 'a', childIds: ['a'] }, // Zyklus!
      },
      selectedId: null,
    })
    expect(ed.getNode('a')?.parentId).toBe(ed.rootId)
    expect(ed.getNode('b')?.childIds).toEqual([]) // Zyklus gekappt
  })

  it('überlebt kompletten Müll im Speicher', () => {
    localStorage.setItem(KEY, '{{{kein json')
    const ed = new Editor()
    expect(ed.blockCount).toBe(0) // leerer, benutzbarer Editor
  })
})

describe('Migration (altes Flach-Format)', () => {
  it('übernimmt Blöcke aus dem alten Listen-Format, Layout wird verworfen', () => {
    const ed = load({
      blocks: [
        { id: 'alt1', type: TEST_BLOCK, props: { text: 'Alt' }, layout: { x: 10, y: 20, width: 100, height: 40 } },
        { id: 'alt2', type: 'unbekannt', props: {} },
      ],
    })
    expect(ed.getNode('alt1')?.props.text).toBe('Alt')
    expect(ed.getNode('alt1')?.parentId).toBe(ed.rootId)
    expect(ed.getNode('alt1')?.props.layout).toBeUndefined()
    expect(ed.getNode('alt2')).toBeUndefined()
  })
})
