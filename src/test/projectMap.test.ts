import { describe, expect, it } from 'vitest'
import { analyzeImports, buildMapData, importsFrom, renderProjectMap } from '../../scripts/generate-project-map.mjs'

describe('Projektkarten-Importanalyse', () => {
  it('unterscheidet Laufzeit-, Typ- und dynamische TypeScript-Imports', () => {
    const source = [
      "import React from 'react'",
      "import type { BlockNode } from './BlockData'",
      "export type { Relation } from './relations'",
      "const dialog = import('./Dialog')",
      "const legacy = require('./legacy')",
    ].join('\n')

    expect(importsFrom(source, '.ts')).toEqual([
      { specifier: 'react', kind: 'runtime' },
      { specifier: './BlockData', kind: 'type' },
      { specifier: './relations', kind: 'type' },
      { specifier: './Dialog', kind: 'dynamic' },
      { specifier: './legacy', kind: 'runtime' },
    ])
  })

  it('erkennt Stylesheet- und HTML-Verweise', () => {
    expect(importsFrom("@import './tokens.css';", '.css')).toEqual([
      { specifier: './tokens.css', kind: 'style' },
    ])
    expect(importsFrom('<script src="./main.js"></script><link rel="stylesheet" href="./app.css">', '.html')).toEqual([
      { specifier: './main.js', kind: 'asset' },
      { specifier: './app.css', kind: 'asset' },
    ])
  })

  it('ignoriert Import-Texte in Kommentaren und normalen Strings', () => {
    const source = [
      "// import fake from './comment'",
      "const example = \"require('./string')\"",
      "/* export { fake } from './block-comment' */",
      "import { real } from './real'",
    ].join('\n')

    expect(importsFrom(source, '.ts')).toEqual([
      { specifier: './real', kind: 'runtime' },
    ])
  })

  it('blockiert berechnete dynamische Importziele statt sie zu verschweigen', () => {
    const result = analyzeImports("const page = import('./pages/' + name)", '.ts')

    expect(result.imports).toEqual([])
    expect(result.unresolved).toHaveLength(1)
    expect(result.unresolved[0]).toContain('Dynamischer Import')
  })

  it('ignoriert HTML-Kommentare, Skriptinhalte und nicht fachliche Icon-Links', () => {
    const html = [
      '<!-- <script src="./fake.js"></script> -->',
      '<link rel="icon" href="./favicon.svg">',
      '<link rel="stylesheet" href="./real.css">',
      '<script>const example = \'<script src="./also-fake.js">\'</script>',
      '<script src="./real.js"></script>',
    ].join('\n')

    expect(importsFrom(html, '.html')).toEqual([
      { specifier: './real.css', kind: 'asset' },
      { specifier: './real.js', kind: 'asset' },
    ])
  })

  it('kann die komplette Karte ohne unaufgelöste Beziehung validieren', () => {
    const data = buildMapData()

    expect(data.analysis.problems).toEqual([])
    expect(() => renderProjectMap()).not.toThrow()
  })

  it('liefert eine syntaktisch gültige visuelle Dateikarte aus', () => {
    const html = renderProjectMap()
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]

    expect(html).toContain('function renderFileAreas()')
    expect(html).toContain('function renderFileFocus(id)')
    expect(scripts).toHaveLength(1)
    expect(() => new Function(scripts[0][1])).not.toThrow()
  })

  it('zeigt deutsche Beschreibungstexte mit echten Umlauten', () => {
    const data = buildMapData()
    const forbidden = /\b(?:abhaengigkeit|aenderung|ausschliesslich|ausgefuehrt|ausfuehrung|bloecke|duenner|faelle|flaeche|fuer|gehoert|geschuetztes|grundgeruest|haelt|huelle|loeschen|loescht|loest|molekuel|prueft|pruefung|spaeter|ueber|urspruenglich|waehlt|zurueck)\b/i

    expect(data.nodes.filter((node) => forbidden.test(node.description))).toEqual([])
    expect(data.nodes.find((node) => node.id === 'src/blocks/kanban/KanbanBlock.ts')?.description).toContain('AUSSCHLIEẞLICH')
  })
})
