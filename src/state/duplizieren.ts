// duplizieren — eine Kopie, die auf SICH SELBST zeigt.
//
// Bis 2026-08-11 vergab das Klonen frische Knoten-ids, kopierte die Verweise IN
// den Bausteinen aber unveraendert mit (`cloneSubtree` in treeOps, einziger
// Aufrufer Editor.duplicateBlock): der kopierte Knopf las weiter das Feld des
// ORIGINALS, die kopierte Folgetabelle folgte dem Original-Geber. Nichts sah
// kaputt aus — die Kopie arbeitete still am falschen Baustein.
//
// Reines Fach wie treeOps/rasterOps: Baum rein, neuer Baum raus, null = nichts
// zu tun. Wer den Baum uebernimmt, die Historie schreibt und meldet, bleibt
// allein der Store.
//
// ZWEI Phasen, und die Reihenfolge IST der Punkt:
//   1. Knoten kopieren und dabei `alte id -> neue id` merken;
//   2. DANACH die Verweise umschreiben — vorher ist die neue id des Nachbarn
//      noch nicht bekannt.
//
// Regel je Verweis: zeigt er auf einen MITKOPIERTEN Knoten, bekommt er dessen
// neue id. Zeigt er nach ausserhalb des kopierten Teilbaums, bleibt er extern —
// das ist Absicht, nicht Nachlaessigkeit: der kopierte Knopf soll dasselbe
// Popup oeffnen und dieselbe Fremdtabelle lesen wie das Original.

import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { type ActionParamBinding, type ActionStep, type BlockEventsMap } from '../core/data/aktionen'
import { AUSWAHL_FOLGE_PROP } from '../core/data/auswahlFolge'
import { deepClone } from '../lib/deepClone'
import { istSeitenBaustein } from './pageOps'
import { freiePositionFuerKopie } from './rasterOps'

// Antwort auf „welche neue id hat dieser Baustein?" — undefined = er wurde
// nicht mitkopiert, der Verweis bleibt unangetastet.
export type NeueIdFuer = (alteId: string) => string | undefined

// Alle Felder, die heute die id eines ANDEREN Bausteins derselben Maske tragen.
// Nachgezaehlt 2026-08-11 gegen `stepProblem` (core/data/schrittPruefung.ts) —
// dort steht dieselbe Liste als Gueltigkeitspruefung, und wer dort einen Fall
// ergaenzt, muss ihn hier ebenfalls kennen:
//
//   props.folgtAuswahl[].geberId       „Auswahl folgen" (core/data/auswahlFolge)
//   props[<kind 'seite'>]              Seite der Navi (N2) — Registry-gefuehrt,
//                                      darum ohne Zeile in dieser Liste zu
//                                      pflegen. In `stepProblem` hat sie
//                                      nichts verloren: das ist die Pruefliste
//                                      fuer KETTEN-Schritte, und die Navi ist
//                                      keiner.
//   events[..][].popupId               Popup oeffnen / schliessen
//   events[..][].params[].blockId      Parameterquelle „Wert eines Bausteins"
//   events[..][].extraParams[].blockId dieselbe Quelle, Zusatzparameter
//
// KEINE Baustein-ids und darum unberuehrt: `dataSourceId` und `relationId`
// zeigen in die Bibliotheken (die beim Duplizieren gar nicht mitkopiert
// werden), `step_result.value` zeigt auf einen Schritt DERSELBEN Kette, die
// vollstaendig mitkopiert wird.
export function schreibeBlockReferenzenUm(node: BlockNode, neueIdFuer: NeueIdFuer): BlockNode {
  const folgen = umgeschriebeneFolgen(node.props[AUSWAHL_FOLGE_PROP], neueIdFuer)
  const events = node.events === undefined
    ? undefined
    : umgeschriebeneEreignisse(node.events, neueIdFuer)
  // Seiten-Verweise (kind 'seite', heute der Navi-Eintrag): sie zeigen auf
  // eine SEITE der Maske. Welche Props das sind, sagt die Registry — so
  // kann ein neuer Baustein mit Seiten-Verweis hier nicht vergessen werden
  // (Regel 2). Ohne das zeigte eine mitkopierte Navi still auf die
  // Original-Ansicht: genau die Fehlerklasse, gegen die A5 gebaut wurde.
  const seiten = umgeschriebeneSeiten(node, neueIdFuer)
  const propsNeu = folgen !== node.props[AUSWAHL_FOLGE_PROP] || seiten !== null
  const eventsNeu = events !== undefined && events !== node.events
  if (!propsNeu && !eventsNeu) return node
  return {
    ...node,
    ...(propsNeu
      ? { props: { ...node.props, ...seiten, [AUSWAHL_FOLGE_PROP]: folgen } }
      : {}),
    ...(eventsNeu ? { events } : {}),
  }
}

// Neue id oder undefined. Ein leerer Verweis („noch nichts gewaehlt") bleibt
// leer — er zeigt auf keinen Baustein.
function ersatzId(alt: unknown, neueIdFuer: NeueIdFuer): string | undefined {
  if (typeof alt !== 'string' || alt === '') return undefined
  return neueIdFuer(alt)
}

// Die Folgen-Liste liegt als ROHE Prop im Baum. Defensiv lesen und nur das EINE
// Feld tauschen, statt die Liste durch `auswahlFolgenAus` zu schicken: das
// normalisiert (und verliert dabei z. B. Feldpaare ueber der Obergrenze) —
// beim Kopieren darf nichts verloren gehen.
function umgeschriebeneFolgen(roh: unknown, neueIdFuer: NeueIdFuer): unknown {
  if (!Array.isArray(roh)) return roh
  let geaendert = false
  const naechste = roh.map((eintrag: unknown) => {
    if (eintrag === null || typeof eintrag !== 'object' || Array.isArray(eintrag)) return eintrag
    const felder = eintrag as Record<string, unknown>
    const ziel = ersatzId(felder.geberId, neueIdFuer)
    if (ziel === undefined) return eintrag
    geaendert = true
    return { ...felder, geberId: ziel }
  })
  return geaendert ? naechste : roh
}

// Alle Seiten-Verweise eines Knotens (Registry: kind 'seite') mit neuen ids.
// null = nichts zu tauschen.
function umgeschriebeneSeiten(
  node: BlockNode,
  neueIdFuer: NeueIdFuer,
): Record<string, unknown> | null {
  let treffer: Record<string, unknown> | null = null
  for (const p of getBlockDefinition(node.type)?.customProperties ?? []) {
    if (p.kind !== 'seite') continue
    const ziel = ersatzId(node.props[p.attributeName], neueIdFuer)
    if (ziel === undefined) continue
    treffer = { ...(treffer ?? {}), [p.attributeName]: ziel }
  }
  return treffer
}

function umgeschriebeneBindung(
  bindung: ActionParamBinding,
  neueIdFuer: NeueIdFuer,
): ActionParamBinding {
  const ziel = ersatzId(bindung.blockId, neueIdFuer)
  return ziel === undefined ? bindung : { ...bindung, blockId: ziel }
}

function umgeschriebenerSchritt(schritt: ActionStep, neueIdFuer: NeueIdFuer): ActionStep {
  if (schritt.type === 'POPUP_OPEN' || schritt.type === 'POPUP_CLOSE') {
    const ziel = ersatzId(schritt.popupId, neueIdFuer)
    return ziel === undefined ? schritt : { ...schritt, popupId: ziel }
  }
  if (schritt.type !== 'RELATION') return schritt
  const params = schritt.params.map((b) => umgeschriebeneBindung(b, neueIdFuer))
  const extraParams = schritt.extraParams.map((b) => umgeschriebeneBindung(b, neueIdFuer))
  const geaendert = params.some((b, i) => b !== schritt.params[i])
    || extraParams.some((b, i) => b !== schritt.extraParams[i])
  return geaendert ? { ...schritt, params, extraParams } : schritt
}

function umgeschriebeneEreignisse(
  events: BlockEventsMap,
  neueIdFuer: NeueIdFuer,
): BlockEventsMap {
  let geaendert = false
  const naechste: BlockEventsMap = {}
  for (const [key, kette] of Object.entries(events)) {
    const neueKette = kette.map((s) => umgeschriebenerSchritt(s, neueIdFuer))
    if (neueKette.some((s, i) => s !== kette[i])) geaendert = true
    naechste[key] = neueKette
  }
  return geaendert ? naechste : events
}

// Phase 1: Knoten + Nachfahren mit frischen ids kopieren. Phase 2: Verweise
// umschreiben. Gibt nur die NEUEN Knoten zurueck (der Aufrufer haengt sie ein).
export function kloneTeilbaum(
  tree: BlockTree,
  id: string,
): { nodes: BlockTree; kopieId: string } {
  const nodes: BlockTree = {}
  const neueIds = new Map<string, string>()
  const kopiere = (quellId: string, parentId: string | null): string => {
    const quelle = tree[quellId]
    const neueId = crypto.randomUUID()
    neueIds.set(quellId, neueId)
    const childIds = quelle.childIds.map((c) => kopiere(c, neueId))
    nodes[neueId] = {
      id: neueId,
      type: quelle.type,
      props: deepClone(quelle.props),
      // Aktionsketten gehoeren zum Baustein — die Kopie behaelt sie.
      ...(quelle.events ? { events: deepClone(quelle.events) } : {}),
      parentId,
      childIds,
    }
    return neueId
  }
  const kopieId = kopiere(id, tree[id].parentId)
  for (const neueId of neueIds.values()) {
    nodes[neueId] = schreibeBlockReferenzenUm(nodes[neueId], (alt) => neueIds.get(alt))
  }
  return { nodes, kopieId }
}

// Einen Teilbaum verdoppeln: die Kopie landet im SELBEN Elternteil, direkt
// hinter dem Original.
//
// Eine SEITE (Popup, pageBlock) wird noch NICHT dupliziert und meldet null:
// eine zweite Seite braucht einen eindeutigen Klarnamen, eine Entscheidung
// ueber die aktive Seite und die Platzierung ihres Inhalts — das kommt mit dem
// Popup-Rastervertrag (Plan C3.1). Ueber die Oberflaeche ist der Fall heute
// nicht erreichbar (ein Seiten-Baustein erscheint nie im Fluss, ist also nicht
// anklickbar); der Riegel sitzt hier, damit er es auch nicht wird, wenn die
// Oberflaeche sich aendert.
export function dupliziereTeilbaum(
  tree: BlockTree,
  id: string,
): { tree: BlockTree; kopieId: string } | null {
  const original = tree[id]
  if (!original || id === ROOT_ID || original.parentId === null) return null
  if (istSeitenBaustein(original)) return null
  const parent = tree[original.parentId]
  if (!parent) return null
  const { nodes, kopieId } = kloneTeilbaum(tree, id)
  nodes[kopieId] = freiePositionFuerKopie(tree, parent.id, nodes[kopieId])
  const childIds = [...parent.childIds]
  childIds.splice(parent.childIds.indexOf(id) + 1, 0, kopieId)
  return {
    tree: { ...tree, ...nodes, [parent.id]: { ...parent, childIds } },
    kopieId,
  }
}
