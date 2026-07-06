// Export-Test fuer die echten Kanban-Bloecke (Kap. 4K.4).
// Prueft Registrierung (erlaubte Kind-Typen, feste Kind-Richtung, Palette-
// Sichtbarkeit, defaultProps-Reihenfolge), das verschachtelte Markup
// Board -> Spalte -> Karte, dass die feste Kind-Richtung 'row' des Boards
// im Export wirkt (fill-Spalte bekommt Zeilen-Flex), Determinismus und die
// eingebaute SE-Pruefung.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import '../blocks/kanban/KanbanBlock' // Side-Effect: registriert kanban + kanban-spalte + card
import { canContain, getBlockDefinition } from '../core/blocks/blockRegistry'
import { exportMask } from './exportMask'
import { failedChecks, validateMaskHtml } from './validator'
import type { BlockTree } from '../core/blocks/BlockData'

function tree(spalteWidth: number | string = 290): BlockTree {
  return {
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['b'] },
    b: { id: 'b', type: 'kanban', props: { width: 'fill' }, parentId: 'root', childIds: ['s'] },
    s: {
      id: 's',
      type: 'kanban-spalte',
      props: { heading: 'Offen', variant: 'warning', width: spalteWidth },
      parentId: 'b',
      childIds: ['k'],
    },
    k: {
      id: 'k',
      type: 'card',
      props: { chipVariant: 'info', heading: 'Impfpass nachtragen', text: 'Buddy', chipText: 'Heute', width: 'auto' },
      parentId: 's',
      childIds: [],
    },
  }
}

describe('Kanban-Registrierung (erlaubte Kind-Typen)', () => {
  it('Board nimmt nur Spalten, Spalte nur Karten (canContain)', () => {
    expect(canContain('kanban', 'kanban-spalte')).toBe(true)
    expect(canContain('kanban', 'card')).toBe(false)
    expect(canContain('kanban-spalte', 'card')).toBe(true)
    expect(canContain('kanban-spalte', 'button')).toBe(false)
    expect(canContain('kanban-spalte', 'kanban-spalte')).toBe(false)
    expect(canContain('root', 'kanban')).toBe(true)
  })

  it('Spalte ist Struktur-Block: nicht in der Bibliothek, feste Richtungen', () => {
    const spalte = getBlockDefinition('kanban-spalte')
    expect(spalte?.paletteHidden).toBe(true)
    expect(spalte?.childDirection).toBe('column')
    expect(spalte?.defaultProps && Object.keys(spalte.defaultProps)).toEqual([
      'width', 'heading', 'variant',
    ])
    const board = getBlockDefinition('kanban')
    expect(board?.paletteHidden).toBe(false)
    expect(board?.childDirection).toBe('row')
  })

  it('Board bringt das Zielbild als Beispieldaten mit (3 Spalten, 6 Karten)', () => {
    const specs = getBlockDefinition('kanban')?.defaultChildren ?? []
    expect(specs.map((s) => s.props?.heading)).toEqual(['Offen', 'In Arbeit', 'Fertig'])
    expect(specs.flatMap((s) => s.children ?? [])).toHaveLength(6)
  })
})

describe('Kanban-Export (echte Bloecke)', () => {
  it('serialisiert Board -> Spalte -> Karte verschachtelt mit lowercase-Attributen', () => {
    const { html } = exportMask(tree())
    expect(html).toMatch(/<ff-kanban[^>]*>\n\s+<ff-kanban-spalte/)
    expect(html).toMatch(/<ff-kanban-spalte[^>]*>\n\s+<ff-card/)
    expect(html).toContain('heading="Offen" variant="warning"')
    expect(html).toContain('style="width:290px;flex-shrink:0"') // feste Spaltenbreite
  })

  it('feste Kind-Richtung row wirkt im Export: fill-Spalte bekommt Zeilen-Flex', () => {
    const { html } = exportMask(tree('fill'))
    // In einer Zeile heisst fill flex-grow (nicht align-self:stretch wie in
    // Spalten) — das beweist, dass childDirection aus der Registry greift.
    expect(html).toMatch(/<ff-kanban-spalte[^>]*style="flex-grow:1;flex-basis:0;min-width:0"/)
  })

  it('besteht die eingebaute SE-Pruefung und ist deterministisch', () => {
    const a = exportMask(tree())
    expect(failedChecks(validateMaskHtml(a.html))).toEqual([])
    expect(a.html).toBe(exportMask(tree()).html)
  })
})
