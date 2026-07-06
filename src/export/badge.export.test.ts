// Export-Test fuer den echten BadgeBlock (Kap. 4K.2).
// Prueft, ob der reale Block (nicht die synthetischen Test-Bloecke) durch
// exportMask korrektes, deterministisches Markup erzeugt: defaultProps-
// Reihenfolge, Kleinbuchstaben-Attribute (Roundtrip-faehig), ASCII-Escaping.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import '../blocks/badge/BadgeBlock' // Side-Effect: registriert 'badge'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { exportMask } from './exportMask'
import type { BlockTree } from '../core/blocks/BlockData'

function tree(): BlockTree {
  return {
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['x'] },
    x: {
      id: 'x',
      type: 'badge',
      props: { variant: 'danger', text: 'Überfällig', width: 'auto' },
      parentId: 'root',
      childIds: [],
    },
  }
}

describe('Badge-Export (echter Block)', () => {
  it('registriert sich mit erwarteter defaultProps-Reihenfolge', () => {
    const def = getBlockDefinition('badge')
    expect(def?.defaultProps && Object.keys(def.defaultProps)).toEqual([
      'width', 'variant', 'text',
    ])
  })

  it('serialisiert variant/text als lowercase-Attribute in fester Reihenfolge', () => {
    const { html } = exportMask(tree())
    expect(html).toContain('<ff-badge variant="danger" text="&#xDC;berf&#xE4;llig"')
  })

  it('exportiert width=auto NICHT als Attribut (wirkt als Flow-Style)', () => {
    const { html } = exportMask(tree())
    expect(html).not.toContain('width="auto"')
  })

  it('ist deterministisch: gleicher Baum -> identisches HTML', () => {
    expect(exportMask(tree()).html).toBe(exportMask(tree()).html)
  })
})
