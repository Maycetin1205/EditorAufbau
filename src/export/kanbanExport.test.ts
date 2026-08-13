// Export-Tests des KANBAN-Bausteins.
//
// Aus export.test.ts herausgeloest (2026-08-13) — dieselbe Datei war zum
// dritten Mal ueber den 500-Zeilen-Deckel gewachsen (check:regeln; vorher zog
// 2026-08-06 der Validator aus, 2026-08-07 die Tabelle). Der Schnitt liegt am
// Gegenstand: hier alles, was das Kanban-Board mit seinen Spalten
// exportieren muss, drueben die Export-Grundsaetze selbst (Determinismus,
// Standardwerte, Runtime-Buendel, Atome).
//
// Verhaltensneutral: die Faelle sind Zeichen fuer Zeichen dieselben wie vorher
// in export.test.ts, nur umgezogen (Plan 3.1 — ein Dateischnitt und eine
// fachliche Aenderung sind zwei Commits).
//
// Anlass, warum es diese Faelle ueberhaupt gibt: der Tabellen-Bug 2026-07-24.
// Umbenannte Spalten fielen im Export still auf die Standardtitel zurueck, und
// kein Test beruehrte je den Baustein — also schlug kein Waechter an. Seither
// gilt: neuer Baustein bzw. neue Maskeneinstellung = Fall im Export-Test.
// LEITPLANKE: Tests niemals loeschen/abschwaechen, um "gruen" zu werden.

import { describe, expect, it } from 'vitest'
// Registriert Kanban-Board und -Spalte.
import '../blocks/kanban/KanbanBlock'
import type { BlockTree } from '../core/blocks/BlockData'
import { exportMask } from './exportMask'
import { failedChecks, validateMaskHtml } from './validator'

describe('Kanban', () => {
  const board = (props: Record<string, unknown>): BlockTree => ({
    root: { id: 'root', type: 'root', props: {}, parentId: null, childIds: ['b'] },
    b: {
      id: 'b', type: 'kanban', parentId: 'root', childIds: ['sp'],
      props: { width: 'fill', height: 'fill', ...props },
    },
    sp: {
      id: 'sp', type: 'kanban-spalte', parentId: 'b', childIds: [],
      props: { heading: 'Offen', variant: 'warning' },
    },
  })
  const boardTag = (html: string): string => /<ff-kanban[\s>][^>]*/i.exec(html)?.[0] ?? ''

  it('„Text wenn leer" reist nur mit, wenn er vom Standard abweicht', () => {
    // Der Satz haengt am BOARD und wird zur Laufzeit an die leer ausgegangenen
    // Spalten gereicht (kanban/seRuntime). Faellt das Attribut im Export weg,
    // zeigt SoftEngine einen anderen Satz als der Editor angesagt hat
    // (WYSIWYG-Bruch, Regel 1). Der Umlaut ist die Falle — roher Text
    // zerbraeche an der ASCII-Regel.
    const gesetzt = exportMask(board({ leerText: 'Niemand wartet gerade.' })).html
    expect(boardTag(gesetzt)).toMatch(/\sleerText="Niemand wartet gerade\."/i)
    expect(exportMask(board({ leerText: 'Heute für niemanden.' })).html)
      .toMatch(/\sleerText="Heute f&#xFC;r niemanden\."/i)
    expect(failedChecks(validateMaskHtml(gesetzt))).toEqual([])
    // Der unangetastete Standardsatz bleibt daheim (Standardwert-Regel) —
    // sonst waere jede bestehende Maske im Export anders und der Byte-Waechter
    // (referenzabzug) haette bei diesem Paket angeschlagen.
    expect(boardTag(exportMask(board({ leerText: 'Keine Datensätze.' })).html))
      .not.toMatch(/leerText=/i)
    // Die SPALTE traegt ihn nie: der Leerzustand ist ein Laufzeitwert
    // (leerHinweis, attribute:false), kein Bauplan der einzelnen Spalte.
    expect(/<ff-kanban-spalte[^>]*/i.exec(gesetzt)?.[0] ?? '').not.toMatch(/leer/i)
  })
})
