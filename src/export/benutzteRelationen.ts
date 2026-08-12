// benutzteRelationen — WELCHE Relation-Vorlagen die Maske benutzt.
//
// Wortgleich aus exportMask herausgezogen (N2, 2026-08-12, 500-Zeilen-Deckel);
// kein Verhalten geaendert. Der Schnitt liegt am Gegenstand: nebenan steht
// mit `benutzteQuellen` schon die Antwort auf dieselbe Frage fuer die
// Datenquellen. Dort entsteht die Bestellung an SoftEngine, hier die Liste
// fuer FF_RELATIONS — beides „was von den Bibliotheken reist mit".

import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { relationIdsVon } from '../core/blocks/treeQuery'
import type { RelationTemplate } from '../core/data/relations'

// Sammelt benutzte Vorlagen — WELCHE ein Baustein benutzt, sagt relationIdsVon
// (dieselbe Stelle, die auch die Verwendungs-Anzeige der Steuerung fragt).
// Baum-, Ereignis- und Schritt-Reihenfolge sind deterministisch; unbekannte IDs
// werden von der Preflight abgefangen.
export function collectRelations(
  tree: BlockTree,
  relations: readonly RelationTemplate[],
): RelationTemplate[] {
  const seen = new Set<string>()
  const acc: RelationTemplate[] = []
  const visit = (node: BlockNode | undefined): void => {
    if (!node) return
    for (const id of relationIdsVon(node)) {
      const rel = relations.find((r) => r.id === id)
      if (!rel || seen.has(rel.id)) continue
      seen.add(rel.id)
      acc.push(rel)
    }
    node.childIds.forEach((id) => visit(tree[id]))
  }
  visit(tree[ROOT_ID])
  return acc
}
