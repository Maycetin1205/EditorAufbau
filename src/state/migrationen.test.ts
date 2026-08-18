import { beforeEach, describe, expect, it } from 'vitest'

import '../blocks/kanban/KanbanBlock'
import '../blocks/formfeld/FormFeldBlock'
import '../blocks/button/ButtonBlock'
import '../blocks/trenner/TrennerBlock'
import '../blocks/tabelle/TabelleBlock'
import '../blocks/popup/PopupBlock'
import { Editor } from './Editor'
import { CURRENT_SCHEMA_VERSION, DEMO_CLEANUP_BEFORE_SCHEMA } from './migrations'
import { registerTestBlocks, TEST_BLOCK, TEST_BOX } from '../test/testBlocks'

registerTestBlocks()

const KEY = 'aufbau_editor_mvp_v1'

function load(state: unknown): Editor {
  localStorage.setItem(KEY, JSON.stringify(state))
  return new Editor()
}

beforeEach(() => { localStorage.clear() })

describe('Migration (P1.1: Vorlagen-Kasten abgeschafft)', () => {
  it('zieht die Musterkarte aus dem Kasten an den ANFANG der ersten Spalte, der Kasten verschwindet', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
        board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['kasten', 's1', 's2'] },
        kasten: { id: 'kasten', type: 'kanban-vorlage', props: {}, parentId: 'board', childIds: ['muster'] },
        muster: { id: 'muster', type: 'card', props: { heading: 'Meine Musterkarte' }, parentId: 'kasten', childIds: [] },
        s1: { id: 's1', type: 'kanban-spalte', props: { heading: 'Offen' }, parentId: 'board', childIds: ['alt'] },
        alt: { id: 'alt', type: 'card', props: { heading: 'Alte Karte' }, parentId: 's1', childIds: [] },
        s2: { id: 's2', type: 'kanban-spalte', props: {}, parentId: 'board', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('kasten')).toBeUndefined()
    expect(ed.getNode('board')?.childIds).toEqual(['s1', 's2'])

    expect(ed.getNode('s1')?.childIds).toEqual(['muster', 'alt'])
    expect(ed.getNode('muster')?.props.heading).toBe('Meine Musterkarte')
    expect(ed.getNode('muster')?.parentId).toBe('s1')
  })

  it('Board ohne Spalte (degeneriert): Kasten samt Karten entfällt, nichts bricht', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
        board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['kasten'] },
        kasten: { id: 'kasten', type: 'kanban-vorlage', props: {}, parentId: 'board', childIds: ['muster'] },
        muster: { id: 'muster', type: 'card', props: {}, parentId: 'kasten', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('kasten')).toBeUndefined()
    expect(ed.getNode('muster')).toBeUndefined()
    expect(ed.getNode('board')?.childIds).toEqual([])
  })
})

describe('Aufräum-Migration (2026-08-06: Knopf aus Tabelle)', () => {
  it('entfernt einen Knopf, der IN einer Tabelle liegt — restlos, nicht nur unsichtbar', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab'] },
        tab: { id: 'tab', type: 'tabelle', props: {}, parentId: 'root', childIds: ['knopf'] },
        knopf: { id: 'knopf', type: 'button', props: { label: 'Neuer Patient' }, parentId: 'tab', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('knopf')).toBeUndefined()
    expect(ed.getNode('tab')?.childIds).toEqual([])

    expect(ed.getNode('tab')?.type).toBe('tabelle')
  })

  it('lässt Knöpfe AUSSERHALB der Tabelle in Ruhe', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tab', 'frei'] },
        tab: { id: 'tab', type: 'tabelle', props: {}, parentId: 'root', childIds: [] },
        frei: { id: 'frei', type: 'button', props: { label: 'Speichern' }, parentId: 'root', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('frei')?.props.label).toBe('Speichern')
    expect(ed.getNode('root')?.childIds).toEqual(['tab', 'frei'])
  })
})

describe('Migration (V0, 2026-08-18: „Angezeigt wird" wird zur ersten Fenster-Spalte)', () => {
  const feldStand = (props: Record<string, unknown>): unknown => ({
    tree: {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['feld'] },
      feld: { id: 'feld', type: 'formfeld', props, parentId: 'root', childIds: [] },
    },
    selectedId: null,
  })

  it('macht aus dem alten Anzeigefeld zwei Spalten — die erste ist, was im Feld steht', () => {
    const ed = load(feldStand({
      fieldType: 'nachschlagen', nachschlagQuelle: 'q-adr',
      anzeigeFeld: '10_30', anzeigeTitel: 'Name',
      speicherFeld: '2_8', speicherTitel: 'Adressnummer',
    }))
    // Ohne `art`: die Migration kennt bewusst keine Spalten-Arten (sie liegt
    // in state/, darf also keinen Baustein importieren). Die Art setzt der
    // Normalisierer der Tabelle beim Lesen — Text.
    expect(ed.getNode('feld')?.props.nachschlagSpalten).toEqual([
      { titel: 'Name', feld: '10_30' },
      { titel: 'Adressnummer', feld: '2_8' },
    ])
    expect(ed.getNode('feld')?.props.anzeigeFeld).toBeUndefined()
    expect(ed.getNode('feld')?.props.anzeigeTitel).toBeUndefined()
  })

  it('selbst gestellte Spalten bleiben unangetastet — sie sind die juengere Ansage', () => {
    const eigene = [{ titel: 'Ort', feld: '40_20', art: 'text' }]
    const ed = load(feldStand({
      fieldType: 'nachschlagen', nachschlagQuelle: 'q-adr',
      anzeigeFeld: '10_30', anzeigeTitel: 'Name',
      speicherFeld: '2_8', speicherTitel: 'Adressnummer',
      nachschlagSpalten: eigene,
    }))
    expect(ed.getNode('feld')?.props.nachschlagSpalten).toEqual(eigene)
  })

  it('kein oder gleiches Anzeigefeld: es bleibt bei der Automatik (eine Spalte)', () => {
    const ed = load(feldStand({
      fieldType: 'nachschlagen', nachschlagQuelle: 'q-adr',
      anzeigeFeld: '2_8', speicherFeld: '2_8', speicherTitel: 'Adressnummer',
    }))
    expect(ed.getNode('feld')?.props.nachschlagSpalten).toEqual([])
  })
})

describe('Migration (2026-07-16: alte Karten-Demo-Werte werden geleert)', () => {
  it('leert exakt die früheren Werkswerte, echte Eingaben bleiben', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
        board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['s1'] },
        s1: { id: 's1', type: 'kanban-spalte', props: {}, parentId: 'board', childIds: ['demo', 'echt'] },
        demo: {
          id: 'demo',
          type: 'card',
          props: {
            heading: 'Rückruf Fr. Wagner',
            time: '09:15',
            meta: 'Katze · EKH',
            text: 'Befund Minka besprechen',
            chipText: 'Heute',
          },
          parentId: 's1',
          childIds: [],
        },
        echt: {
          id: 'echt',
          type: 'card',
          props: { heading: 'Rückruf Hr. Meier', text: 'Vom Nutzer getippt' },
          parentId: 's1',
          childIds: [],
        },
      },
      selectedId: null,
    })
    const demo = ed.getNode('demo')?.props
    expect(demo?.heading).toBe('')
    expect(demo?.time).toBe('')
    expect(demo?.meta).toBe('')
    expect(demo?.text).toBe('')
    expect(demo?.chipText).toBe('')
    const echt = ed.getNode('echt')?.props
    expect(echt?.heading).toBe('Rückruf Hr. Meier')
    expect(echt?.text).toBe('Vom Nutzer getippt')
  })

  const mitKarte = (schemaVersion: number) => load({
    schemaVersion,
    tree: {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
      board: { id: 'board', type: 'kanban', props: {}, parentId: 'root', childIds: ['s1'] },
      s1: { id: 's1', type: 'kanban-spalte', props: {}, parentId: 'board', childIds: ['getippt'] },
      getippt: {
        id: 'getippt',
        type: 'card',
        props: { chipText: 'Heute', time: '09:15', heading: 'Rückruf Fr. Wagner' },
        parentId: 's1',
        childIds: [],
      },
    },
    selectedId: null,
  })

  it('Schema 4 ist Altbestand: die Werkswerte werden geleert', () => {
    const props = mitKarte(4).getNode('getippt')?.props
    expect(props?.chipText).toBe('')
    expect(props?.time).toBe('')
    expect(props?.heading).toBe('')
  })

  it('Schema 5 bleibt unberuehrt — „Heute" ist dort echt', () => {
    const props = mitKarte(5).getNode('getippt')?.props
    expect(props?.chipText).toBe('Heute')
    expect(props?.time).toBe('09:15')
    expect(props?.heading).toBe('Rückruf Fr. Wagner')
  })

  it('Schema 6 laedt nachsichtig und wird NICHT geputzt', () => {
    const props = mitKarte(6).getNode('getippt')?.props
    expect(props?.chipText).toBe('Heute')
    expect(props?.heading).toBe('Rückruf Fr. Wagner')
  })

  it('die Putzer-Grenze wandert nicht mit der Schemaversion mit', () => {
    expect(DEMO_CLEANUP_BEFORE_SCHEMA).toBe(5)
    expect(CURRENT_SCHEMA_VERSION).toBeGreaterThanOrEqual(DEMO_CLEANUP_BEFORE_SCHEMA)
  })
})

describe('Migration (Schema 2: Root-Kanban nutzt die Maskenfläche)', () => {
  it('setzt alte Pixelmaße einmalig auf volle Breite und verbleibende Höhe', () => {
    const ed = load({
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
        board: {
          id: 'board',
          type: 'kanban',
          props: { width: 1273, height: 836 },
          parentId: 'root',
          childIds: [],
        },
      },
      selectedId: null,
    })
    expect(ed.getNode('board')?.props.width).toBe('fill')
    expect(ed.getNode('board')?.props.height).toBe('fill')
  })

  it('erhält eine danach bewusst gesetzte feste Höhe', () => {
    const ed = load({
      schemaVersion: 2,
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['board'] },
        board: {
          id: 'board',
          type: 'kanban',
          props: { width: 'fill', height: 500 },
          parentId: 'root',
          childIds: [],
        },
      },
      selectedId: null,
    })
    expect(ed.getNode('board')?.props.height).toBe(500)
  })
})

describe('Migration (Schema 4: Reparatur der Riesen-Rahmen)', () => {
  it('gibt schmalen Bausteinen die Startbreite zurück, Vollbreite bleibt, überlappungsfrei neu gestapelt', () => {
    const ed = load({
      schemaVersion: 3,
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['ff', 'btn', 'tr'] },
        ff: { id: 'ff', type: 'formfeld', props: { rasterX: 0, rasterY: 0, rasterW: 24, rasterH: 3 }, parentId: 'root', childIds: [] },
        btn: { id: 'btn', type: 'button', props: { rasterX: 0, rasterY: 3, rasterW: 24, rasterH: 3 }, parentId: 'root', childIds: [] },
        tr: { id: 'tr', type: 'trenner', props: { rasterX: 0, rasterY: 6, rasterW: 24, rasterH: 1 }, parentId: 'root', childIds: [] },
      },
      selectedId: null,
    })

    expect(ed.getNode('ff')?.props.rasterW).toBe(6)
    expect(ed.getNode('btn')?.props.rasterW).toBe(4)

    expect(ed.getNode('tr')?.props.rasterW).toBe(24)

    expect(ed.getNode('ff')?.props.rasterH).toBe(2)
    expect(ed.getNode('tr')?.props.rasterH).toBe(1)

    expect(ed.getNode('ff')?.props.rasterX).toBe(0)
    expect(ed.getNode('ff')?.props.rasterY).toBe(0)
    expect(ed.getNode('btn')?.props.rasterY).toBe(3)
    expect(ed.getNode('tr')?.props.rasterY).toBe(6)
  })

  it('lässt bereits geheilte/frische Stände unberührt (idempotent)', () => {
    const ed = load({
      schemaVersion: 3,
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['a', 'b'] },

        a: { id: 'a', type: 'formfeld', props: { rasterX: 2, rasterY: 1, rasterW: 6, rasterH: 3 }, parentId: 'root', childIds: [] },
        b: { id: 'b', type: 'button', props: { rasterX: 8, rasterY: 1, rasterW: 4, rasterH: 3 }, parentId: 'root', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('a')?.props.rasterX).toBe(2)
    expect(ed.getNode('a')?.props.rasterY).toBe(1)
    expect(ed.getNode('a')?.props.rasterW).toBe(6)
    expect(ed.getNode('b')?.props.rasterX).toBe(8)
    expect(ed.getNode('b')?.props.rasterW).toBe(4)
  })
})

describe('Migration (altes Flach-Format)', () => {
  it('übernimmt Blöcke aus dem alten Listen-Format, Layout wird verworfen', () => {
    const ed = load({
      blocks: [
        { id: 'alt1', type: TEST_BLOCK, props: { text: 'Alt' }, layout: { x: 10, y: 20, width: 100, height: 40 } },
        { id: 'alt2', type: 'unbekannt', props: {} },
      ],
    })
    expect(ed.getNode('alt1')?.props.text).toBe('Alt')
    expect(ed.getNode('alt1')?.parentId).toBe(ed.rootId)
    expect(ed.getNode('alt1')?.props.layout).toBeUndefined()
    expect(ed.getNode('alt2')).toBeUndefined()
  })
})

describe('Migration (C2: Popup-Raster, Zeile aufgeloest)', () => {
  it('loest eine Zeile auf der Hauptflaeche auf — die Kinder erben ihr Zellband', () => {
    const ed = load({
      schemaVersion: 5,
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['z', 'tr'] },
        z: { id: 'z', type: 'zeile', props: { rasterX: 2, rasterY: 4, rasterW: 24, rasterH: 3 }, parentId: 'root', childIds: ['ff', 'btn'] },
        ff: { id: 'ff', type: 'formfeld', props: {}, parentId: 'z', childIds: [] },
        btn: { id: 'btn', type: 'button', props: {}, parentId: 'z', childIds: [] },
        tr: { id: 'tr', type: 'trenner', props: { rasterX: 0, rasterY: 7, rasterW: 24, rasterH: 1 }, parentId: 'root', childIds: [] },
      },
      selectedId: null,
    })

    expect(ed.getNode('z')).toBeUndefined()
    expect(ed.getNode('root')?.childIds).toEqual(['ff', 'btn', 'tr'])

    expect(ed.getNode('ff')?.props).toMatchObject({ rasterX: 2, rasterY: 4, rasterW: 6, rasterH: 3 })
    expect(ed.getNode('btn')?.props).toMatchObject({ rasterX: 8, rasterY: 4, rasterW: 4, rasterH: 3 })

    expect(ed.getNode('tr')?.props).toMatchObject({ rasterX: 0, rasterY: 7, rasterH: 1 })
  })

  it('loest eine Zeile IM FLUSS auf, ohne Zellen zu erfinden', () => {
    const ed = load({
      schemaVersion: 5,
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['box'] },
        box: { id: 'box', type: TEST_BOX, props: { rasterX: 0, rasterY: 0, rasterW: 24, rasterH: 4 }, parentId: 'root', childIds: ['a', 'z', 'b'] },
        a: { id: 'a', type: TEST_BLOCK, props: {}, parentId: 'box', childIds: [] },
        z: { id: 'z', type: 'zeile', props: { rasterH: 3 }, parentId: 'box', childIds: ['c'] },
        c: { id: 'c', type: 'formfeld', props: {}, parentId: 'box', childIds: [] },
        b: { id: 'b', type: TEST_BLOCK, props: {}, parentId: 'box', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('box')?.childIds).toEqual(['a', 'c', 'b'])

    expect(ed.getNode('c')?.props.rasterH).toBe(1)
  })

  it('stapelt den Popup-Inhalt beim Sprung auf Schema 6 in Zellen', () => {
    const ed = load({
      schemaVersion: 5,
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['p'] },
        p: { id: 'p', type: 'popup', props: { name: 'Details' }, parentId: 'root', childIds: ['ff', 'btn'] },
        ff: { id: 'ff', type: 'formfeld', props: {}, parentId: 'p', childIds: [] },
        btn: { id: 'btn', type: 'button', props: {}, parentId: 'p', childIds: [] },
      },
      selectedId: null,
    })

    expect(ed.getNode('ff')?.props).toMatchObject({ rasterX: 0, rasterY: 0, rasterW: 6, rasterH: 2 })
    expect(ed.getNode('btn')?.props).toMatchObject({ rasterX: 0, rasterY: 2, rasterW: 4, rasterH: 2 })
  })

  it('loest auch eine Zeile IM Popup auf', () => {
    const ed = load({
      schemaVersion: 5,
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['p'] },
        p: { id: 'p', type: 'popup', props: { name: 'Details' }, parentId: 'root', childIds: ['z'] },
        z: { id: 'z', type: 'zeile', props: {}, parentId: 'p', childIds: ['ff', 'btn'] },
        ff: { id: 'ff', type: 'formfeld', props: {}, parentId: 'z', childIds: [] },
        btn: { id: 'btn', type: 'button', props: {}, parentId: 'z', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('p')?.childIds).toEqual(['ff', 'btn'])
    expect(ed.getNode('btn')?.props).toMatchObject({ rasterX: 0, rasterY: 2 })
  })

  it('laesst gesetzte Popup-Positionen in Ruhe (Schema 6 ist idempotent)', () => {
    const ed = load({
      schemaVersion: 6,
      tree: {
        root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['p'] },
        p: { id: 'p', type: 'popup', props: { name: 'Details' }, parentId: 'root', childIds: ['ff', 'btn'] },
        ff: { id: 'ff', type: 'formfeld', props: { rasterX: 6, rasterY: 3, rasterW: 8, rasterH: 2 }, parentId: 'p', childIds: [] },
        btn: { id: 'btn', type: 'button', props: { rasterX: 0, rasterY: 0, rasterW: 4, rasterH: 2 }, parentId: 'p', childIds: [] },
      },
      selectedId: null,
    })
    expect(ed.getNode('ff')?.props).toMatchObject({ rasterX: 6, rasterY: 3, rasterW: 8 })
    expect(ed.getNode('btn')?.props).toMatchObject({ rasterX: 0, rasterY: 0, rasterW: 4 })
  })
})
