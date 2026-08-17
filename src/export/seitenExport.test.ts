import { describe, expect, it } from "vitest"

import "../blocks/popup/PopupBlock"
import "../blocks/ansicht/AnsichtBlock"
import "../blocks/navi/NaviBlock"
import "../blocks/navi/NaviEintragBlock"
import type { BlockTree } from "../core/blocks/BlockData"
import { RAND } from "../core/blocks/maskenRand"
import { exportMask } from "./exportMask"
import { registerTestBlocks, TEST_BLOCK } from "../test/testBlocks"

registerTestBlocks()

describe("exportMask: Seiten", () => {
  it('exportiert eine Popup-Seite GESCHLOSSEN im selben HTML, Inhalt reist mit (P-A)', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t1', 'p1'] },
      t1: { id: 't1', type: TEST_BLOCK, props: { text: 'Hauptseite' }, parentId: 'root', childIds: [] },
      p1: {
        id: 'p1', type: 'popup',
        props: { name: 'Neue Behandlung', breite: 400, hoehe: 300 },
        parentId: 'root', childIds: ['t2'],
      },
      t2: { id: 't2', type: TEST_BLOCK, props: { text: 'Im Popup' }, parentId: 'p1', childIds: [] },
    }
    const { html } = exportMask(tree)
    const tag = /<ff-popup[^>]*/.exec(html)?.[0] ?? ''
    expect(tag).toContain('name="Neue Behandlung"')
    expect(tag).toContain('breite="400"')
    expect(tag).toContain('hoehe="300"')

    expect(tag).not.toContain('offen')
    expect(html).toMatch(/<ff-popup[^>]*>\n\s+<ff-t-block[^>]*text="Im Popup"/)
  })

  it('exportiert eine Ansicht VERBORGEN, ihre Kinder liegen im Wurzel-Raster (N1)', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t1', 'a1'] },
      t1: { id: 't1', type: TEST_BLOCK, props: { text: 'Hauptseite' }, parentId: 'root', childIds: [] },
      a1: {
        id: 'a1', type: 'ansicht',
        props: { name: 'Terminkalender' },
        parentId: 'root', childIds: ['t2'],
      },
      t2: {
        id: 't2', type: TEST_BLOCK,
        props: { text: 'In der Ansicht', rasterX: 6, rasterY: 4, rasterW: 12, rasterH: 3 },
        parentId: 'a1', childIds: [],
      },
    }
    const { html } = exportMask(tree)
    const tag = /<ff-ansicht[^>]*/.exec(html)?.[0] ?? ''
    expect(tag).toContain('name="Terminkalender"')

    expect(tag).toContain('hidden')

    expect(tag).not.toContain('fuellt')
    expect(tag).not.toContain('style=')

    const kind = /<ff-t-block[^>]*text="In der Ansicht"[^>]*/.exec(html)?.[0] ?? ''
    expect(kind).toContain('fuellt')
    expect(kind).toContain('grid-column:7 / span 12')
    expect(kind).toContain('grid-row:5 / span 3')
  })

  it('Navi-Eintrag: Klarname reist, Editor-id bleibt daheim (N2)', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['nav', 'a1'] },
      nav: { id: 'nav', type: 'navi', props: {}, parentId: 'root', childIds: ['e1'] },
      e1: {
        id: 'e1', type: 'navi-eintrag',
        props: { seite: 'a1', seitename: 'Terminkalender', ton: 'himmel' },
        parentId: 'nav', childIds: [],
      },
      a1: { id: 'a1', type: 'ansicht', props: { name: 'Terminkalender' }, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree)
    const tag = /<ff-navi-eintrag[^>]*/.exec(html)?.[0] ?? ''

    expect(tag).toContain('seitename="Terminkalender"')
    expect(tag).toContain('ton="himmel"')

    expect(tag).not.toContain('seite="a1"')
    expect(html).toMatch(/<ff-navi[^>]*>\n\s+<ff-navi-eintrag/)
  })

  it('Navi-Eintrag: der Klarname entsteht aus der id, nicht aus der Abschrift', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['nav', 'a1'] },
      nav: { id: 'nav', type: 'navi', props: {}, parentId: 'root', childIds: ['e1', 'e2'] },
      e1: {
        id: 'e1', type: 'navi-eintrag',
        props: { seite: 'a1', seitename: 'Alter Name', ton: 'himmel' },
        parentId: 'nav', childIds: [],
      },

      e2: {
        id: 'e2', type: 'navi-eintrag',
        props: { seite: 'root', seitename: 'irgendwas', ton: 'koralle' },
        parentId: 'nav', childIds: [],
      },
      a1: { id: 'a1', type: 'ansicht', props: { name: 'Terminkalender' }, parentId: 'root', childIds: [] },
    }
    const tags = exportMask(tree).html.match(/<ff-navi-eintrag[^>]*/g) ?? []
    expect(tags[0]).toContain('seitename="Terminkalender"')
    expect(tags[0]).not.toContain('Alter Name')
    expect(tags[1]).toContain('seitename="Hauptseite"')
  })

  it('Navi liegt am Maskenrand, nicht in einer Zelle — und die Flaeche haelt ihre Breite frei (N2.1)', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['nav', 't1'] },
      nav: {
        id: 'nav', type: 'navi',

        props: { rasterX: 0, rasterY: 38, rasterW: 5, rasterH: 24 },
        parentId: 'root', childIds: [],
      },
      t1: { id: 't1', type: TEST_BLOCK, props: { text: 'Inhalt' }, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree)
    const tag = /<ff-navi[^>]*/.exec(html)?.[0] ?? ''

    expect(tag).toContain('position:absolute')
    expect(tag).toContain('left:0')
    expect(tag).toContain('top:0')
    expect(tag).toContain('bottom:0')

    expect(tag).not.toContain('width')

    expect(tag).not.toContain('grid-column')
    expect(tag).not.toContain('grid-row')

    expect(html).toContain(`padding: 16px 16px 16px ${16 + RAND.breite}px;`)

    const inhalt = /<ff-t-block[^>]*text="Inhalt"[^>]*/.exec(html)?.[0] ?? ''
    expect(inhalt).toContain('grid-column:1 / span 24')
  })
})
