import { beforeEach, describe, expect, it } from 'vitest'

import { PopupBlock } from '../blocks/popup/PopupBlock'

import { AnsichtBlock } from '../blocks/ansicht/AnsichtBlock'
import { NaviBlock } from '../blocks/navi/NaviBlock'
import { NaviEintragBlock } from '../blocks/navi/NaviEintragBlock'
import { ROOT_ID } from '../core/blocks/BlockData'
import { Editor } from './Editor'
import { registerTestBlocks, TEST_BLOCK } from '../test/testBlocks'

registerTestBlocks()

beforeEach(() => { localStorage.clear() })

const STANDARD = 'Standard'

function editorMitBaustein(): { ed: Editor; id: string } {
  const ed = new Editor()
  const node = ed.addBlock(TEST_BLOCK, ROOT_ID)
  return { ed, id: node!.id }
}

describe('Ein Fehler mitten im Schreiben laesst den Verlauf nicht sterben (A7.2)', () => {
  it('REPRO: das blanke begin/end der bisherigen Aufrufer macht den Verlauf stumm', () => {
    const { ed, id } = editorMitBaustein()
    try {
      ed.beginTransaction()
      ed.updateProperty(id, 'text', 'A')
      throw new Error('Vorlage weg')
    } catch { /* der Aufrufer sah davon nichts */ }

    ed.updateProperty(id, 'text', 'B')
    ed.undo()
    expect(ed.getNode(id)?.props.text).toBe(STANDARD)

    ed.updateProperty(id, 'text', 'C')
    ed.undo()
    expect(ed.getNode(id)).toBeUndefined()
  })

  it('transaktion() schliesst auch bei einem Wurf ab', () => {
    const { ed, id } = editorMitBaustein()
    expect(() => ed.transaktion(() => {
      ed.updateProperty(id, 'text', 'A')
      throw new Error('Vorlage weg')
    })).toThrow('Vorlage weg')

    ed.updateProperty(id, 'text', 'B')
    expect(ed.canUndo).toBe(true)
    ed.undo()
    expect(ed.getNode(id)?.props.text).toBe('A')
  })

  it('transaktion() legt fuer mehrere Schreibvorgaenge EINEN Undo-Punkt an', () => {
    const { ed, id } = editorMitBaustein()
    ed.transaktion(() => {
      ed.updateProperty(id, 'text', 'A')
      ed.updateProperty(id, 'text', 'B')
      ed.updateProperty(id, 'text', 'C')
    })
    ed.undo()
    expect(ed.getNode(id)?.props.text).toBe(STANDARD)
  })

  it('transaktion() gibt zurueck, was ihr Inhalt liefert (addSeite braucht das)', () => {
    const ed = new Editor()
    const seite = ed.addSeite(PopupBlock.blockType)
    expect(seite).not.toBeNull()
    expect(ed.pages).toHaveLength(2)

    ed.undo()
    expect(ed.pages).toHaveLength(1)
  })
})

describe('Gesten-Token: oeffnet einmal, schliesst einmal (A7.2)', () => {
  it('die ganze Geste ist EIN Undo-Schritt, und Nachzuegler oeffnen nichts mehr', () => {
    const { ed, id } = editorMitBaustein()
    const klammer = ed.oeffneGeste()
    klammer.oeffne()
    klammer.oeffne()
    ed.updateProperty(id, 'text', 'A')
    ed.updateProperty(id, 'text', 'B')
    klammer.schliesse()
    klammer.schliesse()

    klammer.oeffne()

    ed.undo()
    expect(ed.getNode(id)?.props.text).toBe(STANDARD)

    ed.updateProperty(id, 'text', 'C')
    expect(ed.canUndo).toBe(true)
    ed.undo()
    expect(ed.getNode(id)?.props.text).toBe(STANDARD)
  })

  it('Seite umbenennen zieht den Navi-Klarnamen mit — in EINEM Undo-Schritt', () => {
    const ed = new Editor()
    const seite = ed.addSeite(AnsichtBlock.blockType)!
    const navi = ed.addBlock(NaviBlock.blockType, ROOT_ID)!
    const eintrag = ed.addBlock(NaviEintragBlock.blockType, navi.id)!
    ed.transaktion(() => {
      ed.updateProperty(eintrag.id, 'seite', seite.id)
      ed.updateProperty(eintrag.id, 'seitename', String(ed.getNode(seite.id)?.props.name))
    })
    const vorher = ed.getNode(eintrag.id)?.props.seitename

    ed.updateProperty(seite.id, 'name', 'Terminkalender')
    expect(ed.getNode(eintrag.id)?.props.seitename).toBe('Terminkalender')

    ed.undo()
    expect(ed.getNode(seite.id)?.props.name).not.toBe('Terminkalender')
    expect(ed.getNode(eintrag.id)?.props.seitename).toBe(vorher)
  })

  it('Seitennamen bleiben eindeutig und nie leer', () => {
    const ed = new Editor()
    const a = ed.addSeite(AnsichtBlock.blockType)!
    const b = ed.addSeite(AnsichtBlock.blockType)!
    const nameA = String(ed.getNode(a.id)?.props.name)

    ed.updateProperty(b.id, 'name', nameA)
    expect(ed.getNode(b.id)?.props.name).not.toBe(nameA)

    ed.updateProperty(b.id, 'name', nameA.toLocaleLowerCase('de-DE'))
    expect(String(ed.getNode(b.id)?.props.name).toLocaleLowerCase('de-DE'))
      .not.toBe(nameA.toLocaleLowerCase('de-DE'))

    ed.updateProperty(a.id, 'name', '   ')
    expect(ed.getNode(a.id)?.props.name).toBe(nameA)
  })

  it('Anfassen ohne Aendern erzeugt keinen leeren Rueckgaengig-Schritt', () => {
    const { ed, id } = editorMitBaustein()
    ed.updateProperty(id, 'text', 'A')
    const schritteVorher = ed.canUndo

    // Genau das tut ein Zahlenfeld beim Verlassen: Klammer auf, denselben
    // Wert schreiben, Klammer zu.
    const klammer = ed.oeffneGeste()
    klammer.oeffne()
    ed.updateProperty(id, 'text', 'A')
    klammer.schliesse()

    expect(schritteVorher).toBe(true)
    ed.undo()
    // Ein leerer Schritt haette hier noch 'A' stehen lassen.
    expect(ed.getNode(id)?.props.text).toBe(STANDARD)
  })

  it('eine nie geoeffnete Klammer schliesst keine fremde', () => {
    const { ed, id } = editorMitBaustein()
    const laufende = ed.oeffneGeste()
    laufende.oeffne()
    ed.updateProperty(id, 'text', 'A')

    const nurAngetippt = ed.oeffneGeste()
    nurAngetippt.schliesse()

    ed.updateProperty(id, 'text', 'B')
    laufende.schliesse()

    ed.undo()
    expect(ed.getNode(id)?.props.text).toBe(STANDARD)
  })
})
