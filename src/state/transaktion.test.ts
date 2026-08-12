// Transaktionen — Tests des Verlaufs, wenn etwas schiefgeht (A7.2, 2026-08-11).
//
// Der Verlauf hat einen Tiefenzaehler (`_txDepth` in history.ts). Steht er ueber
// null, zeichnet `record()` NICHTS auf — das ist gewollt, solange eine Geste
// laeuft. Bleibt der Abschluss aber aus, schweigt der Verlauf fuer den REST der
// Sitzung: es entsteht kein Undo-Punkt mehr, und Strg+Z springt immer wieder auf
// denselben alten Stand. Der Bediener sieht nichts, was ihm das erklaert.
//
// Eigene Datei, weil es zum Thema „Verlauf/Transaktion" bisher keine gab und
// persistence.test.ts (429 Zeilen) am 500-Zeilen-Deckel steht (check:regeln).
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { beforeEach, describe, expect, it } from 'vitest'
// Side-Effect-Import: die echte Popup-Seite — ohne einen Baustein mit
// pageBlock-Kennzeichen legt addPopupPage gar keine Seite an.
import '../blocks/popup/PopupBlock'
import { ROOT_ID } from '../core/blocks/BlockData'
import { Editor } from './Editor'
import { registerTestBlocks, TEST_BLOCK } from '../test/testBlocks'

registerTestBlocks()

beforeEach(() => { localStorage.clear() })

// Text des einen Testbausteins — sein Standardwert steht in testBlocks.
const STANDARD = 'Standard'

function editorMitBaustein(): { ed: Editor; id: string } {
  const ed = new Editor()
  const node = ed.addBlock(TEST_BLOCK, ROOT_ID)
  return { ed, id: node!.id }
}

describe('Ein Fehler mitten im Schreiben laesst den Verlauf nicht sterben (A7.2)', () => {
  it('REPRO: das blanke begin/end der bisherigen Aufrufer macht den Verlauf stumm', () => {
    // Genau das Muster, das PropControl und addPopupPage bis A7.2 schrieben:
    // begin, mehrere Schreibvorgaenge, end — ohne finally. Wirft einer davon,
    // wird `end` nie erreicht.
    const { ed, id } = editorMitBaustein()
    try {
      ed.beginTransaction()
      ed.updateProperty(id, 'text', 'A')
      throw new Error('Vorlage weg')
    } catch { /* der Aufrufer sah davon nichts */ }

    // Ab hier ist der Verlauf tot: die naechste Aenderung legt keinen
    // Undo-Punkt an, und Strg+Z stellt sie nicht zurueck.
    ed.updateProperty(id, 'text', 'B')
    ed.undo()
    expect(ed.getNode(id)?.props.text).toBe(STANDARD) // 'A' und 'B' sind weg

    // Und es bleibt so, den Rest der Sitzung: das naechste Strg+Z springt ueber
    // die neue Aenderung hinweg bis vor das Anlegen — der Baustein verschwindet.
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

    // Der Wurf bleibt sichtbar (oben), der Verlauf lebt: die naechste Aenderung
    // ergibt wieder einen normalen Undo-Punkt.
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

  it('transaktion() gibt zurueck, was ihr Inhalt liefert (addPopupPage braucht das)', () => {
    const ed = new Editor()
    const seite = ed.addPopupPage()
    expect(seite).not.toBeNull()
    expect(ed.pages).toHaveLength(2)
    // Anlegen UND Benennen sind zusammen EIN Schritt.
    ed.undo()
    expect(ed.pages).toHaveLength(1)
  })
})

describe('Gesten-Token: oeffnet einmal, schliesst einmal (A7.2)', () => {
  it('die ganze Geste ist EIN Undo-Schritt, und Nachzuegler oeffnen nichts mehr', () => {
    const { ed, id } = editorMitBaustein()
    const klammer = ed.oeffneGeste()
    klammer.oeffne()
    klammer.oeffne() // zweiter Zug derselben Geste: keine zweite Klammer
    ed.updateProperty(id, 'text', 'A')
    ed.updateProperty(id, 'text', 'B')
    klammer.schliesse()
    klammer.schliesse() // pointercancel nach pointerup: folgenlos
    // Ein Nachzuegler-Ereignis darf keine neue Klammer aufmachen — die liefe
    // bis zum Sitzungsende offen und der Verlauf zeichnete nichts mehr auf.
    klammer.oeffne()

    ed.undo()
    expect(ed.getNode(id)?.props.text).toBe(STANDARD)
    // Beweis, dass die Klammer wirklich zu ist: die naechste Aenderung zaehlt.
    ed.updateProperty(id, 'text', 'C')
    expect(ed.canUndo).toBe(true)
    ed.undo()
    expect(ed.getNode(id)?.props.text).toBe(STANDARD)
  })

  it('eine nie geoeffnete Klammer schliesst keine fremde', () => {
    // Der Fall aus dem Editor: ein Anfasser wird nur ANGETIPPT, waehrend eine
    // andere Geste laeuft. Ein `end()` auf Verdacht beendete die fremde Geste
    // mitten drin — sie zerfiele in mehrere Undo-Schritte.
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
