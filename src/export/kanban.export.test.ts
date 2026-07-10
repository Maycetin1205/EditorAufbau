// Export-Test fuer das echte Kanban (Kap. 4K.4).
// Prueft die realen Bloecke ff-kanban + ff-kanban-spalte durch exportMask:
// Registry-Konzepte (erlaubte Kind-Typen, Beispieldaten, feste Zeilen-
// Richtung ohne direction-Prop), Verschachtelung Board > Spalte > Karte,
// Spaltenbreite aus der Flow-Quelle, ASCII-Escaping, Determinismus.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.
// P1.1 (2026-07-10): der Vorlagen-Kasten ist ABGESCHAFFT — die Spec hier
// wurde zur strengeren Gegenrichtung umgebaut (Typ existiert NICHT mehr,
// Export enthaelt NIE ff-kanban-vorlage; Musterkarte = erste Karte des
// Boards, liegt normal in der ersten Spalte).

import { describe, expect, it } from 'vitest'
// Import registriert als Side-Effect kanban + kanban-spalte + card.
import { KanbanBlock } from '../blocks/kanban/KanbanBlock'
import { KanbanSpalteBlock } from '../blocks/kanban/KanbanSpalteBlock'
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

describe('Kanban-Registry (Kap. 4K.4 / P1.1)', () => {
  it('P1.1: den Vorlagen-Kasten gibt es NICHT mehr (Typ abgeschafft)', () => {
    expect(getBlockDefinition('kanban-vorlage')).toBeUndefined()
  })

  it('Board nimmt NUR Spalten auf; Spalten nehmen NUR Karten auf', () => {
    expect(canContain('kanban', 'kanban-spalte')).toBe(true)
    expect(canContain('kanban', 'card')).toBe(false)
    expect(canContain('kanban', 'button')).toBe(false)
    expect(canContain('kanban-spalte', 'card')).toBe(true)
    expect(canContain('kanban-spalte', 'button')).toBe(false)
    expect(canContain('kanban-spalte', 'kanban-spalte')).toBe(false)
  })

  it('Gegenrichtung (S3): Karte/Spalte lassen sich NICHT aus dem Kanban ziehen', () => {
    // Karte: nur in Kanban-Spalten — nicht auf die Wurzel, nicht in Bereiche.
    expect(canContain('root', 'card')).toBe(false)
    expect(canContain('container', 'card')).toBe(false)
    expect(getBlockDefinition('card')?.allowedParentTypes).toEqual(['kanban-spalte'])
    // Spalte: nur im Board.
    expect(canContain('root', 'kanban-spalte')).toBe(false)
    expect(canContain('container', 'kanban-spalte')).toBe(false)
    // Board selbst bleibt frei platzierbar.
    expect(canContain('root', 'kanban')).toBe(true)
  })

  it('Musterkarte (P1.1): erste Karte des Boards = Laufzeit-Vorlage (templateChild), "+ Karte" an der Spalte', () => {
    expect(getBlockDefinition('card')?.showInPalette).toBe(false)
    expect(getBlockDefinition('kanban')?.templateChild).toEqual({ type: 'card', label: 'Muster' })
    expect(getBlockDefinition('kanban-spalte')?.addChildButton?.childType).toBe('card')
    expect(getBlockDefinition('kanban')?.addChildButton?.childType).toBe('kanban-spalte')
  })

  it('Spalte ist nicht in der Bibliothek, Board schon', () => {
    expect(getBlockDefinition('kanban-spalte')?.showInPalette).toBe(false)
    expect(getBlockDefinition('kanban')?.showInPalette).not.toBe(false)
  })

  it('Beispieldaten (P1.1): 3 Spalten, die ERSTE traegt die Musterkarte — kein Vorlagen-Kasten', () => {
    const tree = boardTree()
    expect(Object.values(tree).every((n) => n.type !== 'kanban-vorlage')).toBe(true)
    const board = tree[tree[ROOT_ID].childIds[0]]
    const cols = board.childIds.map((id) => tree[id])
    expect(cols.map((k) => k.type)).toEqual(['kanban-spalte', 'kanban-spalte', 'kanban-spalte'])
    expect(cols.map((c) => c.props.heading)).toEqual(['Offen', 'In Arbeit', 'Fertig'])
    expect(cols.map((c) => c.props.variant)).toEqual(['warning', 'info', 'success'])
    expect(cols.map((c) => c.childIds.length)).toEqual([1, 0, 0])
    expect(tree[cols[0].childIds[0]].type).toBe('card')
  })
})

describe('Kanban-Export (echte Bloecke)', () => {
  it('serialisiert Board > Spalten (Musterkarte in der ersten) und besteht die SE-Pruefung', () => {
    const { html } = exportMask(boardTree())
    expect(html).toMatch(/<ff-kanban[^>]*>\n\s+<ff-kanban-spalte/)
    expect(html).toMatch(/<ff-kanban-spalte[^>]*heading="Offen"[^>]*>\n\s+<ff-card/)
    // P1.1: NIE ein Vorlagen-Kasten im Export — kein Editor-Werkzeug in der Maske.
    expect(html).not.toContain('ff-kanban-vorlage')
    expect(html).not.toContain('slot=')
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('K0/Entscheidung A: Spalten teilen sich die Zeile IMMER gleichmaessig', () => {
    const { html } = exportMask(boardTree())
    // width fill, KEIN direction-Attribut; source="" = Datenquellen-Prop
    // (Kap. 5.1) ohne angehaengte Quelle; statusfield=""/statusvalue="" =
    // Daten-Props aus Kap. 5.3 ohne gesetzte Werte; putrelation = Default-
    // Vorlage des Schreibwegs (Kap. 5.5).
    expect(html).toContain('<ff-kanban source="" statusfield="" putrelation="standard-put" style="align-self:stretch">')
    // Spalten: festgelegtes Breitenverhalten (lockedWidth 'fill') ->
    // flex-basis 0 + min-width 0. KEINE Mindestbreite, KEIN width-Attribut,
    // keine feste Pixelbreite (260px-Mindestbreite ist ABGELEHNT).
    expect(html).toContain('heading="Offen" statusvalue="" style="flex-grow:1;flex-basis:0;min-width:0"')
    expect(html).not.toContain('flex-basis:260px')
    expect(html).not.toContain('width:290px')
    expect(html).not.toContain('width:260px')
    // Entscheidung A: kein horizontaler Scroll — nirgends in der Maske
    // (das Runtime-Buendel traegt das CSS der Web Components).
    expect(html).not.toContain('overflow-x')
  })

  it('P1.3: feste Höhe reist als style (nie als Attribut), Registry-Flag nur am Board', () => {
    expect(getBlockDefinition('kanban')?.resizableHeight).toBe(true)
    expect(getBlockDefinition('kanban-spalte')?.resizableHeight).toBe(false)
    expect(getBlockDefinition('card')?.resizableHeight).toBe(false)
    const tree = boardTree()
    const board = tree[tree[ROOT_ID].childIds[0]]
    board.props.height = 480
    const { html } = exportMask(tree)
    expect(html).toContain('<ff-kanban source="" statusfield="" putrelation="standard-put" style="align-self:stretch;height:480px;flex-shrink:0">')
    expect(html).not.toContain('height="')
  })

  it('K0: Kanban-CSS haelt Entscheidung A ein (kein flex-wrap, Rumpf scrollt senkrecht)', () => {
    // Pruefung direkt an der CSS-Quelle der Bloecke (dasselbe CSS reist im
    // Runtime-Buendel). flex-wrap gibt es im generischen Bereich weiterhin —
    // deshalb hier gezielt Board- und Spalten-CSS statt des ganzen Buendels.
    const boardCss = KanbanBlock.styles.map(String).join('\n')
    expect(boardCss).not.toContain('flex-wrap')
    expect(boardCss).not.toContain('overflow-x')
    expect(boardCss).toContain('align-items: stretch')
    // P1.3: das Board fuellt eine feste Hoehe aus (Spalten strecken sich,
    // Karten scrollen im Rumpf).
    expect(boardCss).toContain('height: 100%')
    const colCss = KanbanSpalteBlock.styles.map(String).join('\n')
    expect(colCss).toContain('overflow-y: auto')
    expect(colCss).toContain('min-height: 0')
    expect(colCss).not.toContain('overflow-x')
    expect(colCss).not.toContain('min-height: 150px')
  })

  it('Spalten-Feld + Datenwerte der Spalten reisen als Attribute (Kap. 5.3)', () => {
    const tree = boardTree()
    const board = tree[tree[ROOT_ID].childIds[0]]
    board.props.source = 'terminplaner'
    board.props.statusField = '253_30'
    tree[board.childIds[0]].props.statusValue = '1'
    tree[board.childIds[1]].props.statusValue = '2'
    const { html } = exportMask(tree)
    expect(html).toContain('<ff-kanban source="terminplaner" statusfield="253_30"')
    expect(html).toContain('heading="Offen" statusvalue="1"')
    expect(html).toContain('heading="In Arbeit" statusvalue="2"')
    expect(html).toContain('heading="Fertig" statusvalue=""')
  })

  it('Spalten + Musterkarte tragen ihre Werte als Attribute (ASCII-escaped)', () => {
    const { html } = exportMask(boardTree())
    expect(html).toContain('<ff-kanban-spalte variant="warning" heading="Offen"')
    // Die eine Musterkarte in der ersten Spalte (Karten-Defaults).
    expect(html).toContain('heading="R&#xFC;ckruf Fr. Wagner"')
    expect(html).toContain('chiptext="Heute"')
  })

  it('ist deterministisch bei festen Ids: gleicher Baum -> identisches HTML', () => {
    const tree = boardTree()
    expect(exportMask(tree).html).toBe(exportMask(tree).html)
  })
})
