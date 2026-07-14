// Export-Tests (Kap. 3 Mini-Export)
// Prüfen die Export-Grundsätze maschinell: Determinismus (gleicher Baum →
// identische Datei), SE-Regeln (Marker/ASCII/LF via Validator), Breite als
// Flex-Item-Style aus derselben flowLayout-Quelle, und dass das eingebettete
// Runtime-Bündel nach dem ASCII-Escaping noch gültiges JavaScript ist.
// LEITPLANKE: Tests niemals löschen/abschwächen, um "grün" zu werden.

import { describe, expect, it } from 'vitest'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { failedChecks, validateMaskHtml } from './validator'
import runtimeJsRaw from './generated/ff-runtime.js?raw'
import { registerTestBlocks, TEST_BLOCK, TEST_BOX } from '../test/testBlocks'

registerTestBlocks()

function demoTree(): BlockTree {
  return {
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t1', 'c1'] },
    t1: { id: 't1', type: TEST_BLOCK, props: { text: 'Übersicht — Empfang', width: 'auto' }, parentId: 'root', childIds: [] },
    c1: { id: 'c1', type: TEST_BOX, props: { direction: 'row', width: 'fill' }, parentId: 'root', childIds: ['t2'] },
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

  it('serialisiert den Baum als verschachtelte Custom Elements', () => {
    const { html } = exportMask(demoTree())
    expect(html).toContain('<ff-t-box direction="row"')
    expect(html).toMatch(/<ff-t-box[^>]*>\n\s+<ff-t-block/) // Kind IM Container
    expect(html).toContain('text="Spalte"')
  })

  it('Breite wirkt als Flex-Item-Style (dieselbe flowLayout-Quelle)', () => {
    const { html } = exportMask(demoTree())
    expect(html).toContain('style="width:240px;flex-shrink:0"') // width fest
    expect(html).toContain('style="align-self:stretch"')        // fill in Spalte
  })

  it('hält die ASCII-Regel: Umlaute werden zu Entities', () => {
    const { html } = exportMask(demoTree())
    expect(html).not.toMatch(/[Ü—]/)
    expect(html).toContain('&#xDC;bersicht') // Ü
  })

  it('SEvariablen-JSON ist das leere, gültige Gerüst', () => {
    const { sevariablen } = exportMask(demoTree())
    expect(JSON.parse(sevariablen)).toEqual({ SEFILELOOP: [], ERPAPICALL: [] })
  })
})

describe('validateMaskHtml (Verteidigung)', () => {
  it('meldet fehlende Marker, CRLF und Nicht-ASCII', () => {
    const { html } = exportMask(demoTree())
    const kaputt = html.replace('<!--SOFTENGINE-VAR!JWHtmlStart-->', 'x')
    expect(failedChecks(validateMaskHtml(kaputt)).length).toBeGreaterThan(0)

    const crlf = html.replace(/\n/, '\r\n')
    expect(failedChecks(validateMaskHtml(crlf)).map((f) => f.name)).toContain('LF-only')

    const umlaut = html.replace('</body>', 'ä</body>')
    expect(failedChecks(validateMaskHtml(umlaut)).map((f) => f.name)).toContain('ASCII-only')
  })
})

describe('Runtime-Bündel', () => {
  it('ist nach dem ASCII-Escaping weiterhin gültiges JavaScript', () => {
    const { html } = exportMask(demoTree())
    const script = /<script>\n([\s\S]*?)\n<\/script>/.exec(html)
    expect(script).not.toBeNull()
    // Kompilieren (nicht ausführen) — wirft bei Syntaxfehlern.
    expect(() => new Function(script![1])).not.toThrow()
  })

  it('ist nicht veraltet: Bündel enthält die aktuellen Block-Tags', () => {
    for (const tag of ['ff-button', 'ff-text', 'ff-container', 'ff-infobox', 'ff-badge', 'ff-card', 'ff-kanban', 'ff-kanban-spalte', 'ff-formfield']) {
      expect(runtimeJsRaw, `npm run build:runtime ausführen — ${tag} fehlt`).toContain(tag)
    }
    // P1.1: der Vorlagen-Kasten ist abgeschafft — ein Bündel, das ihn noch
    // trägt, ist veraltet.
    expect(runtimeJsRaw, 'npm run build:runtime ausführen — ff-kanban-vorlage ist abgeschafft').not.toContain('ff-kanban-vorlage')
    // B1 (V2/K6): der Spaltenwert ist eine LISTE (statusvalues-Attribut) —
    // ein Bündel ohne die Listen-Auflösung verteilte exportierte Masken
    // stumm nicht mehr.
    expect(runtimeJsRaw, 'npm run build:runtime ausführen — statusvalues (B1) fehlt').toContain('statusvalues')
    // B2 (V2/K6): Zeilen ohne Treffer verschwinden NIE still — ein Bündel
    // ohne Auffang-Kennzeichen + "Nicht zugeordnet"-Laufzeitspalte hätte
    // wieder die abgeschaffte stille "erste Spalte"-Regel.
    expect(runtimeJsRaw, 'npm run build:runtime ausführen — Auffang-Kennzeichen (B2) fehlt').toContain('auffang')
    expect(runtimeJsRaw, 'npm run build:runtime ausführen — "Nicht zugeordnet" (B2) fehlt').toContain('data-ff-nicht-zugeordnet')
    // B3 (V2): das Board deklariert seine Bindungsstrecke in der Registry
    // (bindingRoute) — ein Bündel ohne das Konzept stammt von vor B3.
    expect(runtimeJsRaw, 'npm run build:runtime ausführen — bindingRoute (B3) fehlt').toContain('bindingRoute')
  })
})
