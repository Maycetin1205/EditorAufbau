import { beforeEach, describe, expect, it } from 'vitest'

import { PopupBlock } from '../blocks/popup/PopupBlock'
import { ROOT_ID, type BlockNode } from '../core/blocks/BlockData'
import { type ActionStep, type RelationStep } from '../core/data/aktionen'
import { AUSWAHL_FOLGE_PROP } from '../core/data/auswahlFolge'
import { Editor } from './Editor'
import {
  registerTestBlocks,
  TEST_BLOCK,
  TEST_BOX,
  TEST_DATA_BOX,
  TEST_EVENT_BLOCK,
} from '../test/testBlocks'

registerTestBlocks()

beforeEach(() => { localStorage.clear() })

function kette(blockId: string): ActionStep[] {
  return [{
    id: 'schritt-1',
    type: 'RELATION',
    resultKey: '',
    relationId: 'rel-1',
    params: [{ source: 'block_value', value: 'text', blockId }],
    extraParams: [],
  }]
}

function ersterSchritt(node: BlockNode | undefined): RelationStep {
  return node?.events?.onClick[0] as RelationStep
}

function kopieVon(ed: Editor, original: BlockNode): BlockNode {
  const parent = ed.getNode(original.parentId ?? ROOT_ID)
  const treffer = (parent?.childIds ?? [])
    .map((id) => ed.getNode(id))
    .filter((n) => n !== undefined && n.type === original.type && n.id !== original.id)
  expect(treffer, 'keine Kopie im Elternteil gefunden').toHaveLength(1)
  return treffer[0]!
}

describe('duplicateBlock schreibt die Verweise der Kopie um (A5)', () => {
  it('der kopierte Knopf liest das kopierte Feld, nicht das Original', () => {
    const ed = new Editor()
    const box = ed.addBlock(TEST_BOX, ROOT_ID)!
    const feld = ed.addBlock(TEST_BLOCK, box.id)!
    const knopf = ed.addBlock(TEST_EVENT_BLOCK, box.id)!
    ed.updateBlockEvents(knopf.id, { onClick: kette(feld.id) })

    ed.duplicateBlock(box.id)

    const boxKopie = kopieVon(ed, box)
    const kinder = boxKopie.childIds.map((id) => ed.getNode(id)!)
    const feldKopie = kinder.find((n) => n.type === TEST_BLOCK)!
    const knopfKopie = kinder.find((n) => n.type === TEST_EVENT_BLOCK)

    expect(ersterSchritt(knopfKopie).params[0].blockId).toBe(feldKopie.id)
    expect(feldKopie.id).not.toBe(feld.id)

    expect(ersterSchritt(ed.getNode(knopf.id)).params[0].blockId).toBe(feld.id)
  })

  it('die kopierte Folgetabelle folgt dem kopierten Geber', () => {
    const ed = new Editor()
    const box = ed.addBlock(TEST_BOX, ROOT_ID)!
    const geber = ed.addBlock(TEST_DATA_BOX, box.id)!
    const folger = ed.addBlock(TEST_BLOCK, box.id)!
    ed.updateProperty(folger.id, AUSWAHL_FOLGE_PROP, [
      { geberId: geber.id, keyPairs: [{ fromField: '2_8', toField: '3_8' }] },
    ])

    ed.duplicateBlock(box.id)

    const boxKopie = kopieVon(ed, box)
    const kinder = boxKopie.childIds.map((id) => ed.getNode(id)!)
    const geberKopie = kinder.find((n) => n.type === TEST_DATA_BOX)!
    const folgerKopie = kinder.find((n) => n.type === TEST_BLOCK)
    expect(folgerKopie?.props[AUSWAHL_FOLGE_PROP]).toEqual([
      { geberId: geberKopie.id, keyPairs: [{ fromField: '2_8', toField: '3_8' }] },
    ])
  })

  it('ein Verweis NACH AUSSEN bleibt extern', () => {
    const ed = new Editor()
    const aussen = ed.addBlock(TEST_BLOCK, ROOT_ID)!
    const popup = ed.addSeite(PopupBlock.blockType)!
    ed.setActivePage(ROOT_ID)
    const box = ed.addBlock(TEST_BOX, ROOT_ID)!
    const knopf = ed.addBlock(TEST_EVENT_BLOCK, box.id)!
    ed.updateBlockEvents(knopf.id, {
      onClick: [
        ...kette(aussen.id),
        { id: 'schritt-2', type: 'POPUP_OPEN', resultKey: '', popupId: popup.id },
      ],
    })

    ed.duplicateBlock(box.id)

    const knopfKopie = ed.getNode(kopieVon(ed, box).childIds[0])

    expect(ersterSchritt(knopfKopie).params[0].blockId).toBe(aussen.id)
    const popupSchritt = knopfKopie?.events?.onClick[1]
    expect(popupSchritt).toMatchObject({ type: 'POPUP_OPEN', popupId: popup.id })
  })

  it('eine SEITE (Popup) kann noch nicht dupliziert werden', () => {
    const ed = new Editor()
    const popup = ed.addSeite(PopupBlock.blockType)!
    const vorher = ed.blockCount

    expect(ed.duplicateBlock(popup.id)).toBeNull()

    expect(ed.blockCount).toBe(vorher)
    expect(ed.pages).toHaveLength(2)

    ed.undo()
    expect(ed.pages).toHaveLength(1)
  })

  it('ein direktes Rasterkind der Hauptfläche liegt nach der Kopie frei', () => {
    const ed = new Editor()
    const erster = ed.addBlock(TEST_BLOCK, ROOT_ID)!
    const kopie = ed.duplicateBlock(erster.id)!

    expect(Number(kopie.props.rasterY))
      .toBeGreaterThanOrEqual(Number(erster.props.rasterY) + Number(erster.props.rasterH))
    expect(kopie.props.rasterX).toBe(erster.props.rasterX)
    expect(kopie.props.rasterW).toBe(erster.props.rasterW)
    expect(kopie.props.rasterH).toBe(erster.props.rasterH)
  })

  it('in einem Container bleibt die Kopie im Fluss hinter dem Original', () => {
    const ed = new Editor()
    const box = ed.addBlock(TEST_BOX, ROOT_ID)!
    const erstes = ed.addBlock(TEST_BLOCK, box.id)!
    const zweites = ed.addBlock(TEST_BLOCK, box.id)!
    const kopie = ed.duplicateBlock(erstes.id)!
    expect(ed.getNode(box.id)?.childIds).toEqual([erstes.id, kopie.id, zweites.id])
    expect(kopie.props.rasterY).toBeUndefined()
  })

  it('Undo und Redo der Kopie sind je EIN Schritt', () => {
    const ed = new Editor()
    const box = ed.addBlock(TEST_BOX, ROOT_ID)!
    ed.addBlock(TEST_BLOCK, box.id)
    ed.addBlock(TEST_EVENT_BLOCK, box.id)
    const vorher = ed.blockCount

    ed.duplicateBlock(box.id)
    expect(ed.blockCount).toBe(vorher + 3)

    ed.undo()
    expect(ed.blockCount).toBe(vorher)
    ed.redo()
    expect(ed.blockCount).toBe(vorher + 3)
  })
})
