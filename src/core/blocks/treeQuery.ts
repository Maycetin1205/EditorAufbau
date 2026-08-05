// treeQuery
// Reine Baum-Abfragen ohne Store-Bindung. Die Musterkarte hat EINE
// Definition im ganzen System: die ERSTE Nachfahren-Instanz des
// templateChild-Typs in Baumreihenfolge (DFS). Dieselbe Definition nutzen
// der Editor (Muster-Markierung + Löschschutz), der Export (<template>-
// Verpackung) und die Laufzeit (seRuntime klont das template-Element).

import { ROOT_ID, type BlockNode, type BlockTree } from './BlockData'
import type { ActionValueSpot } from './BlockDefinition'
import { getBlockDefinition } from './blockRegistry'
import { propertySichtbar } from './PropertyDescription'

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

// Prop-Name der normalen Datenquelle eines Bausteins (acceptsDataSource).
const QUELLE_PROP = 'source'

// Die Quelle, aus der der herausgegriffene Satz STAMMT — als Vorlagen-id
// ('' = keine). Meist die normale Datenquelle des Bausteins; das
// Nachschlage-Feld nennt in seiner SatzWahl eine andere Prop (Regel 2, kein
// Bausteintyp-Wissen). Wer die Feldpaare eines Gebers anbietet oder prueft,
// MUSS diese Quelle nehmen: die Felder der falschen Tabelle waeren still
// wertlos.
export function satzQuelleIdVon(node: BlockNode | undefined): string {
  if (!node) return ''
  const wahl = getBlockDefinition(node.type)?.satzWahl
  const wert = node.props[wahl?.quelleProp ?? QUELLE_PROP]
  return typeof wert === 'string' ? wert : ''
}

// Ist dieser Baustein ein Auswahl-GEBER? HERGELEITET, nicht angemeldet
// (2026-08-06): Geber ist, wer (1) den Bediener einen Satz herausgreifen laesst
// (Registry: satzWahl, notfalls zustandsabhaengig) UND (2) dafuer wirklich eine
// Datenquelle traegt. Beides muss stimmen, sonst gaebe es nichts abzugeben:
// eine Tabelle ohne Quelle zeigt nur Platzhalter, und ein Formularfeld vom Typ
// Text hat gar kein Fenster, aus dem der Bediener waehlen koennte.
//
// Kein Bausteintyp-Wissen hier (Regel 2) — Trenner und Knopf fallen von selbst
// raus, weil sie keine SatzWahl deklarieren.
export function istAuswahlGeber(node: BlockNode | undefined): boolean {
  if (!node) return false
  const wahl = getBlockDefinition(node.type)?.satzWahl
  if (!wahl) return false
  if (!propertySichtbar(wahl.wenn, node.props)) return false
  return satzQuelleIdVon(node) !== ''
}

// Alle Auswahl-GEBER der Maske in Baum-Reihenfolge. DIESELBE Wahrheit fuer
// Inspector, Steuerung (Parameterquelle „Feld der gewaehlten Zeile"), Export
// (data-ff-id) und Preflight: bietet der Editor einen Geber an, den der
// Preflight nicht kennt, blockt der Export etwas gerade Eingestelltes.
export function auswahlGeberImBaum(tree: BlockTree): BlockNode[] {
  const result: BlockNode[] = []
  const visit = (node: BlockNode | undefined): void => {
    if (!node) return
    if (istAuswahlGeber(node)) result.push(node)
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
