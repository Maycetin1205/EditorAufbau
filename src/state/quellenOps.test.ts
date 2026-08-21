import { describe, expect, it } from 'vitest'
import type { BlockTree } from '../core/blocks/BlockData'

import '../blocks/formfeld/FormFeldBlock'
import '../blocks/tabelle/TabelleBlock'
import {
  registerTestBlocks,
  TEST_BLOCK,
  TEST_DATA_BOX,
  TEST_EVENT_BLOCK,
} from '../test/testBlocks'
import { bausteineMitQuelle } from './quellenOps'

registerTestBlocks()

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

  // Befund 2026-08-21: eine Quelle, die NUR von Tabellenspalten benutzt wurde,
  // galt als unbenutzt. Der Loesch-Hinweis im Datencenter blieb aus, und sie
  // war mit einem Klick weg — obwohl die Maske sie braucht.
  it('findet ihn ueber „Sucht beim Erfassen in" einer Tabellenspalte', () => {
    const baum: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t'] },
      t: {
        id: 't', type: 'tabelle', parentId: 'root', childIds: [],
        props: {
          source: 'q-pos', erfassung: 'ja',
          spalten: [{ titel: 'Artikel', feld: '18_25', art: 'text', suchtIn: 'q-art' }],
        },
      },
    }
    expect(bausteineMitQuelle(baum, 'q-art').map((n) => n.id)).toEqual(['t'])
  })

  it('findet ihn ueber eine Spalte, die ihre Quelle beim Namen nennt', () => {
    const baum: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t'] },
      t: {
        id: 't', type: 'tabelle', parentId: 'root', childIds: [],
        props: {
          source: 'q-pos',
          spalten: [{ titel: 'Bezeichnung', feld: 'q-art::30_40', art: 'text' }],
        },
      },
    }
    expect(bausteineMitQuelle(baum, 'q-art').map((n) => n.id)).toEqual(['t'])
  })

  it('eine Spalte ohne Quellenbezug macht keinen falschen Treffer', () => {
    const baum: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t'] },
      t: {
        id: 't', type: 'tabelle', parentId: 'root', childIds: [],
        props: {
          source: 'q-pos',
          spalten: [{ titel: 'Menge', feld: '164_8', art: 'zahl' }],
        },
      },
    }
    expect(bausteineMitQuelle(baum, 'q-art')).toEqual([])
  })

  it('uebergeht Bausteine, die gar keine Quelle tragen koennen', () => {
    const baum: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t'] },

      t: { id: 't', type: TEST_BLOCK, props: { source: 'q1' }, parentId: 'root', childIds: [] },
    }
    expect(bausteineMitQuelle(baum, 'q1')).toEqual([])
  })

  it('liefert bei leerer Quellen-id nichts, statt alles ohne Quelle zu treffen', () => {
    expect(bausteineMitQuelle(baumMit({ source: '' }), '')).toEqual([])
  })

  it('wirft nicht bei kaputten weiteren Quellen', () => {
    expect(bausteineMitQuelle(baumMit({ source: 'q1', weitereQuellen: 'kaputt' }), 'q1'))
      .toHaveLength(1)
  })

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
