// Export-Test fuer den echten InfoBoxBlock (Kap. 4).
// Prueft, ob der reale Block (nicht die synthetischen Test-Bloecke) durch
// exportMask korrektes, deterministisches Markup erzeugt: Attribut-Reihenfolge,
// Kleinbuchstaben-Attribute (Roundtrip-faehig), ASCII-Escaping.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import '../blocks/infobox/InfoBoxBlock' // Side-Effect: registriert 'infobox'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { exportMask } from './exportMask'
import type { BlockTree } from '../core/blocks/BlockData'

function tree(): BlockTree {
  return {
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['x'] },
    x: {
      id: 'x',
      type: 'infobox',
      props: { variant: 'warning', heading: 'Übersicht', message: 'Zimmer 2 belegt.', width: 'auto' },
      parentId: 'root',
      childIds: [],
    },
  }
}

describe('InfoBox-Export (echter Block)', () => {
  it('registriert sich mit erwarteter defaultProps-Reihenfolge', () => {
    const def = getBlockDefinition('infobox')
    expect(def?.defaultProps && Object.keys(def.defaultProps)).toEqual([
      'width', 'variant', 'heading', 'message',
    ])
  })

  it('serialisiert variant/heading/message als lowercase-Attribute in fester Reihenfolge', () => {
    const { html } = exportMask(tree())
    expect(html).toContain('<ff-infobox variant="warning" heading="&#xDC;bersicht" message="Zimmer 2 belegt."')
  })

  it('ist deterministisch: gleicher Baum -> identisches HTML', () => {
    expect(exportMask(tree()).html).toBe(exportMask(tree()).html)
  })
})
