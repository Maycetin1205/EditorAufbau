import { describe, expect, it } from 'vitest'

import '../blocks/datum/DatumBlock'
import '../blocks/kanban/KanbanBlock'
import '../blocks/tabelle/TabelleBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { failedChecks, validateMaskHtml } from './validator'

const TAG_FELD = '183_10'

const spalten = [
  { titel: 'Kunde', feld: '2_8' },
  { titel: 'Datum', feld: TAG_FELD },
]

function maskeMitTagesfilter(): BlockTree {
  return {
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tag', 'tab', 'kan'] },
    tag: { id: 'tag', type: 'datum', props: {}, parentId: 'root', childIds: [] },
    tab: {
      id: 'tab',
      type: 'tabelle',
      props: { width: 'fill', spalten, tagField: TAG_FELD },
      parentId: 'root',
      childIds: [],
    },
    kan: {
      id: 'kan',
      type: 'kanban',
      props: { width: 'fill', height: 'fill', tagField: TAG_FELD },
      parentId: 'root',
      childIds: [],
    },
  }
}

describe('Tagesfilter im Export', () => {
  it('„Tag filtern nach" reist bei Tabelle UND Kanban als Attribut mit', () => {
    const { html } = exportMask(maskeMitTagesfilter())
    expect(html).toMatch(new RegExp(`<ff-tabelle[^>]*\\stagField="${TAG_FELD}"`, 'i'))
    expect(html).toMatch(new RegExp(`<ff-kanban[^>]*\\stagField="${TAG_FELD}"`, 'i'))
  })

  it('der Tageswaehler selbst traegt KEINE Einstellungen (Regel 10)', () => {
    const { html } = exportMask(maskeMitTagesfilter())
    expect(html).toMatch(/<ff-datum[^>]*>/i)
    expect(html).not.toMatch(/<ff-datum[^>]*\s(source|valuefield|zeigt)=/i)
  })

  it('die Maske besteht die eingebaute SE-Pruefung', () => {
    const { html } = exportMask(maskeMitTagesfilter())
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('ohne eingestelltes Datumsfeld reist das Attribut GAR NICHT — und es filtert nicht', () => {
    const tree = maskeMitTagesfilter()
    tree.tab.props = { width: 'fill', spalten }
    tree.kan.props = { width: 'fill', height: 'fill' }
    const { html } = exportMask(tree)
    expect(html).not.toMatch(/<ff-tabelle[^>]*\stagField=/i)
    expect(html).not.toMatch(/<ff-kanban[^>]*\stagField=/i)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })
})
