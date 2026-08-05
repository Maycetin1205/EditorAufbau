// treeQuery
// Reine Baum-Abfragen ohne Store-Bindung. Die Musterkarte hat EINE
// Definition im ganzen System: die ERSTE Nachfahren-Instanz des
// templateChild-Typs in Baumreihenfolge (DFS). Dieselbe Definition nutzen
// der Editor (Muster-Markierung + Löschschutz), der Export (<template>-
// Verpackung) und die Laufzeit (seRuntime klont das template-Element).

import { ROOT_ID, type BlockNode, type BlockTree } from './BlockData'
import type { ActionValueSpot, BindableSpot } from './BlockDefinition'
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
export const QUELLE_PROP = 'source'

// Traegt dieser Baustein GERADE eine eigene Datenquelle? Registry-Faehigkeit
// (acceptsDataSource), notfalls zustandsabhaengig: das Formularfeld traegt als
// Nachschlage-Feld keine — dort kommt der Wert aus dem Fenster der
// Nachschlage-Quelle, und ein zweiter Quellen-Waehler daneben taete nichts.
//
// Inspector (Sektion „Daten"), Export (SEFILELOOP + Attribute), Preflight
// (Blocker) und quellenOps (Reichweite) fragen alle DIESE Stelle: was der
// Inspector nicht anbietet, darf der Export nicht mitnehmen und der Preflight
// nicht verlangen. Eine liegen gebliebene Quelle bleibt in den Props stehen —
// unsichtbar ist nicht geloescht.
export function traegtEigeneQuelle(node: BlockNode | undefined): boolean {
  if (!node) return false
  const kann = getBlockDefinition(node.type)?.acceptsDataSource
  if (!kann) return false
  return kann === true || propertySichtbar(kann.wenn, node.props)
}

// Die Stellen, die an DIESEM Baustein GERADE bindbar sind (BindableSpot.wenn).
// Editor (Klick-Ziel, Bindungs-Picker, Klarname-Vorschau), Export (Attribut)
// und Preflight (Blocker) fragen dieselbe Stelle — sonst liesse der Editor eine
// Bindung anklicken, die der Export weglaesst, oder der Preflight blockte eine,
// die nirgends zu sehen ist.
export function bindbareStellenVon(node: BlockNode | undefined): readonly BindableSpot[] {
  if (!node) return []
  const stellen = getBlockDefinition(node.type)?.bindableSpots ?? []
  return stellen.filter((s) => propertySichtbar(s.wenn, node.props))
}

// Die Quelle, um die es bei der AUSWAHL an diesem Baustein geht — als
// Vorlagen-id ('' = keine). Sie beantwortet BEIDE Seiten derselben Frage:
//   - als GEBER: aus ihr stammt der herausgegriffene Satz (die Felder LINKS
//     im Feldpaar, fromField);
//   - als FOLGER: ihre Zeilen engt die Auswahl ein (die Felder RECHTS,
//     toField).
// Meist ist das die normale Datenquelle des Bausteins. Das Nachschlage-Feld
// nennt in seiner SatzWahl eine andere Prop (Regel 2, kein Bausteintyp-Wissen
// hier): sein Fenster zeigt die Zeilen der NACHSCHLAGE-Quelle — aus ihr stammt
// der uebernommene Satz, und genau sie filtert eine Folge ein. Dass beide
// Richtungen dieselbe Quelle nennen, ist kein Zufall: man waehlt aus den
// Zeilen, die man zeigt.
//
// Zustandsabhaengig wie die SatzWahl selbst: steht das Feld wieder auf „Text",
// spielt seine Nachschlage-Quelle keine Rolle mehr — dann gilt die eigene
// Datenquelle. Wer Feldpaare anbietet oder prueft, MUSS diese Quelle nehmen:
// die Felder der falschen Tabelle waeren still wertlos.
export function auswahlQuelleIdVon(node: BlockNode | undefined): string {
  if (!node) return ''
  const wahl = getBlockDefinition(node.type)?.satzWahl
  const prop = wahl && propertySichtbar(wahl.wenn, node.props)
    ? wahl.quelleProp ?? QUELLE_PROP
    : QUELLE_PROP
  const wert = node.props[prop]
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
  return auswahlQuelleIdVon(node) !== ''
}

// Darf dieser Baustein GERADE einer Auswahl folgen? DIESELBE Herleitung wie
// beim Geber, nur andersherum: folgen darf, wer (1) es laut Registry kann
// (kannAuswahlFolgen) UND (2) wirklich Zeilen hat, die eine Auswahl einengen
// koennte. Ohne Quelle gibt es nichts zu filtern — eine eingestellte Folge
// saehe fertig aus und tat in der Maske stumm nie etwas (Regel 4). Die Zeilen
// stehen dort, wo auch der Satz herkaeme (auswahlQuelleIdVon): beim
// Nachschlage-Feld in der NACHSCHLAGE-Quelle, sonst in der eigenen.
//
// Inspector (Sektion), Export (Attribut) und Preflight (Blocker) fragen alle
// DIESE Stelle: was der Inspector nicht anbietet, darf der Export nicht
// mitnehmen und der Preflight nicht verlangen — sonst blockte er wegen einer
// Einstellung, die der Bauer nirgends sieht. Eine daheim gebliebene Folge in
// den Props bleibt liegen (unsichtbar ist nicht geloescht): haengt der Bauer
// die Quelle wieder an, gilt sie wieder.
//
// Bis 2026-08-06 trug kannAuswahlFolgen dafuer eine Zustands-Bedingung: das
// Formularfeld durfte als Nachschlage-Feld gar nicht folgen. Das war die
// Vorstufe — inzwischen folgt dort das FENSTER (es zeigt nur die Zeilen zur
// Auswahl des Gebers), und die Bedingung ist ersatzlos weg. Was blieb, ist
// diese Herleitung.
export function darfAuswahlFolgen(node: BlockNode | undefined): boolean {
  if (!node) return false
  if (getBlockDefinition(node.type)?.kannAuswahlFolgen !== true) return false
  return auswahlQuelleIdVon(node) !== ''
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
