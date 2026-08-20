import { ROOT_ID, type BlockNode, type BlockTree } from './BlockData'
import type { ActionValueSpot, BindableSpot } from './BlockDefinition'
import { getBlockDefinition } from './blockRegistry'
import { propertySichtbar } from './PropertyDescription'

export interface ActionValueTarget {
  node: BlockNode
  spot: ActionValueSpot
}

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

export const QUELLE_PROP = 'source'

export function quellenIdsInKettenVon(node: BlockNode): string[] {
  const ids: string[] = []
  for (const event of getBlockDefinition(node.type)?.blockEvents ?? []) {
    for (const step of node.events?.[event.key] ?? []) {
      if (step.type !== 'RELATION') continue
      for (const binding of [...step.params, ...step.extraParams]) {
        if (binding.source !== 'data_field') continue
        const id = binding.dataSourceId ?? ''
        if (id !== '') ids.push(id)
      }
    }
  }
  return ids
}

export function relationIdsVon(node: BlockNode): string[] {
  const def = getBlockDefinition(node.type)
  const ids: string[] = []
  for (const prop of def?.customProperties ?? []) {
    if (prop.kind !== 'relation') continue
    const wert = node.props[prop.attributeName]
    if (typeof wert === 'string' && wert !== '') ids.push(wert)
  }
  for (const event of def?.blockEvents ?? []) {
    for (const step of node.events?.[event.key] ?? []) {
      if (step.type === 'RELATION' && step.relationId !== '') ids.push(step.relationId)
    }
  }
  return ids
}

export function traegtEigeneQuelle(node: BlockNode | undefined): boolean {
  if (!node) return false
  const kann = getBlockDefinition(node.type)?.acceptsDataSource
  if (!kann) return false
  return kann === true || propertySichtbar(kann.wenn, node.props)
}

// Traegt dieser Baustein Kopfzeilen im Inspector? Genau dann, wenn er eine
// eigene Datenquelle fuehren kann oder Ereignisse mit Aktionsketten hat.
// Inspector und Kopfzeilen-Leiste lesen dieselbe Antwort.
export function traegtInspectorZeilen(node: BlockNode | undefined): boolean {
  if (!node) return false
  if (traegtEigeneQuelle(node)) return true
  // Auch wer KEINE eigene Quelle fuehrt, aber einer Auswahl folgen darf,
  // braucht die Datenzeile — sonst gaebe es die Einstellung, aber keinen Weg
  // zu ihr (Nutzer-Befund 2026-08-20, direkt nach der Umstellung auf
  // `ohneDaten`: die Karte durfte folgen und kam nicht an das Fenster).
  if (darfAuswahlFolgen(node)) return true
  return (getBlockDefinition(node.type)?.blockEvents ?? []).length > 0
}

export function bindbareStellenVon(node: BlockNode | undefined): readonly BindableSpot[] {
  if (!node) return []
  const stellen = getBlockDefinition(node.type)?.bindableSpots ?? []
  return stellen.filter((s) => propertySichtbar(s.wenn, node.props))
}

export function auswahlQuelleIdVon(node: BlockNode | undefined): string {
  if (!node) return ''
  const wahl = getBlockDefinition(node.type)?.satzWahl
  const prop = wahl && propertySichtbar(wahl.wenn, node.props)
    ? wahl.quelleProp ?? QUELLE_PROP
    : QUELLE_PROP
  const wert = node.props[prop]
  return typeof wert === 'string' ? wert : ''
}

export function istAuswahlGeber(node: BlockNode | undefined): boolean {
  if (!node) return false
  const wahl = getBlockDefinition(node.type)?.satzWahl
  if (!wahl) return false
  if (!propertySichtbar(wahl.wenn, node.props)) return false
  return auswahlQuelleIdVon(node) !== ''
}

// Wer darf der Auswahl eines anderen Bausteins folgen? Jeder, ausser den
// Bausteinen ohne Datenbezug (Navi, Trennlinie). Die zweite Bedingung von
// frueher — „muss eine eigene Quelle haben" — ist WEG: ein Baustein OHNE
// eigene Quelle folgt, indem er die gewaehlte Zeile selbst zeigt (Bild, Knopf,
// Datum); einer MIT eigener Quelle schraenkt seine Zeilen ueber die
// Schluesselpaare ein (Tabelle, Kanban, Formularfeld). Zwei Bedeutungen,
// dieselbe Einstellung — kein Sondercode je Bausteintyp (Regel 2).
export function darfAuswahlFolgen(node: BlockNode | undefined): boolean {
  if (!node) return false
  if (getBlockDefinition(node.type)?.ohneDaten === true) return false
  // Folgen kann, wer Daten ZEIGT — sonst waere die Einstellung eine Anzeige
  // ohne Wirkung und reiste als toter Attributwert in den Export. Zwei Wege
  // dorthin, und beide zaehlen: eine eigene Quelle (dann schraenkt die
  // gewaehlte Zeile die eigenen Zeilen ein) oder eine bindbare Stelle (dann
  // IST die gewaehlte Zeile die Zeile des Bausteins).
  return auswahlQuelleIdVon(node) !== '' || bindbareStellenVon(node).length > 0
}

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
