// preflight
// Semantische Export-Vorpruefung (Stabilisierung S1). Anders als validator.ts
// (prueft nur die Dateiform: Marker/LF/ASCII/Grundgeruest) sieht die Preflight
// den BAUM + die Vorlagen-Bibliothek und blockiert den Export bei kaputten
// Referenzen, statt sie still zu ueberspringen. Grund (Nordstern): der Export
// muss vollstaendig + korrekt sein — eine Maske mit geloeschter Datenquelle
// laedt in SoftEngine stumm keine Daten (tote Maske), das darf nicht passieren.
//
// Rein (kein DOM), damit in Node testbar. Nutzt CheckResult aus validator.ts,
// damit die Toolbar beide Pruefungen identisch behandelt (failedChecks + alert).

import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import type { DataSource } from '../core/data/dataSources'
import type { CheckResult } from './validator'

// S1a: Ein Block mit acceptsDataSource, dessen source-Prop auf eine nicht (mehr)
// vorhandene Vorlage zeigt, wuerde stumm ohne Datenanbindung exportieren. Das
// meldet die Preflight als Fehler. Leerer String = bewusst keine Quelle (ok).
// Gibt nur die GEFUNDENEN Probleme zurueck (je ein CheckResult, ok:false);
// ein sauberer Baum liefert eine leere Liste.
export function preflightMask(
  tree: BlockTree,
  sources: readonly DataSource[],
): CheckResult[] {
  const results: CheckResult[] = []
  const visit = (node: BlockNode | undefined): void => {
    if (!node) return
    const def = getBlockDefinition(node.type)
    if (def?.acceptsDataSource) {
      const id = node.props.source
      if (typeof id === 'string' && id !== '' && !sources.some((s) => s.id === id)) {
        results.push({
          name: 'Datenquelle fehlt',
          ok: false,
          detail: `Baustein "${def.displayName ?? def.type}" verweist auf eine geloeschte oder unbekannte Datenquelle.`,
        })
      }
    }
    node.childIds.forEach((childId) => visit(tree[childId]))
  }
  visit(tree[ROOT_ID])
  return results
}
