// Tests von bausteineMitQuelle — „wer benutzt diese Datenquelle?"
//
// Anlass (2026-07-30): die Steuerung zaehlte nur die ERSTE Quelle eines
// Bausteins. Seit v0.3.0 kann eine Quelle auch als WEITERE haengen; sie galt
// dadurch als „nicht verwendet", und die Loeschen-Rueckfrage liess ihre
// Warnung weg — man riss eine Verknuepfung ein, ohne gewarnt zu werden.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import type { BlockTree } from '../core/blocks/BlockData'
import { registerTestBlocks, TEST_BLOCK, TEST_DATA_BOX } from '../test/testBlocks'
import { bausteineMitQuelle } from './quellenOps'

registerTestBlocks()

// Ein Baum mit einem Quellen-Traeger; `props` bestimmt den Testfall.
function baumMit(props: Record<string, unknown>): BlockTree {
  return {
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['b'] },
    b: { id: 'b', type: TEST_DATA_BOX, props, parentId: 'root', childIds: [] },
  }
}

describe('bausteineMitQuelle', () => {
  it('findet den Baustein ueber seine ERSTE Quelle', () => {
    const treffer = bausteineMitQuelle(baumMit({ source: 'q1' }), 'q1')
    expect(treffer.map((n) => n.id)).toEqual(['b'])
  })

  it('findet ihn auch ueber eine WEITERE Quelle (der behobene Fehler)', () => {
    const baum = baumMit({
      source: 'q1',
      weitereQuellen: [{ quelleId: 'q2', keyPairs: [{ fromField: '10_8', toField: '10_8' }] }],
    })
    expect(bausteineMitQuelle(baum, 'q2').map((n) => n.id)).toEqual(['b'])
  })

  it('zaehlt einen Baustein nur EINMAL, auch wenn er die Quelle doppelt nennt', () => {
    const baum = baumMit({
      source: 'q1',
      weitereQuellen: [{ quelleId: 'q1', keyPairs: [{ fromField: 'a', toField: 'b' }] }],
    })
    expect(bausteineMitQuelle(baum, 'q1')).toHaveLength(1)
  })

  it('uebergeht Bausteine, die gar keine Quelle tragen koennen', () => {
    const baum: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t'] },
      // TEST_BLOCK hat kein acceptsDataSource — eine source-Prop an ihm ist
      // bedeutungslos und darf nicht als Verwendung zaehlen.
      t: { id: 't', type: TEST_BLOCK, props: { source: 'q1' }, parentId: 'root', childIds: [] },
    }
    expect(bausteineMitQuelle(baum, 'q1')).toEqual([])
  })

  it('liefert bei leerer Quellen-id nichts, statt alles ohne Quelle zu treffen', () => {
    // Sonst zaehlte jeder Baustein mit `source: ''` als Benutzer der
    // „leeren" Quelle — und die Steuerung zeigte Unsinn.
    expect(bausteineMitQuelle(baumMit({ source: '' }), '')).toEqual([])
  })

  it('wirft nicht bei kaputten weiteren Quellen', () => {
    expect(bausteineMitQuelle(baumMit({ source: 'q1', weitereQuellen: 'kaputt' }), 'q1'))
      .toHaveLength(1)
  })
})
