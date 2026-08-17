import { describe, expect, it } from 'vitest'

import '../blocks/popup/PopupBlock'
import '../blocks/ansicht/AnsichtBlock'
import '../blocks/navi/NaviBlock'
import '../blocks/navi/NaviEintragBlock'

import '../blocks/bild/BildBlock'
import '../blocks/text/TextBlock'
import '../blocks/trenner/TrennerBlock'
import '../blocks/formfeld/FormFeldBlock'

import '../blocks/kanban/KanbanBlock'

import type { BlockTree } from '../core/blocks/BlockData'
import type { DataSource } from '../core/data/dataSources'
import { exportMask } from './exportMask'
import { preflightMask } from './preflight'
import { failedChecks, validateMaskHtml } from './validator'
import runtimeJsRaw from './generated/ff-runtime.js?raw'
import { registerTestBlocks, TEST_BLOCK, TEST_BOX } from '../test/testBlocks'

registerTestBlocks()

function demoTree(): BlockTree {
  return {
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t1', 'c1'] },

    t1: { id: 't1', type: TEST_BLOCK, props: { text: 'Übersicht — Empfang', width: 'auto', rasterX: 0, rasterY: 0, rasterW: 12, rasterH: 2 }, parentId: 'root', childIds: [] },
    c1: { id: 'c1', type: TEST_BOX, props: { direction: 'row', width: 'fill', rasterX: 0, rasterY: 2, rasterW: 24, rasterH: 4 }, parentId: 'root', childIds: ['t2'] },

    t2: { id: 't2', type: TEST_BLOCK, props: { text: 'Spalte', width: 240 }, parentId: 'c1', childIds: [] },
  }
}

describe('exportMask', () => {
  it('ist deterministisch: gleicher Baum → identische Dateien', () => {
    const a = exportMask(demoTree())
    const b = exportMask(demoTree())
    expect(a.html).toBe(b.html)
    expect(a.sevariablen).toBe(b.sevariablen)
  })

  it('besteht die eingebaute SE-Prüfung', () => {
    const { html } = exportMask(demoTree())
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('laedt das offizielle SoftEngine-Interface vor der eigenen Runtime', () => {
    const { html } = exportMask(demoTree())
    const interfaceTag = '<script src="<!--SOFTENGINE-VAR!EditorPfad-->/JS/JS/basis.html.interface.js"></script>'
    expect(html).toContain(interfaceTag)
    expect(html.indexOf(interfaceTag)).toBeLessThan(html.indexOf('<script>'))
  })

  it('Standard reist nicht: unangetastete Eigenschaften stehen NICHT im Markup', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t', 'b'] },
      t: { id: 't', type: TEST_BLOCK, props: { text: 'Standard' }, parentId: 'root', childIds: [] },
      b: { id: 'b', type: TEST_BOX, props: { direction: 'column' }, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree)

    const tagVon = (name: string): string => new RegExp(`<${name}[^>]*`).exec(html)?.[0] ?? ''
    expect(tagVon('ff-t-block')).not.toContain('text=')
    expect(tagVon('ff-t-box')).not.toContain('direction=')

    expect(html).toMatch(/<ff-t-block[^>]*><\/ff-t-block>/)

    expect(html).toContain('grid-column:')
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Nicht-Standard reist: jede abweichende Eigenschaft steht im Markup', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t', 'b'] },
      t: { id: 't', type: TEST_BLOCK, props: { text: 'Standard ' }, parentId: 'root', childIds: [] },
      b: { id: 'b', type: TEST_BOX, props: { direction: 'row' }, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree)
    expect(html).toContain('text="Standard "')
    expect(html).toContain('direction="row"')
  })

  it('Nachschlage-Spalten reisen als Attribut am Feld — ohne Einstellung steht nichts da', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['mit', 'ohne'] },
      mit: {
        id: 'mit',
        type: 'formfeld',
        props: {
          fieldType: 'nachschlagen',
          nachschlagSpalten: [{ titel: 'Nr', feld: '0_2', art: 'text' }],
        },
        parentId: 'root',
        childIds: [],
      },
      ohne: { id: 'ohne', type: 'formfeld', props: { fieldType: 'nachschlagen' }, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree)
    const felder = [...html.matchAll(/<ff-formfeld[^>]*>/g)].map((m) => m[0])
    expect(felder).toHaveLength(2)
    const mitAttr = felder.filter((f) => f.includes('nachschlagspalten='))
    expect(mitAttr).toHaveLength(1)
    expect(mitAttr[0]).toContain('0_2')
  })

  it('serialisiert den Baum als verschachtelte Custom Elements', () => {
    const { html } = exportMask(demoTree())
    expect(html).toContain('<ff-t-box direction="row"')
    expect(html).toMatch(/<ff-t-box[^>]*>\n\s+<ff-t-block/)
    expect(html).toContain('text="Spalte"')
  })

  it('Fluss-Breite in Containern wirkt als Flex-Item-Style; Wurzel-Kinder als Grid-Item', () => {
    const { html } = exportMask(demoTree())

    expect(html).toContain('style="width:240px;flex-shrink:0"')

    expect(html).toContain('grid-column:1 / span 12')
    expect(html).toContain('grid-row:3 / span 4')
  })

  it('exportiert eine Vollbildhülle; die Wurzel ist die Rasterfläche (Grid)', () => {
    const { html } = exportMask(demoTree())
    expect(html).toContain('html, body { width: 100%; height: 100%;')
    expect(html).toContain('.ff-root { box-sizing: border-box; width: 100%; height: 100%; overflow: auto;')

    expect(html).toContain('display:grid')
    expect(html).toContain('grid-template-columns:repeat(24, 1fr)')
  })

  it('fill-Höhe wirkt in einer Spalte als flex-grow (Fluss lebt in Containern weiter)', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['box'] },
      box: { id: 'box', type: TEST_BOX, props: { direction: 'column', width: 'fill' }, parentId: 'root', childIds: ['kind'] },
      kind: { id: 'kind', type: TEST_BLOCK, props: { text: 'x', height: 'fill' }, parentId: 'box', childIds: [] },
    }
    const { html } = exportMask(tree)
    expect(html).toContain('flex-grow:1;flex-basis:0;min-height:0')
  })

  it('hält die ASCII-Regel: Umlaute werden zu Entities', () => {
    const { html } = exportMask(demoTree())
    expect(html).not.toMatch(/[Ü—]/)
    expect(html).toContain('&#xDC;bersicht')
  })

  it('SEvariablen-JSON ist das leere, gültige Gerüst', () => {
    const { sevariablen } = exportMask(demoTree())
    expect(JSON.parse(sevariablen)).toEqual({ SEFILELOOP: [], ERPAPICALL: [] })
  })

  it('ohne Rand-Baustein bleibt die Wurzel-Regel unveraendert (N2.1)', () => {
    const { html } = exportMask(demoTree())

    expect(html).toContain('padding: 16px;')
  })
})

describe('Runtime-Bündel', () => {
  it('ist nach dem ASCII-Escaping weiterhin gültiges JavaScript', () => {
    const { html } = exportMask(demoTree())
    const script = /<script>\n([\s\S]*?)\n<\/script>/.exec(html)
    expect(script).not.toBeNull()

    expect(() => new Function(script![1])).not.toThrow()
  })

  it('traegt die Regel, die das Umschalten der Ansichten erst wirksam macht (N2.1)', () => {
    expect(runtimeJsRaw, 'npm run build:runtime ausführen — die hidden-Regel fehlt')
      .toContain(':host([hidden]) { display: none; }')
  })

  it('ist nicht veraltet: Bündel enthält die aktuellen Block-Tags', () => {
    for (const tag of ['ff-ansicht', 'ff-bild', 'ff-button', 'ff-card', 'ff-datum', 'ff-formfeld', 'ff-kanban', 'ff-kanban-spalte', 'ff-kanban-zimmer', 'ff-navi', 'ff-navi-eintrag', 'ff-popup', 'ff-tabelle', 'ff-text', 'ff-trenner']) {
      expect(runtimeJsRaw, `npm run build:runtime ausführen — ${tag} fehlt`).toContain(tag)
    }

    for (const tag of ['ff-container', 'ff-infobox', 'ff-badge', 'ff-formfield']) {
      expect(runtimeJsRaw, `npm run build:runtime ausführen — ${tag} ist abgeschafft`).not.toContain(tag)
    }

    expect(runtimeJsRaw, 'npm run build:runtime ausführen — ff-kanban-vorlage ist abgeschafft').not.toContain('ff-kanban-vorlage')

    expect(runtimeJsRaw, 'npm run build:runtime ausführen — Auffang-Kennzeichen fehlt').toContain('auffang')

    expect(runtimeJsRaw, 'npm run build:runtime ausführen — "Nicht zugeordnet" ist abgeschafft').not.toContain('data-ff-nicht-zugeordnet')

    expect(runtimeJsRaw, 'npm run build:runtime ausführen — bindingRoute ist abgeschafft').not.toContain('bindingRoute')

    for (const marker of [
      'basisHTML_REGISTER',
      'SoftEngine-Anschluss nicht gefunden',
      'Keine Daten von SoftEngine empfangen',
    ]) {
      expect(runtimeJsRaw, `npm run build:runtime ausführen — Marker ${marker} fehlt`)
        .toContain(marker)
    }

    expect(runtimeJsRaw, 'npm run build:runtime ausführen — Diagnose-Textarea ist abgeschafft')
      .not.toContain('ff-se-diagnose')
  })
})

describe('Atome (statische Bausteine, Fahrplan 3)', () => {
  it('Text: Stil (Größe/Gewicht/Ausrichtung) + Inhalt reisen als Attribute; Sonderzeichen werden escaped', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t'] },
      t: {
        id: 't', type: 'text',
        props: {
          groesse: 17, gewicht: 'fett', ausrichtung: 'mitte',
          text: 'A & B < C > "D" ä', width: 'fill',
        },
        parentId: 'root', childIds: [],
      },
    }
    const { html } = exportMask(tree)
    expect(html).toContain('<ff-text ')
    expect(html).toContain('groesse="17"')
    expect(html).toContain('gewicht="fett"')
    expect(html).toContain('ausrichtung="mitte"')

    expect(html).toContain('text="A &amp; B &lt; C &gt; &quot;D&quot; &#xE4;"')
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Text: die Farbe reist als Technikwert-Attribut mit (Token, kein Hex)', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t'] },
      t: {
        id: 't', type: 'text',
        props: { text: 'Notfall', farbe: 'fehler', width: 'fill' },
        parentId: 'root', childIds: [],
      },
    }
    const { html } = exportMask(tree)
    expect(html).toMatch(/<ff-text[^>]*\sfarbe="fehler"/)
    expect(html).not.toMatch(/<ff-text[^>]*#[0-9a-fA-F]{3}/)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Text: Datenbindung (Quelle + Feld) reist als Attribut mit', () => {
    const sources: DataSource[] = [{
      id: 'q-termine', name: 'Terminplaner', kind: 'idb', idbId: 'IDBID0004',
      indexField: '0_10', fields: [{ code: '40_20', label: 'Titel' }],
    }]
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t'] },
      t: {
        id: 't', type: 'text',
        props: { text: 'Titel', source: 'q-termine', textField: '40_20', width: 'fill' },
        parentId: 'root', childIds: [],
      },
    }
    const { html, sevariablen } = exportMask(tree, 'Maske', sources)
    expect(html).toMatch(/<ff-text[^>]*\ssource="q-termine"/)
    expect(html).toMatch(/<ff-text[^>]*\stextfield="40_20"/)

    expect(JSON.parse(sevariablen).SEFILELOOP).toEqual([
      { INDEX_NR: 0, ALIAS: 'Terminplaner', ID: 'IDBID0004', FELDER: '0_10,40_20' },
    ])
    expect(preflightMask(tree, sources, [])).toEqual([])
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Trennlinie waagerecht (Standard) exportiert als leeres Element ohne Attribute', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tr'] },
      tr: { id: 'tr', type: 'trenner', props: { width: 'fill', richtung: 'waagerecht' }, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree)
    expect(html).toMatch(/<ff-trenner[^>]*><\/ff-trenner>/)

    expect(html).not.toMatch(/<ff-trenner[^>]*richtung=/)
  })

  it('Trennlinie senkrecht traegt richtung="senkrecht" im Markup', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tr'] },
      tr: { id: 'tr', type: 'trenner', props: { width: 'fill', richtung: 'senkrecht' }, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree)
    expect(html).toMatch(/<ff-trenner[^>]*richtung="senkrecht"/)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Bild traegt seinen Daten-URI unveraendert im Markup', () => {
    const uri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['bi'] },
      bi: { id: 'bi', type: 'bild', props: { quelle: uri }, parentId: 'root', childIds: [] },
    }
    const { html } = exportMask(tree)
    expect(html).toContain(`quelle="${uri}"`)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('Bild ohne gewaehlte Datei traegt kein quelle-Attribut', () => {
    const tree: BlockTree = {
      root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['bi'] },
      bi: { id: 'bi', type: 'bild', props: { quelle: '' }, parentId: 'root', childIds: [] },
    }
    expect(exportMask(tree).html).toMatch(/<ff-bild[^>]*><\/ff-bild>/)
    expect(exportMask(tree).html).not.toMatch(/<ff-bild[^>]*quelle=/)
  })
})

