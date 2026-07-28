// quellenOps — „welche Datenquellen sind an dieser Stelle des Baums zu haben?"
//
// Eine Frage, eine Antwort, EIN Ort. Bis 2026-07-28 stand die Baumsuche
// zweimal da: einmal als Editor.dataSourceFor, einmal in preflight.ts mit dem
// Kommentar „DIESELBE Regel wie Editor.dataSourceFor" — also schriftlich
// festgehalten, dass hier eine Doppelung wartet, bis eine der beiden abdriftet.
// Beim Ausbau auf MEHRERE Quellen je Baustein waeren daraus drei geworden.
//
// Pur: Baum + Bibliothek rein, Ergebnis raus. Kein Store, kein DOM, kein
// Baustein (Regel 2) — nur der Registry-Eintrag `acceptsDataSource` entscheidet,
// wer Traeger einer Quelle sein kann.

import type { BlockNode, BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import type { DataSource } from '../core/data/dataSources'
import {
  quellenAufloesen,
  WEITERE_QUELLEN_PROP,
  type QuelleInReichweite,
} from '../core/data/sourceLinks'

// Der NAECHSTE Vorfahr (inklusive des Bausteins selbst) mit
// acceptsDataSource. Er bestimmt die Daten fuer alles darunter — die Karte
// bekommt ihre Felder von IHREM Kanban. Traegt er keine Quelle, gibt es keine
// Felder; weiter oben wird NICHT gesucht (sonst zoege ein Baustein
// unversehens Daten von irgendwo).
export function quellenTraeger(tree: BlockTree, id: string): BlockNode | undefined {
  let cur: BlockNode | undefined = tree[id]
  while (cur) {
    if (getBlockDefinition(cur.type)?.acceptsDataSource) return cur
    cur = cur.parentId ? tree[cur.parentId] : undefined
  }
  return undefined
}

// Alle Quellen in Reichweite: die erste (sie liefert die Zeilen) plus die
// weiteren, die am selben Traeger haengen. Reihenfolge und Auslassungen
// bestimmt quellenAufloesen.
export function quellenInReichweite(
  tree: BlockTree,
  id: string,
  bibliothek: readonly DataSource[],
): QuelleInReichweite[] {
  const traeger = quellenTraeger(tree, id)
  if (!traeger) return []
  return quellenAufloesen(traeger.props.source, traeger.props[WEITERE_QUELLEN_PROP], bibliothek)
}

// Nur die erste Quelle — der haeufige Fall (Zeilen, Tagesfilter, Schreibweg).
export function ersteQuelleInReichweite(
  tree: BlockTree,
  id: string,
  bibliothek: readonly DataSource[],
): DataSource | undefined {
  const traeger = quellenTraeger(tree, id)
  if (!traeger || typeof traeger.props.source !== 'string') return undefined
  return bibliothek.find((s) => s.id === traeger.props.source)
}
