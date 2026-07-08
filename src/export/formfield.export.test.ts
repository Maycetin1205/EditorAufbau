// Export-Test fuer den echten FormFieldBlock (Kap. 6).
// Prueft, ob der reale Block durch exportMask korrektes, deterministisches
// Markup erzeugt: defaultProps-Reihenfolge, Kleinbuchstaben-Attribute,
// ASCII-Escaping, width als Flow-Style (nicht Attribut). v1 ist statisch —
// keine bindbaren Stellen.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import '../blocks/formfield/FormFieldBlock' // Side-Effect: registriert 'formfield'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { exportMask } from './exportMask'
import { failedChecks, validateMaskHtml } from './validator'
import type { BlockTree } from '../core/blocks/BlockData'

function tree(): BlockTree {
  return {
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['x'] },
    x: {
      id: 'x',
      type: 'formfield',
      props: {
        fieldType: 'select',
        placeholder: 'Grund wählen',
        required: 'ja',
        readonly: 'nein',
        options: 'Röntgen, Impfung',
        width: 240,
      },
      parentId: 'root',
      childIds: [],
    },
  }
}

describe('FormField-Export (echter Block)', () => {
  it('ist ein Eingabe-Baustein ohne bindbare Stellen (v1 statisch)', () => {
    const def = getBlockDefinition('formfield')
    expect(def?.category).toBe('eingabe')
    expect(def?.bindableSpots).toBeUndefined()
    expect(def?.acceptsDataSource).toBeFalsy()
  })

  it('registriert sich mit erwarteter defaultProps-Reihenfolge', () => {
    const def = getBlockDefinition('formfield')
    expect(def?.defaultProps && Object.keys(def.defaultProps)).toEqual([
      'width', 'fieldType', 'placeholder', 'required', 'readonly', 'options',
    ])
  })

  it('serialisiert alle Props als lowercase-Attribute in fester Reihenfolge', () => {
    const { html } = exportMask(tree())
    expect(html).toContain(
      '<ff-formfield fieldtype="select" placeholder="Grund w&#xE4;hlen"'
      + ' required="ja" readonly="nein" options="R&#xF6;ntgen, Impfung"',
    )
  })

  it('exportiert die feste Breite als Flow-Style, nicht als Attribut', () => {
    const { html } = exportMask(tree())
    expect(html).toContain('style="width:240px;flex-shrink:0"')
    expect(html).not.toContain('width="240"')
  })

  it('erzeugt eine gültige SE-Maske (Validator-Gate)', () => {
    const { html } = exportMask(tree())
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('ist deterministisch: gleicher Baum -> identisches HTML', () => {
    expect(exportMask(tree()).html).toBe(exportMask(tree()).html)
  })
})
