// treeQuery
// Reine Baum-Abfragen ohne Store-Bindung. Die Musterkarte hat EINE
// Definition im ganzen System: die ERSTE Nachfahren-Instanz des
// templateChild-Typs in Baumreihenfolge (DFS). Dieselbe Definition nutzen
// der Editor (Muster-Markierung + Löschschutz), der Export (<template>-
// Verpackung) und die Laufzeit (seRuntime klont das template-Element).

import { ROOT_ID, type BlockNode, type BlockTree } from './BlockData'
import type { ActionValueSpot } from './BlockDefinition'
import { getBlockDefinition } from './blockRegistry'

export interface ActionValueTarget {
  node: BlockNode
  spot: ActionValueSpot
}

// Alle explizit freigegebenen Bausteinwerte in Baum-Reihenfolge. Hauptseite
// und Popup-Seiten liegen beide unter ROOT_ID. Editor und Preflight benutzen
// dadurch dieselbe Wahrheit.
export function actionValueTargets(tree: BlockTree): ActionValueTarget[] {
  const result: ActionValueTarget[] = []
  const visit = (node: BlockNode | undefined): void => {
    if (!node) return
    const spots = getBlockDefinition(node.type)?.actionValueSpots ?? []
    for (const spot of spots) result.push({ node, spot })
    for (const childId of node.childIds) visit(tree[childId])
  }
  visit(tree[ROOT_ID])
  return result
}

// Alle Auswahl-GEBER der Maske in Baum-Reihenfolge (Registry: auswahlGeber).
// Wer eine Auswahl gibt, sagt die Registry — kein Bausteintyp-Wissen hier
// (Regel 2). Dieselbe Wahrheit fuer Steuerung (Parameterquelle „Feld der
// gewaehlten Zeile") und Preflight: bietet der Editor einen Geber an, den der
// Preflight nicht kennt, blockt der Export etwas gerade Eingestelltes.
export function auswahlGeberImBaum(tree: BlockTree): BlockNode[] {
  const result: BlockNode[] = []
  const visit = (node: BlockNode | undefined): void => {
    if (!node) return
    if (getBlockDefinition(node.type)?.auswahlGeber === true) result.push(node)
    for (const childId of node.childIds) visit(tree[childId])
  }
  visit(tree[ROOT_ID])
  return result
}

export function firstDescendantOfType(
  tree: BlockTree,
  rootId: string,
  type: string,
): string | undefined {
  for (const cid of tree[rootId]?.childIds ?? []) {
    const child = tree[cid]
    if (!child) continue
    if (child.type === type) return cid
    const found = firstDescendantOfType(tree, cid, type)
    if (found) return found
  }
  return undefined
}
