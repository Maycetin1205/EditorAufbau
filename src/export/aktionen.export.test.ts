// Export-Tests fuer Aktionsketten (Z2): Ketten reisen als data-ff-aktionen-
// Attribut am Element (deterministisch, ohne Editor-ids, ASCII-escaped);
// ohne Ketten gibt es KEIN Attribut. LEITPLANKE: Tests niemals loeschen/
// abschwaechen.

import { describe, expect, it } from 'vitest'
import '../blocks/register' // Side-Effect: registriert alle echten Bloecke
import { createBlockSubtree } from '../core/blocks/blockFactory'
import { ROOT_ID, type BlockTree } from '../core/blocks/BlockData'
import type { BlockEventsMap } from '../core/data/aktionen'
import { exportMask } from './exportMask'
import { failedChecks, validateMaskHtml } from './validator'

// Baum mit einem Block-Typ an der Wurzel; optional mit Aktionsketten.
function treeWith(type: string, events?: BlockEventsMap): BlockTree {
  const tree: BlockTree = {
    [ROOT_ID]: { id: ROOT_ID, type: 'root', props: {}, parentId: null, childIds: [] },
  }
  const { nodes, rootId } = createBlockSubtree(type)
  nodes[rootId] = { ...nodes[rootId], parentId: ROOT_ID, ...(events ? { events } : {}) }
  Object.assign(tree, nodes)
  tree[ROOT_ID].childIds.push(rootId)
  return tree
}

describe('Export: data-ff-aktionen (Z2)', () => {
  it('ohne Ketten traegt kein Element das Attribut', () => {
    const { html } = exportMask(treeWith('kanban'), 'Maske', [], [])
    // Attribut-Form (mit ="…) — der String 'data-ff-aktionen' selbst steht
    // legitim im eingebetteten Runtime-Buendel (die Laufzeit LIEST ihn).
    expect(html).not.toContain(' data-ff-aktionen="')
  })

  it('Ketten reisen exakt, in Registry-Reihenfolge, ohne Editor-ids', () => {
    const { html } = exportMask(
      treeWith('kanban', {
        // absichtlich in "falscher" Reihenfolge gesetzt — der Export
        // serialisiert nach Registry (onCardClick vor onCardDrop).
        onCardDrop: [
          { id: 'b', type: 'START_TOOL', resultKey: '', toolNr: '7', toolParams: [] },
        ],
        onCardClick: [
          { id: 'a', type: 'START_TOOL', resultKey: '', toolNr: '3003', toolParams: ['{PINDEX}'] },
        ],
      }),
      'Maske', [], [],
    )
    expect(html).toContain(
      ' data-ff-aktionen="{&quot;onCardClick&quot;:[{&quot;type&quot;:&quot;START_TOOL&quot;,'
      + '&quot;resultKey&quot;:&quot;&quot;,&quot;toolNr&quot;:&quot;3003&quot;,'
      + '&quot;toolParams&quot;:[&quot;{PINDEX}&quot;]}],'
      + '&quot;onCardDrop&quot;:[{&quot;type&quot;:&quot;START_TOOL&quot;,'
      + '&quot;resultKey&quot;:&quot;&quot;,&quot;toolNr&quot;:&quot;7&quot;,'
      + '&quot;toolParams&quot;:[]}]}"',
    )
    expect(html).not.toContain('&quot;id&quot;')
  })

  it('Umlaute in Parametern werden escaped — der Validator bleibt gruen (ASCII-Regel)', () => {
    const { html } = exportMask(
      treeWith('button', {
        onClick: [
          { id: 'a', type: 'START_TOOL', resultKey: '', toolNr: '1951', toolParams: ['Grüße'] },
        ],
      }),
      'Maske', [], [],
    )
    expect(html).toContain('Gr&#xFC;&#xDF;e')
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })
})
