// Verteidigung des Exports: der Validator (Marker, LF-only, ASCII,
// SoftEngine-Interface, eingebettetes Runtime-Buendel) und die Zeichen-Regeln
// des Serializers.
//
// Am 2026-08-06 aus export.test.ts herausgeloest — die Datei war ueber den
// 500-Zeilen-Deckel gewachsen (check:regeln). Der Schnitt ist der natuerliche:
// drueben die Abbildung Baum -> Markup, hier die maschinelle PRUEFUNG des
// Ergebnisses. Die Faelle sind unveraendert uebernommen.
// LEITPLANKE: Tests niemals löschen/abschwächen, um "grün" zu werden.

import { describe, expect, it } from 'vitest'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { escapeHtmlText } from './serializer'
import { failedChecks, validateMaskHtml } from './validator'
import { registerTestBlocks, TEST_BLOCK } from '../test/testBlocks'

registerTestBlocks()

// Kleinste gueltige Maske: ein Baustein auf der Rasterflaeche. Mehr braucht
// die Verteidigung nicht — geprueft wird die Huelle, nicht der Inhalt.
function kleineMaske(): BlockTree {
  return {
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['t1'] },
    t1: {
      id: 't1', type: TEST_BLOCK,
      props: { text: 'Übersicht — Empfang', rasterX: 0, rasterY: 0, rasterW: 12, rasterH: 2 },
      parentId: 'root', childIds: [],
    },
  }
}

describe('validateMaskHtml (Verteidigung)', () => {
  it('meldet fehlende Marker, CRLF und Nicht-ASCII', () => {
    const { html } = exportMask(kleineMaske())
    const kaputt = html.replace('<!--SOFTENGINE-VAR!JWHtmlStart-->', 'x')
    expect(failedChecks(validateMaskHtml(kaputt)).length).toBeGreaterThan(0)

    const crlf = html.replace(/\n/, '\r\n')
    expect(failedChecks(validateMaskHtml(crlf)).map((f) => f.name)).toContain('LF-only')

    const umlaut = html.replace('</body>', 'ä</body>')
    expect(failedChecks(validateMaskHtml(umlaut)).map((f) => f.name)).toContain('ASCII-only')
  })

  it('blockiert einen Export ohne SoftEngine-Interface', () => {
    const { html } = exportMask(kleineMaske())
    const ohneInterface = html.replace(
      '<script src="<!--SOFTENGINE-VAR!EditorPfad-->/JS/JS/basis.html.interface.js"></script>\n',
      '',
    )
    expect(failedChecks(validateMaskHtml(ohneInterface)).map((f) => f.name))
      .toContain('SoftEngine-Interface vorhanden')
  })

  it('blockiert einen Export mit leerem Runtime-Buendel', () => {
    const { html } = exportMask(kleineMaske())
    const start = html.indexOf('(function(){')
    const end = html.lastIndexOf('\n</script>')
    expect(start).toBeGreaterThan(0)
    expect(end).toBeGreaterThan(start)
    const ohneRuntime = html.slice(0, start) + html.slice(end)
    expect(failedChecks(validateMaskHtml(ohneRuntime)).map((f) => f.name))
      .toContain('Runtime-Buendel eingebettet')
  })
})

describe('serializer (ASCII-Regel)', () => {
  it('escaped Umlaute wie bisher, aber Emoji als GANZEN Codepoint (kein Surrogat-Bruch)', () => {
    // Umlaute: byte-identisch zur alten Fassung — Regressionsschutz, damit der
    // Referenzabzug vom Emoji-Fix NICHT beruehrt wird.
    expect(escapeHtmlText('Grüße')).toBe('Gr&#xFC;&#xDF;e')
    // Emoji (U+1F600): frueher zwei ungueltige Surrogat-Haelften
    // (&#xD83D;&#xDE00;), jetzt EIN gueltiger Codepoint.
    expect(escapeHtmlText('Status 😀')).toBe('Status &#x1F600;')
    // Keine isolierte Surrogat-Referenz (D800..DFFF) mehr im Ergebnis.
    expect(escapeHtmlText('😀')).not.toMatch(/&#xD[89A-F][0-9A-F][0-9A-F];/i)
  })
})
