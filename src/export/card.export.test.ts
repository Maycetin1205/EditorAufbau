// Export-Test fuer den echten CardBlock (Kap. 4K.3).
// Prueft, ob der reale Block (nicht die synthetischen Test-Bloecke) durch
// exportMask korrektes, deterministisches Markup erzeugt: defaultProps-
// Reihenfolge, Kleinbuchstaben-Attribute (Roundtrip-faehig: Lit mappt
// chipVariant/chipText auf die Attribute chipvariant/chiptext), ASCII-Escaping.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import '../blocks/card/CardBlock' // Side-Effect: registriert 'card'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { exportMask } from './exportMask'
import type { BlockTree } from '../core/blocks/BlockData'

function tree(): BlockTree {
  return {
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['x'] },
    x: {
      id: 'x',
      type: 'card',
      props: {
        chipVariant: 'warning',
        heading: 'Rückruf Fr. Wagner',
        text: 'Befund Minka besprechen',
        chipText: 'Überfällig',
        width: 'auto',
      },
      parentId: 'root',
      childIds: [],
    },
  }
}

describe('Card-Export (echter Block)', () => {
  it('registriert sich mit erwarteter defaultProps-Reihenfolge (P1.2: 5 Stellen)', () => {
    const def = getBlockDefinition('card')
    expect(def?.defaultProps && Object.keys(def.defaultProps)).toEqual([
      'width', 'chipVariant', 'heading', 'time', 'meta', 'text', 'chipText',
      'headingField', 'timeField', 'metaField', 'textField', 'chipTextField',
    ])
  })

  it('serialisiert alle Props als lowercase-Attribute in fester Reihenfolge', () => {
    const { html } = exportMask(tree())
    expect(html).toContain(
      '<ff-card chipvariant="warning" heading="R&#xFC;ckruf Fr. Wagner"'
      + ' time="09:15" meta="Katze &#xB7; EKH"'
      + ' text="Befund Minka besprechen" chiptext="&#xDC;berf&#xE4;llig"'
      + ' headingfield="" timefield="" metafield="" textfield="" chiptextfield=""',
    )
  })

  it('deklariert bindbare Stellen konsistent zu den defaultProps (Kap. 5.2)', () => {
    const def = getBlockDefinition('card')
    expect(def?.bindableSpots?.map((s) => s.prop)).toEqual(['heading', 'time', 'meta', 'text', 'chipText'])
    for (const spot of def?.bindableSpots ?? []) {
      // Anzeige-Prop und Bindungs-Prop müssen als defaultProps existieren,
      // sonst überleben sie weder Persistenz noch Export.
      expect(def?.defaultProps, `Anzeige-Prop ${spot.prop} fehlt`).toHaveProperty(spot.prop)
      expect(def?.defaultProps, `Bindungs-Prop ${spot.prop}Field fehlt`).toHaveProperty(`${spot.prop}Field`, '')
      expect(spot.label.trim()).not.toBe('')
    }
  })

  it('exportiert eine gesetzte Bindung als Attribut (Feldcode = Technikwert)', () => {
    const t = tree()
    t.x.props.headingField = '78_30'
    const { html } = exportMask(t)
    expect(html).toContain('headingfield="78_30"')
  })

  it('exportiert width=auto NICHT als Attribut (wirkt als Flow-Style)', () => {
    const { html } = exportMask(tree())
    expect(html).not.toContain('width="auto"')
  })

  it('ist deterministisch: gleicher Baum -> identisches HTML', () => {
    expect(exportMask(tree()).html).toBe(exportMask(tree()).html)
  })
})
