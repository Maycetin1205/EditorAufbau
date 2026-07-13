// Persistenz-Tests (Kap. 2.5 Sicherheitsnetz)
// Prüfen den Lade-Weg: kaputte/fremde Speicherstände dürfen den Editor nie
// zerlegen (sanitize), alte Formate werden migriert, und Inline-Edit-Werte
// überleben das Neuladen (der am 2026-07-02 gefixte Bug).
// LEITPLANKE: Tests niemals löschen/abschwächen, um "grün" zu werden.

import { beforeEach, describe, expect, it } from 'vitest'
// Side-Effect-Import: registriert die echten Kanban-Blöcke (kanban,
// kanban-spalte, card) für die P1.1-Migrationstests.
import '../blocks/kanban/KanbanBlock'
import { Editor } from './Editor'
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
        // onFremd deklariert der Typ nicht -> fliegt; onClick bleibt.
        a: { id: 'a', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [], events: { onClick: [schritt], onFremd: [schritt] } },
        // kaputter Schritt (toolNr als Zahl) -> ganze Kette weg, Feld entfällt.
        b: { id: 'b', type: TEST_EVENT_BLOCK, props: {}, parentId: 'root', childIds: [], events: { onClick: [{ ...schritt, toolNr: 7 }] } },
        // Block ohne blockEvents: events-Müll wird nie übernommen.
        c: { id: 'c', type: TEST_BLOCK, props: {}, parentId: 'root', childIds: [], events: { onClick: [schritt] } },
      },
      selectedId: null,
    })
    expect(ed.getNode('a')?.events).toEqual({ onClick: [schritt] })
    expect(ed.getNode('b')?.events).toBeUndefined()
    expect(ed.getNode('c')?.events).toBeUndefined()
  })
})

describe('Migration (P1.1: Vorlagen-Kasten abgeschafft)', () => {
  it('zieht die Musterkarte aus dem Kasten an den ANFANG der ersten Spalte, der Kasten verschwindet', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
        board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['kasten', 's1', 's2'] },
        kasten: { id: 'kasten', type: 'kanban-vorlage', props: {}, parentId: 'board', childIds: ['muster'] },
        muster: { id: 'muster', type: 'card', props: { heading: 'Meine Musterkarte' }, parentId: 'kasten', childIds: [] },
        s1: { id: 's1', type: 'kanban-spalte', props: { heading: 'Offen' }, parentId: 'board', childIds: ['alt'] },
        alt: { id: 'alt', type: 'card', props: { heading: 'Alte Karte' }, parentId: 's1', childIds: [] },
        s2: { id: 's2', type: 'kanban-spalte', props: {}, parentId: 'board', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('kasten')).toBeUndefined()
    expect(ed.getNode('board')?.childIds).toEqual(['s1', 's2'])
    // Musterkarte VOR den Bestandskarten — die ERSTE Karte des Boards
    // bleibt damit die gestaltete Vorlage (templateChild/seRuntime).
    expect(ed.getNode('s1')?.childIds).toEqual(['muster', 'alt'])
    expect(ed.getNode('muster')?.props.heading).toBe('Meine Musterkarte')
    expect(ed.getNode('muster')?.parentId).toBe('s1')
  })

  it('Board ohne Spalte (degeneriert): Kasten samt Karten entfällt, nichts bricht', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
        board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['kasten'] },
        kasten: { id: 'kasten', type: 'kanban-vorlage', props: {}, parentId: 'board', childIds: ['muster'] },
        muster: { id: 'muster', type: 'card', props: {}, parentId: 'kasten', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('kasten')).toBeUndefined()
    expect(ed.getNode('muster')).toBeUndefined()
    expect(ed.getNode('board')?.childIds).toEqual([])
  })
})

describe('Migration (B1: Spaltenwert wird Liste)', () => {
  // V2/K6-Vorarbeit: statusValue (EIN String) -> statusValues (LISTE).
  // Der Nutzer-Auftrag dazu (2026-07-13): gespeicherte Masken UND ihr
  // Export muessen den Umbau AUTOMATISCH ueberleben — Werte duerfen beim
  // Laden nie stillschweigend verlorengehen.
  function spalte(props: Record<string, unknown>) {
    return {
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
        board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['s1'] },
        s1: { id: 's1', type: 'kanban-spalte', props, parentId: 'board', childIds: [] },
      },
      selectedId: null,
    }
  }

  it('alter Einzelwert wird zur Ein-Element-Liste', () => {
    const ed = load(spalte({ heading: 'Zimmer 2', statusValue: '2' }))
    expect(ed.getNode('s1')?.props.statusValues).toEqual(['2'])
    expect(ed.getNode('s1')?.props.statusValue).toBeUndefined() // alter Key ist weg
    expect(ed.getNode('s1')?.props.heading).toBe('Zimmer 2')
  })

  it('leerer alter Wert wird zur leeren Liste (Standard: Titel zaehlt)', () => {
    const ed = load(spalte({ statusValue: '' }))
    expect(ed.getNode('s1')?.props.statusValues).toEqual([])
  })

  it('neue Form bleibt unangetastet (idempotent), auch wenn der alte Key noch daneben steht', () => {
    const ed = load(spalte({ statusValues: ['2', '3'], statusValue: 'veraltet' }))
    expect(ed.getNode('s1')?.props.statusValues).toEqual(['2', '3'])
  })

  it('Muell in der Liste wird verteidigt: nur Strings ueberleben, Nicht-Arrays fallen auf den Default', () => {
    expect(load(spalte({ statusValues: [1, '2', null, 'x'] })).getNode('s1')?.props.statusValues).toEqual(['2', 'x'])
    expect(load(spalte({ statusValues: 'kein-array' })).getNode('s1')?.props.statusValues).toEqual([])
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
