import { describe, expect, it } from 'vitest'

import '../formfeld/FormFeldBlock'
import '../tabelle/TabelleBlock'
import '../kanban/KanbanBlock'
import '../trenner/TrennerBlock'
import { quelleAttrJeTag } from './holendeQuellen'

describe('quelleAttrJeTag', () => {
  it('nimmt für das Nachschlage-Feld dessen Nachschlage-Quelle', () => {
    expect(quelleAttrJeTag().get('ff-formfeld')).toBe('nachschlagquelle')
  })

  it('nimmt für Zeilen-Geber die normale Datenquelle', () => {
    const map = quelleAttrJeTag()
    expect(map.get('ff-tabelle')).toBe('source')
    expect(map.get('ff-kanban')).toBe('source')
  })

  it('kennt nur Bausteine, an denen der Bediener einen Satz herausgreift', () => {
    expect(quelleAttrJeTag().has('ff-trenner')).toBe(false)
  })
})
