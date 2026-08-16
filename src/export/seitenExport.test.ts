// Export-Tests: SEITEN — Popup, Ansicht, Navi
// Was von den Seiten einer Maske im Export ankommt: das geschlossene Popup im
// selben HTML, die VERBORGENE Ansicht, und die Navi am Maskenrand samt ihren
// Eintraegen. Alles davon scheitert STILL, wenn es fehlt — die Maske laedt
// sauber und zeigt die falsche Flaeche.
//
// Eigene Datei seit 2026-08-15 (500-Zeilen-Deckel, wie tabelleExport.test.ts
// und kanbanExport.test.ts vorher); der Schnitt liegt am Gegenstand.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from "vitest"
// Side-Effect-Importe: die echten Seiten-Bausteine der Faelle.
import "../blocks/popup/PopupBlock"
import "../blocks/ansicht/AnsichtBlock"
import "../blocks/navi/NaviBlock"
import "../blocks/navi/NaviEintragBlock"
import type { BlockTree } from "../core/blocks/BlockData"
import { RAND } from "../core/blocks/maskenRand"
import { exportMask } from "./exportMask"
import { registerTestBlocks, TEST_BLOCK } from "../test/testBlocks"

registerTestBlocks()

describe("exportMask: Seiten", () => {
  it('exportiert eine Popup-Seite GESCHLOSSEN im selben HTML, Inhalt reist mit (P-A)', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t1', 'p1'] },
      t1: { id: 't1', type: TEST_BLOCK, props: { text: 'Hauptseite' }, parentId: 'root', childIds: [] },
      p1: {
        id: 'p1', type: 'popup',
        props: { name: 'Neue Behandlung', breite: 400, hoehe: 300 },
        parentId: 'root', childIds: ['t2'],
      },
      t2: { id: 't2', type: TEST_BLOCK, props: { text: 'Im Popup' }, parentId: 'p1', childIds: [] },
    }
    const { html } = exportMask(tree)
    const tag = /<ff-popup[^>]*/.exec(html)?.[0] ?? ''
    expect(tag).toContain('name="Neue Behandlung"')
    expect(tag).toContain('breite="400"')
    expect(tag).toContain('hoehe="300"')
    // Geschlossen bis eine Kette öffnet: NIE mit offen-Attribut exportieren.
    expect(tag).not.toContain('offen')
    expect(html).toMatch(/<ff-popup[^>]*>\n\s+<ff-t-block[^>]*text="Im Popup"/)
  })

  it('exportiert eine Ansicht VERBORGEN, ihre Kinder liegen im Wurzel-Raster (N1)', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t1', 'a1'] },
      t1: { id: 't1', type: TEST_BLOCK, props: { text: 'Hauptseite' }, parentId: 'root', childIds: [] },
      a1: {
        id: 'a1', type: 'ansicht',
        props: { name: 'Terminkalender' },
        parentId: 'root', childIds: ['t2'],
      },
      t2: {
        id: 't2', type: TEST_BLOCK,
        props: { text: 'In der Ansicht', rasterX: 6, rasterY: 4, rasterW: 12, rasterH: 3 },
        parentId: 'a1', childIds: [],
      },
    }
    const { html } = exportMask(tree)
    const tag = /<ff-ansicht[^>]*/.exec(html)?.[0] ?? ''
    expect(tag).toContain('name="Terminkalender"')
    // Die Hauptseite hat den Start: eine Ansicht faehrt immer verborgen aus.
    expect(tag).toContain('hidden')
    // Sie ist selbst KEIN Rasterkind (kein fuellt, kein Zellen-Style) —
    // display:contents, sie gibt die Rasterebene nur durch.
    expect(tag).not.toContain('fuellt')
    expect(tag).not.toContain('style=')
    // ... und genau das muss beim Kind ankommen: Zellen-Style + fuellt,
    // gleichwertig zu einem Kind der Hauptseite. Ohne das laege der Baustein
    // in der Ansicht im Fluss und saesse woanders als im Editor (Regel 1).
    const kind = /<ff-t-block[^>]*text="In der Ansicht"[^>]*/.exec(html)?.[0] ?? ''
    expect(kind).toContain('fuellt')
    expect(kind).toContain('grid-column:7 / span 12')
    expect(kind).toContain('grid-row:5 / span 3')
  })

  it('Navi-Eintrag: Klarname reist, Editor-id bleibt daheim (N2)', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['nav', 'a1'] },
      nav: { id: 'nav', type: 'navi', props: {}, parentId: 'root', childIds: ['e1'] },
      e1: {
        id: 'e1', type: 'navi-eintrag',
        props: { seite: 'a1', seitename: 'Terminkalender', ton: 'himmel' },
        parentId: 'nav', childIds: [],
      },
      a1: { id: 'a1', type: 'ansicht', props: { name: 'Terminkalender' }, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree)
    const tag = /<ff-navi-eintrag[^>]*/.exec(html)?.[0] ?? ''
    // Der Klarname ist der Adressweg der Laufzeit UND die Beschriftung.
    expect(tag).toContain('seitename="Terminkalender"')
    expect(tag).toContain('ton="himmel"')
    // Die Editor-id zeigt auf einen Knoten, den die Maske gar nicht kennt —
    // sie bleibt daheim (PropertyDescription.nurImEditor). Ohne diese Regel
    // stuende in jeder Maske eine Zeichenfolge, die niemand deuten kann.
    expect(tag).not.toContain('seite="a1"')
    expect(html).toMatch(/<ff-navi[^>]*>\n\s+<ff-navi-eintrag/)
  })

  // Der Klarname ist der Adressweg der Laufzeit — er darf deshalb NICHT die
  // Abschrift sein, die beim Auswaehlen der Seite entstand. Bis 2026-08-15
  // reiste genau die mit: wer seine Ansicht danach umbenannte, hatte in der
  // Maske einen Eintrag, der einen Namen suchte, den es nicht mehr gab, und
  // landete stumm auf der Hauptseite (navi/seRuntime).
  it('Navi-Eintrag: der Klarname entsteht aus der id, nicht aus der Abschrift', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['nav', 'a1'] },
      nav: { id: 'nav', type: 'navi', props: {}, parentId: 'root', childIds: ['e1', 'e2'] },
      e1: {
        id: 'e1', type: 'navi-eintrag',
        props: { seite: 'a1', seitename: 'Alter Name', ton: 'himmel' },
        parentId: 'nav', childIds: [],
      },
      // Zeigt auf die HAUPTSEITE. Sie ist kein Seiten-BAUSTEIN und stand
      // darum nicht in der Popup-Namensliste — ohne die gemeinsame
      // Seitenliste verloere dieser Eintrag im Export seine Beschriftung.
      e2: {
        id: 'e2', type: 'navi-eintrag',
        props: { seite: 'root', seitename: 'irgendwas', ton: 'koralle' },
        parentId: 'nav', childIds: [],
      },
      a1: { id: 'a1', type: 'ansicht', props: { name: 'Terminkalender' }, parentId: 'root', childIds: [] },
    }
    const tags = exportMask(tree).html.match(/<ff-navi-eintrag[^>]*/g) ?? []
    expect(tags[0]).toContain('seitename="Terminkalender"')
    expect(tags[0]).not.toContain('Alter Name')
    expect(tags[1]).toContain('seitename="Hauptseite"')
  })

  it('Navi liegt am Maskenrand, nicht in einer Zelle — und die Flaeche haelt ihre Breite frei (N2.1)', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['nav', 't1'] },
      nav: {
        id: 'nav', type: 'navi',
        // Alte Zellen-Angaben liegen weiter in den Props — sie duerfen im
        // Export nichts mehr bewirken (Befund N2.1-3: nichts war buendig).
        props: { rasterX: 0, rasterY: 38, rasterW: 5, rasterH: 24 },
        parentId: 'root', childIds: [],
      },
      t1: { id: 't1', type: TEST_BLOCK, props: { text: 'Inhalt' }, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree)
    const tag = /<ff-navi[^>]*/.exec(html)?.[0] ?? ''
    // Buendig links, oben UND unten an der Maskenkante; der Bezug ist das
    // Fenster selbst (kein positionierter Vorfahr) — dieselbe Bauart wie beim
    // Popup. Deshalb rollt sie auch nicht mit dem Inhalt weg.
    expect(tag).toContain('position:absolute')
    expect(tag).toContain('left:0')
    expect(tag).toContain('top:0')
    expect(tag).toContain('bottom:0')
    // Die BREITE steht bewusst NICHT im style-Attribut: sie haengt am
    // Auf-/Zuklappen und gehoert darum dem Baustein. Ein style-Attribut wuerde
    // dessen Regel schlagen — im Editor blieb der Auswahlrahmen dann auf der
    // schmalen Spur stehen und lief mitten durch die offene Leiste.
    expect(tag).not.toContain('width')
    // KEINE Rasterzelle mehr — sonst zaehlten ihre 24 Zeilen weiter zur
    // Maskenhoehe (Befund N2.1-7: SoftEngine rollte, der Editor nicht).
    expect(tag).not.toContain('grid-column')
    expect(tag).not.toContain('grid-row')
    // Und die Flaeche haelt die schmale Breite frei, damit die Leiste keinen
    // Baustein verdeckt (Vorbild empfang: .vnav-spacer).
    expect(html).toContain(`padding: 16px 16px 16px ${16 + RAND.breite}px;`)
    // Ein normales Wurzel-Kind bleibt unberuehrt in seiner Zelle.
    const inhalt = /<ff-t-block[^>]*text="Inhalt"[^>]*/.exec(html)?.[0] ?? ''
    expect(inhalt).toContain('grid-column:1 / span 24')
  })
})
