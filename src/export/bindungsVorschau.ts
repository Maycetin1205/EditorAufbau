// bindungsVorschau — der Klarname, den eine gebundene Stelle in der MASKE
// zeigt, solange dort noch kein Wert steht.
//
// Der Editor zeigt an gebundenen Stellen den Feld-Klarnamen statt eines
// erfundenen Beispielwerts (Regel 7, useLitElement). Die Maske zeigte dort
// bis 2026-08-06 NICHTS: sie kennt nur Feldcodes, und der getippte Text
// ("Feldname") waere an einer Datenstelle gelogen — also versteckte ein
// CSS-Riegel den Platzhalter gebundener Felder ganz (SE-Echttest 2026-08-04).
// Leer war ehrlich, aber der Bediener sah einem leeren Feld nicht mehr an,
// wozu es gehoert.
//
// Jetzt loest der EXPORT den Klarnamen auf und schreibt ihn ins Markup: er
// kennt die Vorlagen-Bibliothek, die Maske kennt sie nie. Der Weg ueber ein
// mitgeschicktes Feld-Woerterbuch (window.FF_DATA_SOURCES) waere die
// Alternative gewesen — dagegen sprach, dass dann die Felder ALLER benutzten
// Quellen mitreisen, auch die nie gebundenen, und dass exportMask genau das
// ausdruecklich nicht tut (Bindungen reisen als Feldcode-Attribute).
//
// Rein und ohne Store-Zugriff, damit dieselbe Antwort im Test ohne Maske
// nachvollziehbar ist.

import type { BlockNode } from '../core/blocks/BlockData'
import { bindingProp, zerlegeBindung, type BindableSpot } from '../core/blocks/BlockDefinition'
import { bindbareStellenVon, QUELLE_PROP } from '../core/blocks/treeQuery'
import type { DataSource } from '../core/data/dataSources'

// Klarname des gebundenen Felds.
//
// `bindung` ist der rohe Bindungswert der Stelle — entweder ein Feldcode der
// EIGENEN Quelle ('10_30') oder 'quelleId::code' fuer eine weitere Quelle.
// Die weitere Quelle wird ueber ihre id aufgeloest und NICHT ueber die
// Reihenfolge: derselbe Feldcode bedeutet in zwei Quellen Verschiedenes, die
// erste zu nehmen zeigte den falschen Klarnamen (dieselbe Regel wie im
// Editor, useLitElement).
//
// Leerer Rueckgabewert = nicht aufloesbar (Quelle geloescht, Feld nicht mehr
// im Woerterbuch). Dann bleibt die Stelle in der Maske leer, genau wie vor
// 2026-08-06 — der getippte Text darf NICHT einspringen, er stuende an einer
// Datenstelle. Ueber den Export kommt dieser Fall ohnehin kaum hinaus, die
// Preflight blockt eine Bindung ins Leere mit Klartext.
export function feldKlarname(
  bindung: string,
  eigeneQuelleId: string,
  sources: readonly DataSource[],
): string {
  const { quelleId, code } = zerlegeBindung(bindung)
  const gesucht = quelleId === '' ? eigeneQuelleId : quelleId
  if (gesucht === '' || code === '') return ''
  const quelle = sources.find((s) => s.id === gesucht)
  return quelle?.fields.find((f) => f.code === code)?.label ?? ''
}

// Die Stellen eines Knotens, deren Vorschau in eine ANDERE Prop geht, nach
// dieser Ziel-Prop geschluesselt (Formularfeld: 'placeholder' → Wert-Stelle).
// Nur GERADE bindbare Stellen: am Nachschlage-Feld bleibt der getippte Text
// stehen, dort gibt es keine Bindung, deren Klarnamen man zeigen koennte.
export function vorschauStellenVon(node: BlockNode): Map<string, BindableSpot> {
  return new Map(bindbareStellenVon(node).flatMap((spot) => (spot.vorschauProp === undefined
    ? []
    : [[spot.vorschauProp, spot] as const])))
}

// Was an der Vorschau-Prop im Markup landet: UNGEBUNDEN der getippte Text
// (beim Formularfeld die Beschriftung, die der Bauer ins Feld geschrieben
// hat), GEBUNDEN der Feld-Klarname. Der Editor zeigt an derselben Stelle
// dasselbe (useLitElement) — nur mit einem ↗ hinter Feldern einer weiteren
// Quelle: die Markierung sagt dem BAUER, woher der Wert kommt, und hat in der
// fertigen Maske nichts zu suchen.
export function vorschauRoh(
  node: BlockNode,
  spot: BindableSpot,
  sources: readonly DataSource[],
  standard: unknown,
): string {
  const bindung = String(node.props[bindingProp(spot.prop)] ?? '')
  if (bindung === '') {
    return String(node.props[spot.vorschauProp ?? spot.prop] ?? standard ?? '')
  }
  return feldKlarname(bindung, String(node.props[QUELLE_PROP] ?? ''), sources)
}
