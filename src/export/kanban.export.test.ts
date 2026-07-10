// Export-Test fuer das echte Kanban (Kap. 4K.4).
// Prueft die realen Bloecke ff-kanban + ff-kanban-spalte durch exportMask:
// Registry-Konzepte (erlaubte Kind-Typen, Beispieldaten, feste Zeilen-
// Richtung ohne direction-Prop), Verschachtelung Board > Spalte > Karte,
// Spaltenbreite aus der Flow-Quelle, ASCII-Escaping, Determinismus.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import '../blocks/kanban/KanbanBlock' // Side-Effect: registriert kanban + kanban-spalte + card
import { canContain, getBlockDefinition } from '../core/blocks/blockRegistry'
import { createBlockSubtree } from '../core/blocks/blockFactory'
import { ROOT_ID, type BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { failedChecks, validateMaskHtml } from './validator'

// Ein frisches Board mit seinen Beispieldaten, wie addBlock es einfuegt.
function boardTree(): BlockTree {
  const { nodes, rootId } = createBlockSubtree('kanban')
  nodes[rootId] = { ...nodes[rootId], parentId: ROOT_ID }
  return {
    [ROOT_ID]: { id: ROOT_ID, type: 'root', props: {}, parentId: null, childIds: [rootId] },
    ...nodes,
  }
}

describe('Kanban-Registry (Kap. 4K.4)', () => {
  it('Board nimmt Spalten + Vorlagen-Kasten auf; Spalten nehmen NICHTS auf (S3)', () => {
    expect(canContain('kanban', 'kanban-spalte')).toBe(true)
    expect(canContain('kanban', 'kanban-vorlage')).toBe(true)
    expect(canContain('kanban', 'card')).toBe(false)
    // Spalten werden aus Daten befuellt — von Hand kommt nichts mehr hinein.
    expect(canContain('kanban-spalte', 'card')).toBe(false)
    expect(canContain('kanban-spalte', 'button')).toBe(false)
    expect(canContain('kanban-spalte', 'kanban-spalte')).toBe(false)
    // Der Vorlagen-Kasten haelt die Musterkarte.
    expect(canContain('kanban-vorlage', 'card')).toBe(true)
    expect(canContain('kanban-vorlage', 'button')).toBe(false)
  })

  it('Gegenrichtung (S3): Karte/Spalte/Vorlage lassen sich NICHT aus dem Kanban ziehen', () => {
    // Karte: nur im Vorlagen-Kasten — nicht auf die Wurzel, nicht in Bereiche.
    expect(canContain('root', 'card')).toBe(false)
    expect(canContain('container', 'card')).toBe(false)
    expect(getBlockDefinition('card')?.allowedParentTypes).toEqual(['kanban-vorlage'])
    // Spalte + Vorlagen-Kasten: nur im Board.
    expect(canContain('root', 'kanban-spalte')).toBe(false)
    expect(canContain('container', 'kanban-spalte')).toBe(false)
    expect(canContain('root', 'kanban-vorlage')).toBe(false)
    // Board selbst bleibt frei platzierbar.
    expect(canContain('root', 'kanban')).toBe(true)
  })

  it('Musterkarte (S3): nicht in der Bibliothek, Vorlagen-Kasten unloeschbar mit "+ Karte"', () => {
    expect(getBlockDefinition('card')?.showInPalette).toBe(false)
    expect(getBlockDefinition('kanban-vorlage')?.showInPalette).toBe(false)
    expect(getBlockDefinition('kanban-vorlage')?.removable).toBe(false)
    expect(getBlockDefinition('kanban-vorlage')?.addChildButton?.childType).toBe('card')
    // Spalten haben keinen "+ Karte"-Knopf mehr (Karten kommen aus Daten).
    expect(getBlockDefinition('kanban-spalte')?.addChildButton).toBeUndefined()
  })

  it('Spalte ist nicht in der Bibliothek, Board schon', () => {
    expect(getBlockDefinition('kanban-spalte')?.showInPalette).toBe(false)
    expect(getBlockDefinition('kanban')?.showInPalette).not.toBe(false)
  })

  it('Beispieldaten (S3): Vorlagen-Kasten mit EINER Musterkarte + 3 LEERE Spalten', () => {
    const tree = boardTree()
    const board = tree[tree[ROOT_ID].childIds[0]]
    const kids = board.childIds.map((id) => tree[id])
    expect(kids.map((k) => k.type)).toEqual(['kanban-vorlage', 'kanban-spalte', 'kanban-spalte', 'kanban-spalte'])
    const [vorlage, ...cols] = kids
    expect(vorlage.childIds.length).toBe(1)
    expect(tree[vorlage.childIds[0]].type).toBe('card')
    expect(cols.map((c) => c.props.heading)).toEqual(['Offen', 'In Arbeit', 'Fertig'])
    expect(cols.map((c) => c.props.variant)).toEqual(['warning', 'info', 'success'])
    // Keine handgepflegten Beispielkarten mehr — Karten entstehen aus Daten.
    expect(cols.map((c) => c.childIds.length)).toEqual([0, 0, 0])
  })
})

describe('Kanban-Export (echte Bloecke)', () => {
  it('serialisiert Board > Vorlage (mit Musterkarte) + Spalten und besteht die SE-Pruefung', () => {
    const { html } = exportMask(boardTree())
    expect(html).toMatch(/<ff-kanban[^>]*>\n\s+<ff-kanban-vorlage/)
    expect(html).toMatch(/<ff-kanban-vorlage[^>]*>\n\s+<ff-card/)
    expect(html).toMatch(/<\/ff-kanban-vorlage>\n\s+<ff-kanban-spalte/)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Board fuellt die Wurzel, Spalten verteilen sich fliessend (S3: mind. 260px, Umbruch statt Scroll)', () => {
    const { html } = exportMask(boardTree())
    // width fill, KEIN direction-Attribut; source="" = Datenquellen-Prop
    // (Kap. 5.1) ohne angehaengte Quelle; statusfield=""/statusvalue="" =
    // Daten-Props aus Kap. 5.3 ohne gesetzte Werte; putrelation = Default-
    // Vorlage des Schreibwegs (Kap. 5.5).
    expect(html).toContain('<ff-kanban source="" statusfield="" putrelation="standard-put" style="align-self:stretch">')
    // Spalten: fliessende Breite aus fillMinWidth (flex-grow + flex-basis),
    // KEIN width-Attribut, KEINE feste Pixelbreite mehr.
    expect(html).toContain('heading="Offen" statusvalue="" style="flex-grow:1;flex-basis:260px"')
    expect(html).not.toContain('width:290px')
    // Das Board bricht um statt zu scrollen: kein overflow-x im Block-CSS
    // (das Runtime-Buendel traegt das CSS der Web Components).
    expect(html).not.toContain('overflow-x')
  })

  it('Spalten-Feld + Datenwerte der Spalten reisen als Attribute (Kap. 5.3)', () => {
    const tree = boardTree()
    const board = tree[tree[ROOT_ID].childIds[0]]
    board.props.source = 'terminplaner'
    board.props.statusField = '253_30'
    // childIds[0] ist der Vorlagen-Kasten (S3) — Spalten ab Index 1.
    tree[board.childIds[1]].props.statusValue = '1'
    tree[board.childIds[2]].props.statusValue = '2'
    const { html } = exportMask(tree)
    expect(html).toContain('<ff-kanban source="terminplaner" statusfield="253_30"')
    expect(html).toContain('heading="Offen" statusvalue="1"')
    expect(html).toContain('heading="In Arbeit" statusvalue="2"')
    expect(html).toContain('heading="Fertig" statusvalue=""')
  })

  it('Spalten + Musterkarte tragen ihre Werte als Attribute (ASCII-escaped)', () => {
    const { html } = exportMask(boardTree())
    expect(html).toContain('<ff-kanban-spalte variant="warning" heading="Offen"')
    // Die eine Musterkarte im Vorlagen-Kasten (Karten-Defaults).
    expect(html).toContain('heading="R&#xFC;ckruf Fr. Wagner"')
    expect(html).toContain('chiptext="Heute"')
  })

  it('ist deterministisch bei festen Ids: gleicher Baum -> identisches HTML', () => {
    const tree = boardTree()
    expect(exportMask(tree).html).toBe(exportMask(tree).html)
  })
})
