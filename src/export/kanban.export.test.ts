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
  it('Board nimmt nur Spalten, Spalte nur Karten auf', () => {
    expect(canContain('kanban', 'kanban-spalte')).toBe(true)
    expect(canContain('kanban', 'card')).toBe(false)
    expect(canContain('kanban-spalte', 'card')).toBe(true)
    expect(canContain('kanban-spalte', 'button')).toBe(false)
    expect(canContain('kanban-spalte', 'kanban-spalte')).toBe(false)
  })

  it('Spalte ist nicht in der Bibliothek, Board schon', () => {
    expect(getBlockDefinition('kanban-spalte')?.showInPalette).toBe(false)
    expect(getBlockDefinition('kanban')?.showInPalette).not.toBe(false)
  })

  it('Beispieldaten: 3 Spalten Offen/In Arbeit/Fertig mit 3/1/2 Karten', () => {
    const tree = boardTree()
    const board = tree[tree[ROOT_ID].childIds[0]]
    const cols = board.childIds.map((id) => tree[id])
    expect(cols.map((c) => c.props.heading)).toEqual(['Offen', 'In Arbeit', 'Fertig'])
    expect(cols.map((c) => c.props.variant)).toEqual(['warning', 'info', 'success'])
    expect(cols.map((c) => c.childIds.length)).toEqual([3, 1, 2])
    expect(cols.every((c) => c.childIds.every((id) => tree[id].type === 'card'))).toBe(true)
  })
})

describe('Kanban-Export (echte Bloecke)', () => {
  it('serialisiert Board > Spalte > Karte verschachtelt und besteht die SE-Pruefung', () => {
    const { html } = exportMask(boardTree())
    expect(html).toMatch(/<ff-kanban[^>]*>\n\s+<ff-kanban-spalte/)
    expect(html).toMatch(/<ff-kanban-spalte[^>]*>\n\s+<ff-card/)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Board fuellt die Wurzel, Spalten haben feste Flow-Breite 290px', () => {
    const { html } = exportMask(boardTree())
    // width fill, KEIN direction-Attribut; source="" = Datenquellen-Prop
    // (Kap. 5.1) ohne angehaengte Quelle; statusfield=""/statusvalue="" =
    // Daten-Props aus Kap. 5.3 ohne gesetzte Werte; putrelation = Default-
    // Vorlage des Schreibwegs (Kap. 5.5).
    expect(html).toContain('<ff-kanban source="" statusfield="" putrelation="standard-put" style="align-self:stretch">')
    expect(html).toContain('heading="Offen" statusvalue="" style="width:290px;flex-shrink:0"')
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

  it('Spalten tragen Bedeutung + Titel als Attribute (ASCII-escaped)', () => {
    const { html } = exportMask(boardTree())
    expect(html).toContain('<ff-kanban-spalte variant="warning" heading="Offen"')
    expect(html).toContain('heading="R&#xFC;ckruf Fr. Wagner"')
    expect(html).toContain('chiptext="&#xDC;berf&#xE4;llig"')
  })

  it('ist deterministisch bei festen Ids: gleicher Baum -> identisches HTML', () => {
    const tree = boardTree()
    expect(exportMask(tree).html).toBe(exportMask(tree).html)
  })
})
