// quellenOps — „welche Datenquellen sind an dieser Stelle des Baums zu haben?"
//
// Eine Frage, eine Antwort, EIN Ort. Bis 2026-07-28 stand die Baumsuche
// zweimal da: einmal als Editor.dataSourceFor, einmal in preflight.ts mit dem
// Kommentar „DIESELBE Regel wie Editor.dataSourceFor" — also schriftlich
// festgehalten, dass hier eine Doppelung wartet, bis eine der beiden abdriftet.
// Beim Ausbau auf MEHRERE Quellen je Baustein waeren daraus drei geworden.
//
// Pur: Baum + Bibliothek rein, Ergebnis raus. Kein Store, kein DOM, kein
// Baustein (Regel 2) — wer Traeger einer Quelle sein kann, entscheidet allein
// die hergeleitete Antwort traegtEigeneQuelle (Registry-Faehigkeit
// `acceptsDataSource`, notfalls zustandsabhaengig).

import type { BlockNode, BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { propertySichtbar } from '../core/blocks/PropertyDescription'
import { traegtEigeneQuelle } from '../core/blocks/treeQuery'
import type { DataSource } from '../core/data/dataSources'
import {
  quellenAufloesen,
  weitereQuellenAus,
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
    if (traegtEigeneQuelle(cur)) return cur
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

// Die Gegenrichtung: WELCHE Bausteine benutzen diese Quelle?
//
// Zaehlt ALLE VIER Wege, auf denen eine Quelle in der Maske wirklich gelesen
// wird — die Antwort steuert die BENUTZT-Warnung beim Loeschen, und was hier
// fehlt, verschwindet ohne Warnung:
//   1. die erste Quelle des Traegers (`source`),
//   2. seine weiteren Quellen (`weitereQuellen`; seit 2026-07-30),
//   3. eine Quelle als PROPERTY (kind 'quelle', z. B. die Nachschlage-Liste des
//      Formularfelds) und
//   4. ein Aktions-Parameter „Feld einer Datenquelle" (data_field).
// 3 und 4 fehlten bis 2026-08-06: die Liste eines Nachschlage-Fensters und die
// Quelle eines Schritt-Parameters galten als „nicht verwendet". Wer sie
// loeschte, verlor die Liste bzw. den Parameter, ohne gewarnt zu werden.
//
// Ein Baustein zaehlt EINMAL, auch wenn er dieselbe Quelle mehrfach nennt.
//
// NICHT zu verwechseln mit collectDataSources im Export: das beantwortet die
// andere Frage („welche Quelle muss SoftEngine schieben") und darf deshalb
// weniger einsammeln.
export function bausteineMitQuelle(tree: BlockTree, quelleId: string): BlockNode[] {
  if (quelleId === '') return []
  return Object.values(tree).filter((n) => nutztQuelle(n, quelleId))
}

function nutztQuelle(n: BlockNode, quelleId: string): boolean {
  // Weg 1+2 nur, wenn der Baustein die Quelle GERADE traegt: die alte,
  // unsichtbare Bindung eines Nachschlage-Feldes benutzt sie nicht mehr — sie in
  // der Loesch-Rueckfrage aufzuzaehlen waere eine Warnung ueber etwas, das
  // nichts mehr liest.
  if (traegtEigeneQuelle(n)) {
    if (n.props.source === quelleId) return true
    if (weitereQuellenAus(n.props[WEITERE_QUELLEN_PROP]).some((q) => q.quelleId === quelleId)) {
      return true
    }
  }
  const def = getBlockDefinition(n.type)
  // Weg 3, registry-getrieben (kein Bausteintyp hier) und zustandsabhaengig wie
  // im Export: der Nachschlage-Rest eines laengst auf „Text" zurueckgestellten
  // Feldes liest nichts mehr.
  for (const prop of def?.customProperties ?? []) {
    if (prop.kind !== 'quelle' || !propertySichtbar(prop.visibleWhen, n.props)) continue
    if (n.props[prop.attributeName] === quelleId) return true
  }
  // Weg 4: die Parameter der Aktionsketten. Nur RELATION-Schritte tragen
  // Parameter; `dataSourceId` steht allein an der Quelle 'data_field'.
  for (const event of def?.blockEvents ?? []) {
    for (const step of n.events?.[event.key] ?? []) {
      if (step.type !== 'RELATION') continue
      const trifft = [...step.params, ...step.extraParams].some(
        (b) => b.source === 'data_field' && b.dataSourceId === quelleId,
      )
      if (trifft) return true
    }
  }
  return false
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
