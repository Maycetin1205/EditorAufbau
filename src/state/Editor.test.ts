// Store-Tests (Kap. 2.5 Sicherheitsnetz)
// Prüfen die Kern-Operationen des Baums: einfügen, verschieben (inkl.
// Zyklen-Schutz + Index-Korrektur), löschen, duplizieren, Eigenschaften,
// Undo/Redo und die Transaktions-Klammer (eine Geste = EIN Undo).
// LEITPLANKE: Diese Tests niemals löschen oder abschwächen, um "grün" zu
// werden — Fehlschlag dem Nutzer melden, er entscheidet.

import { beforeEach, describe, expect, it } from 'vitest'
import type { ActionStep } from '../core/data/aktionen'
import { Editor } from './Editor'
import {
  registerTestBlocks,
  TEST_BLOCK,
  TEST_BOARD,
  TEST_BOX,
  TEST_DATA_BOX,
  TEST_EVENT_BLOCK,
  TEST_STRICT_BOX,
} from '../test/testBlocks'

registerTestBlocks()

let ed: Editor

beforeEach(() => {
  localStorage.clear()
  ed = new Editor()
})

// addBlock liefert null, wenn der Zielcontainer den Typ nicht aufnimmt
// (allowedChildTypes). Für die Fälle hier MUSS das Einfügen gelingen —
// der Helfer macht das zur Zusicherung.
function add(type: string, parentId?: string, index?: number) {
  const node = ed.addBlock(type, parentId, index)
  expect(node).not.toBeNull()
  return node!
}

describe('addBlock', () => {
  it('hängt neue Blöcke ans Ende der Wurzel und wählt sie aus', () => {
    const a = add(TEST_BLOCK)
    const b = add(TEST_BLOCK)
    expect(ed.getNode(ed.rootId)?.childIds).toEqual([a.id, b.id])
    expect(ed.selectedId).toBe(b.id)
    expect(a.props.text).toBe('Standard') // Defaults aus der Registry
  })

  it('fügt an einer bestimmten Position und in Container ein', () => {
    const a = add(TEST_BLOCK)
    const b = add(TEST_BLOCK)
    const mid = add(TEST_BLOCK, ed.rootId, 1)
    expect(ed.getNode(ed.rootId)?.childIds).toEqual([a.id, mid.id, b.id])

    const box = add(TEST_BOX)
    const child = add(TEST_BLOCK, box.id)
    expect(ed.getNode(box.id)?.childIds).toEqual([child.id])
    expect(ed.getNode(child.id)?.parentId).toBe(box.id)
  })
})

describe('allowedChildTypes (Kap. 4K.4)', () => {
  it('addBlock verweigert Typen, die der Container nicht aufnimmt', () => {
    const strict = add(TEST_STRICT_BOX)
    expect(ed.addBlock(TEST_BOX, strict.id)).toBeNull()
    expect(ed.getNode(strict.id)?.childIds).toEqual([])
    expect(ed.canUndo).toBe(true) // nur das Einfügen der Box selbst
    ed.undo()
    expect(ed.canUndo).toBe(false) // verweigertes Einfügen = KEIN History-Eintrag
  })

  it('addBlock nimmt erlaubte Typen an', () => {
    const strict = add(TEST_STRICT_BOX)
    const child = add(TEST_BLOCK, strict.id)
    expect(ed.getNode(strict.id)?.childIds).toEqual([child.id])
  })

  it('moveNode verweigert verbotene Ziele und lässt erlaubte zu', () => {
    const strict = add(TEST_STRICT_BOX)
    const box = add(TEST_BOX)
    const block = add(TEST_BLOCK)
    ed.moveNode(box.id, strict.id, 0)
    expect(ed.getNode(box.id)?.parentId).toBe(ed.rootId) // verweigert
    ed.moveNode(block.id, strict.id, 0)
    expect(ed.getNode(block.id)?.parentId).toBe(strict.id) // erlaubt
  })
})

describe('defaultChildren (Beispieldaten, Kap. 4K.4)', () => {
  it('addBlock materialisiert den Beispieldaten-Teilbaum', () => {
    const board = add(TEST_BOARD)
    const cols = ed.childNodesOf(board.id)
    expect(cols.map((c) => c.type)).toEqual([TEST_STRICT_BOX, TEST_STRICT_BOX])
    const cards = ed.childNodesOf(cols[0].id)
    expect(cards.map((c) => c.props.text)).toEqual(['Karte A', 'Karte B'])
    expect(cards[0].props.width).toBe('auto') // Defaults unter den Spec-Props
    expect(ed.childNodesOf(cols[1].id)).toEqual([])
  })

  it('ein Undo entfernt den kompletten Teilbaum wieder', () => {
    const board = add(TEST_BOARD)
    ed.undo()
    expect(ed.getNode(board.id)).toBeUndefined()
    expect(ed.blockCount).toBe(0)
  })
})

describe('moveNode', () => {
  it('sortiert innerhalb desselben Containers mit Index-Korrektur um', () => {
    const a = add(TEST_BLOCK)
    const b = add(TEST_BLOCK)
    const c = add(TEST_BLOCK)
    // a (Index 0) hinter c ziehen: Roh-Index 3, nach Entnahme von a → Ende
    ed.moveNode(a.id, ed.rootId, 3)
    expect(ed.getNode(ed.rootId)?.childIds).toEqual([b.id, c.id, a.id])
  })

  it('hängt in einen anderen Container um (rein und wieder raus)', () => {
    const box = add(TEST_BOX)
    const a = add(TEST_BLOCK)
    ed.moveNode(a.id, box.id, 0)
    expect(ed.getNode(a.id)?.parentId).toBe(box.id)
    ed.moveNode(a.id, ed.rootId, 0)
    expect(ed.getNode(a.id)?.parentId).toBe(ed.rootId)
    expect(ed.getNode(box.id)?.childIds).toEqual([])
  })

  it('verweigert Zyklen: ein Bereich fällt nie in den eigenen Teilbaum', () => {
    const outer = add(TEST_BOX)
    const inner = add(TEST_BOX, outer.id)
    ed.moveNode(outer.id, inner.id, 0)
    expect(ed.getNode(outer.id)?.parentId).toBe(ed.rootId) // unverändert
    expect(ed.getNode(inner.id)?.parentId).toBe(outer.id)
  })
})

describe('removeBlock / duplicateBlock', () => {
  it('löscht einen Container mitsamt Teilbaum', () => {
    const box = add(TEST_BOX)
    const child = add(TEST_BLOCK, box.id)
    ed.removeBlock(box.id)
    expect(ed.getNode(box.id)).toBeUndefined()
    expect(ed.getNode(child.id)).toBeUndefined()
    expect(ed.getNode(ed.rootId)?.childIds).toEqual([])
  })

  it('dupliziert einen Teilbaum mit frischen Ids', () => {
    const box = add(TEST_BOX)
    const child = add(TEST_BLOCK, box.id)
    ed.updateProperty(child.id, 'text', 'Eigenwert')
    const copy = ed.duplicateBlock(box.id)
    expect(copy).not.toBeNull()
    expect(copy!.id).not.toBe(box.id)
    const copyChildIds = ed.getNode(copy!.id)!.childIds
    expect(copyChildIds).toHaveLength(1)
    expect(copyChildIds[0]).not.toBe(child.id)
    expect(ed.getNode(copyChildIds[0])?.props.text).toBe('Eigenwert')
  })
})

describe('Undo/Redo', () => {
  it('macht Einfügen und Verschieben rückgängig und wieder gültig', () => {
    const a = add(TEST_BLOCK)
    const box = add(TEST_BOX)
    ed.moveNode(a.id, box.id, 0)
    ed.undo()
    expect(ed.getNode(a.id)?.parentId).toBe(ed.rootId)
    ed.redo()
    expect(ed.getNode(a.id)?.parentId).toBe(box.id)
  })

  it('Transaktion: viele Änderungen einer Geste = EIN Undo-Schritt', () => {
    const a = add(TEST_BLOCK)
    ed.beginTransaction()
    for (let w = 100; w <= 300; w += 10) ed.updateProperty(a.id, 'width', w)
    ed.endTransaction()
    expect(ed.getNode(a.id)?.props.width).toBe(300)
    ed.undo() // genau EIN Schritt zurück — vor die ganze Geste
    expect(ed.getNode(a.id)?.props.width).toBe('auto')
  })
})

describe('updateBlockEvents (Aktionsketten, Z2)', () => {
  const schritt = (over: Partial<ActionStep> = {}): ActionStep => ({
    id: 's1', type: 'START_TOOL', resultKey: '', toolNr: '3003', toolParams: [], ...over,
  })

  it('setzt Ketten am Baustein und räumt leere Ketten/das Feld ab', () => {
    const a = add(TEST_EVENT_BLOCK)
    ed.updateBlockEvents(a.id, { onClick: [schritt()], onPing: [] })
    expect(ed.getNode(a.id)?.events).toEqual({ onClick: [schritt()] })
    ed.updateBlockEvents(a.id, { onClick: [] })
    expect(ed.getNode(a.id)?.events).toBeUndefined()
  })

  it('ein Aufruf = EIN Undo-Schritt (Ctrl+Z gilt auch für Aktionen)', () => {
    const a = add(TEST_EVENT_BLOCK)
    ed.updateBlockEvents(a.id, { onClick: [schritt()] })
    ed.updateBlockEvents(a.id, { onClick: [schritt(), schritt({ id: 's2', toolNr: '7' })] })
    ed.undo()
    expect(ed.getNode(a.id)?.events).toEqual({ onClick: [schritt()] })
    ed.undo()
    expect(ed.getNode(a.id)?.events).toBeUndefined()
    ed.redo()
    expect(ed.getNode(a.id)?.events).toEqual({ onClick: [schritt()] })
  })

  it('duplicateBlock kopiert die Ketten mit', () => {
    const a = add(TEST_EVENT_BLOCK)
    ed.updateBlockEvents(a.id, { onClick: [schritt({ toolParams: ['{PINDEX}'] })] })
    const copy = ed.duplicateBlock(a.id)
    expect(copy?.events).toEqual({ onClick: [schritt({ toolParams: ['{PINDEX}'] })] })
    // Kopie ist unabhängig: Original ändern lässt die Kopie unberührt.
    ed.updateBlockEvents(a.id, { onClick: [] })
    expect(ed.getNode(copy!.id)?.events).toEqual({ onClick: [schritt({ toolParams: ['{PINDEX}'] })] })
  })

  it('ignoriert unbekannte Knoten und die Wurzel', () => {
    ed.updateBlockEvents('gibt-es-nicht', { onClick: [schritt()] })
    ed.updateBlockEvents(ed.rootId, { onClick: [schritt()] })
    expect(ed.canUndo).toBe(false)
    expect(ed.getNode(ed.rootId)?.events).toBeUndefined()
  })
})

describe('dataSourceFor (Kap. 5.2)', () => {
  it('findet die Quelle des nächsten acceptsDataSource-Vorfahren (inkl. selbst)', () => {
    const box = add(TEST_DATA_BOX)
    const child = add(TEST_BLOCK, box.id)
    ed.updateProperty(box.id, 'source', 'terminplaner')
    expect(ed.dataSourceFor(child.id)?.name).toBe('Terminplaner')
    expect(ed.dataSourceFor(box.id)?.name).toBe('Terminplaner')
  })

  it('liefert nichts ohne Quelle, bei unbekannter Vorlagen-id und außerhalb', () => {
    const box = add(TEST_DATA_BOX) // source '' = keine Quelle
    const child = add(TEST_BLOCK, box.id)
    expect(ed.dataSourceFor(child.id)).toBeUndefined()
    ed.updateProperty(box.id, 'source', 'geloeschte-vorlage')
    expect(ed.dataSourceFor(child.id)).toBeUndefined()
    const draussen = add(TEST_BLOCK)
    expect(ed.dataSourceFor(draussen.id)).toBeUndefined()
  })

  it('sucht NICHT über den nächsten acceptsDataSource-Vorfahren hinaus', () => {
    // Äußerer Datenbereich MIT Quelle, innerer OHNE: der innere bestimmt.
    const aussen = add(TEST_DATA_BOX)
    ed.updateProperty(aussen.id, 'source', 'terminplaner')
    const innen = add(TEST_DATA_BOX, aussen.id)
    const child = add(TEST_BLOCK, innen.id)
    expect(ed.dataSourceFor(child.id)).toBeUndefined()
  })
})
