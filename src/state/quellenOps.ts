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
// Zaehlt BEIDE Wege — erste Quelle (`source`) UND weitere Quelle
// (`weitereQuellen`). Die Steuerung sah bis 2026-07-30 nur die erste: eine
// nur als Zusatz benutzte Quelle galt als „nicht verwendet", und die
// Loeschen-Rueckfrage liess ihre Warnung weg. Wer sie dann loeschte, riss
// eine Verknuepfung ein, ohne gewarnt zu werden.
//
// Ein Baustein zaehlt EINMAL, auch wenn er dieselbe Quelle auf beiden Wegen
// nennt (moeglich nur in einem von Hand verbogenen Stand).
export function bausteineMitQuelle(tree: BlockTree, quelleId: string): BlockNode[] {
  if (quelleId === '') return []
  return Object.values(tree).filter((n) => {
    // Nur wer die Quelle GERADE traegt: die alte, unsichtbare Bindung eines
    // Nachschlage-Feldes benutzt sie nicht mehr — sie in der Loesch-Rueckfrage
    // aufzuzaehlen waere eine Warnung ueber etwas, das nichts mehr liest.
    if (!traegtEigeneQuelle(n)) return false
    if (n.props.source === quelleId) return true
    return weitereQuellenAus(n.props[WEITERE_QUELLEN_PROP]).some((q) => q.quelleId === quelleId)
  })
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
