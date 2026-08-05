// Tests von bausteineMitQuelle — „wer benutzt diese Datenquelle?"
//
// Anlass (2026-07-30): die Steuerung zaehlte nur die ERSTE Quelle eines
// Bausteins. Seit v0.3.0 kann eine Quelle auch als WEITERE haengen; sie galt
// dadurch als „nicht verwendet", und die Loeschen-Rueckfrage liess ihre
// Warnung weg — man riss eine Verknuepfung ein, ohne gewarnt zu werden.
// Zweiter Anlass (2026-08-06), dieselbe Fehlerart: die Nachschlage-Quelle eines
// Formularfelds und die Quelle eines Aktions-Parameters zaehlten ebenfalls nicht.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
import type { BlockTree } from '../core/blocks/BlockData'
// Side-Effect-Import: das ECHTE Formularfeld — es traegt die Prop
// `nachschlagQuelle` (kind 'quelle'), um die es in den Tests unten geht.
import '../blocks/formfeld/FormFeldBlock'
import {
  registerTestBlocks,
  TEST_BLOCK,
  TEST_DATA_BOX,
  TEST_EVENT_BLOCK,
} from '../test/testBlocks'
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

  // Weg 3 (2026-08-06): eine Quelle als PROPERTY. Beim Nachschlage-Feld ist
  // acceptsDataSource ausdruecklich AUS — es traegt keine eigene Quelle, seine
  // Liste steht in `nachschlagQuelle`. Sie galt dadurch als unbenutzt: wer sie
  // loeschte, nahm dem Fenster ohne Warnung seine Liste.
  it('findet die Nachschlage-Quelle eines Formularfelds', () => {
    const baum: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['f'] },
      f: {
        id: 'f',
        type: 'formfeld',
        props: { fieldType: 'nachschlagen', nachschlagQuelle: 'q1' },
        parentId: 'root',
        childIds: [],
      },
    }
    expect(bausteineMitQuelle(baum, 'q1').map((n) => n.id)).toEqual(['f'])
  })

  it('uebergeht die Nachschlage-Quelle, wenn das Feld wieder auf Text steht', () => {
    // Zustandsabhaengig wie im Export: unsichtbar ist nicht geloescht, aber
    // gelesen wird sie in diesem Zustand auch nicht.
    const baum: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['f'] },
      f: {
        id: 'f',
        type: 'formfeld',
        props: { fieldType: 'text', nachschlagQuelle: 'q1' },
        parentId: 'root',
        childIds: [],
      },
    }
    expect(bausteineMitQuelle(baum, 'q1')).toEqual([])
  })

  // Weg 4 (2026-08-06): ein Schritt-Parameter „Feld einer Datenquelle".
  it('findet die Quelle eines Aktions-Parameters (data_field)', () => {
    const baum: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['e'] },
      e: {
        id: 'e',
        type: TEST_EVENT_BLOCK,
        props: {},
        parentId: 'root',
        childIds: [],
        events: {
          onClick: [{
            id: 's1',
            type: 'RELATION',
            resultKey: '',
            relationId: 'rel-1',
            params: [{ source: 'data_field', value: '30_10', dataSourceId: 'q1' }],
            extraParams: [],
          }],
        },
      },
    }
    expect(bausteineMitQuelle(baum, 'q1').map((n) => n.id)).toEqual(['e'])
    expect(bausteineMitQuelle(baum, 'q2')).toEqual([])
  })
})
