// Export-Vertrag des TAGESFILTERS.
//
// Eigene Datei, weil export.test.ts am 500-Zeilen-Deckel steht (Regel 9) und
// weil hier eine Sache geprueft wird: ueberlebt die Einstellung „Tag filtern
// nach" den Export als Attribut, und traegt der Tageswaehler selbst wirklich
// keine Einstellungen mehr.
//
// Warum das ueberhaupt geprueft wird: faellt das Attribut im Export weg,
// zeigt SoftEngine stur ALLE Saetze, waehrend der Editor einen Tag zeigt —
// ein WYSIWYG-Bruch (Regel 1), und zwar ein STILLER. Die Maske sieht
// funktionierend aus, nur der Filter tut nichts. Im Browser faellt das nie
// auf; genau dafuer gibt es diesen Test.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
// Side-Effect-Importe: registrieren die beteiligten Bausteine.
import '../blocks/datum/DatumBlock'
import '../blocks/kanban/KanbanBlock'
import '../blocks/tabelle/TabelleBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { failedChecks, validateMaskHtml } from './validator'

const TAG_FELD = '183_10'

const spalten = [
  { titel: 'Kunde', feld: '2_8' },
  { titel: 'Datum', feld: TAG_FELD },
]

function maskeMitTagesfilter(): BlockTree {
  return {
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['tag', 'tab', 'kan'] },
    tag: { id: 'tag', type: 'datum', props: {}, parentId: 'root', childIds: [] },
    tab: {
      id: 'tab',
      type: 'tabelle',
      props: { width: 'fill', spalten, tagField: TAG_FELD },
      parentId: 'root',
      childIds: [],
    },
    kan: {
      id: 'kan',
      type: 'kanban',
      props: { width: 'fill', height: 'fill', tagField: TAG_FELD },
      parentId: 'root',
      childIds: [],
    },
  }
}

describe('Tagesfilter im Export', () => {
  it('„Tag filtern nach" reist bei Tabelle UND Kanban als Attribut mit', () => {
    const { html } = exportMask(maskeMitTagesfilter())
    expect(html).toMatch(new RegExp(`<ff-tabelle[^>]*\\stagField="${TAG_FELD}"`, 'i'))
    expect(html).toMatch(new RegExp(`<ff-kanban[^>]*\\stagField="${TAG_FELD}"`, 'i'))
  })

  it('der Tageswaehler selbst traegt KEINE Einstellungen (Regel 10)', () => {
    // Bis 2026-07-27 war der Baustein Uhr, Anzeigefeld und halber Waehler
    // zugleich. Kommt eine dieser Eigenschaften zurueck, faellt es hier auf.
    const { html } = exportMask(maskeMitTagesfilter())
    expect(html).toMatch(/<ff-datum[^>]*>/i)
    expect(html).not.toMatch(/<ff-datum[^>]*\s(source|valuefield|zeigt)=/i)
  })

  it('die Maske besteht die eingebaute SE-Pruefung', () => {
    const { html } = exportMask(maskeMitTagesfilter())
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })

  it('ohne eingestelltes Datumsfeld reist das Attribut GAR NICHT — und es filtert nicht', () => {
    // Bis 2026-08-06 stand hier `tagField=""`: der Export schrieb jede
    // Registry-Eigenschaft, auch die unangetastete. Seither bleibt der
    // Standardwert weg. Fuer die Laufzeit ist das dasselbe — sie liest
    // getAttribute(...) ?? '' und laesst bei leer alles durch (zeilenAmTag).
    // Masken ohne Tageswaehler verhalten sich deshalb wie vorher.
    const tree = maskeMitTagesfilter()
    tree.tab.props = { width: 'fill', spalten }
    tree.kan.props = { width: 'fill', height: 'fill' }
    const { html } = exportMask(tree)
    expect(html).not.toMatch(/<ff-tabelle[^>]*\stagField=/i)
    expect(html).not.toMatch(/<ff-kanban[^>]*\stagField=/i)
    expect(failedChecks(validateMaskHtml(html))).toEqual([])
  })
})
